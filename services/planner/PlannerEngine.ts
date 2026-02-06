import { SyllabusTracker, Task, User, IUser, ITask, ISyllabusTracker } from '../../models/index.ts';
import { syllabusService, FlatTopic } from './SyllabusService.ts';
import { syllabusController } from '../api/syllabusController.ts';
import crypto from 'crypto';

const generateTopicId = (path: string) => crypto.createHash('md5').update(path).digest('hex');

export const plannerEngine = {
    /**
     * Generates a daily plan for the user.
     * 1. Fetches due Revisions.
     * 2. Fetches new Topics if time permits.
     * 3. Creates Task entries in DB.
     * 
     * @param userId 
     * @param dateString YYYY-MM-DD
     */
    generateDailyPlan: async (userId: string, dateString: string) => {
        // 1. Get User Settings (Daily Hours)
        const user = await User.findOne({ email: userId });

        let dailyMinutes = 360; // Default 6 hours
        if (user && user.dailyHoursGoal) {
            dailyMinutes = user.dailyHoursGoal * 60;
        }

        let availableMinutes = dailyMinutes;
        const tasksToCreate: any[] = [];

        // 2. REVISION: Fetch topics due for revision
        // nextRevisionDate <= today
        const todayEnd = new Date(dateString);
        todayEnd.setHours(23, 59, 59, 999);

        const dueRevisions = await SyllabusTracker.find({
            userId,
            status: { $in: ['COMPLETED', 'REVISION'] },
            nextRevisionDate: { $lte: todayEnd }
        }).sort({ nextRevisionDate: 1 });

        // 1.5 Fetch existing tasks for today to avoid duplicates and preserve history
        const existingTasks = await Task.find({ userId, date: dateString });
        const existingTopicIds = new Set(existingTasks.map(t => t.topicId).filter(Boolean));

        for (const rev of dueRevisions) {
            if (availableMinutes <= 0) break;
            if (existingTopicIds.has(rev.topicId)) continue; // Already scheduled/done/skipped today

            const duration = Math.min(60, availableMinutes); // Max 60 mins per revision session
            tasksToCreate.push({
                userId,
                date: dateString,
                title: `Revise: ${rev.topicPath.split('>').pop()?.trim()}`,
                type: 'SYLLABUS_REVISION', // Custom type
                status: 'PENDING',
                description: `Revision Level ${rev.revisionLevel} - ${rev.topicPath}`,
                duration,
                yield: 'HIGH',
                subTasks: ['Quick Read', 'Recall Key Facts'],
                topicId: rev.topicId
            });

            availableMinutes -= duration;
        }

        // 3a. RESUME STUDY: Prioritize topics already started but not finished
        // Status = STUDY, completedMinutes < plannedMinutes
        if (availableMinutes > 30) {
            const todayEnd = new Date(dateString);
            todayEnd.setHours(23, 59, 59, 999);

            const resumeTopics = await SyllabusTracker.find({
                userId,
                status: 'STUDY',
                $or: [
                    { nextRevisionDate: { $exists: false } },
                    { nextRevisionDate: null },
                    { nextRevisionDate: { $lte: todayEnd } }
                ]
            }).sort({ lastStudiedDate: 1 }); // Oldest first to finish backlog

            for (const tracker of resumeTopics) {
                if (availableMinutes <= 30) break;
                if (existingTopicIds.has(tracker.topicId)) continue; // Already handled today

                const remaining = Math.max(tracker.plannedMinutes - tracker.completedMinutes, 0);
                if (remaining < 15) continue; // Skip if almost done (edge case)

                const allocated = Math.min(remaining, availableMinutes, 60); // Max 60 per block

                tasksToCreate.push({
                    userId,
                    date: dateString,
                    title: `Study (Cont.): ${tracker.topicPath.split('>').pop()?.trim()}`,
                    type: 'SYLLABUS_STUDY',
                    status: 'PENDING',
                    description: `Resume - ${tracker.topicPath}`,
                    duration: allocated,
                    yield: 'HIGH',
                    subTasks: ['Continue Reading', 'Update Notes'],
                    topicId: tracker.topicId
                });

                availableMinutes -= allocated;
            }
        }

        // 3b. NEW STUDY: If time remains, allocate new topics
        if (availableMinutes > 30) {
            // Get linear syllabus
            const fullSyllabus = syllabusService.getFlatSyllabus();

            // Get user's progress to exclude started topics
            // We verify against SyllabusTracker for ANY entry matching topicId (PENDING, STUDY, REVISION, COMPLETED)
            const existingTrackers = await SyllabusTracker.find({ userId }).select('topicId');
            const startedTopicIds = new Set(existingTrackers.map((t: any) => t.topicId));

            // Find first topic NOT in startedTopicIds
            const newTopics = fullSyllabus.filter(t => !startedTopicIds.has(t.topicId));

            for (const topic of newTopics) {
                if (availableMinutes <= 30) break; // Minimum 30 mins for a study block
                if (existingTopicIds.has(topic.topicId)) continue;

                // Allocation per topic (estimated or remaining time)
                const allocated = Math.min(topic.estimatedMinutes, availableMinutes, 60); // Cap at 60 for new blocks too

                tasksToCreate.push({
                    userId,
                    date: dateString,
                    title: `Study: ${topic.topicPath.split('>').pop()?.trim()}`,
                    type: 'SYLLABUS_STUDY',
                    status: 'PENDING',
                    description: `New Topic - ${topic.topicPath}`,
                    duration: allocated,
                    yield: 'HIGH',
                    subTasks: ['Read Material', 'Make Notes'],
                    topicId: topic.topicId
                });

                // CREATE TRACKER immediately 
                await SyllabusTracker.create({
                    userId,
                    topicId: topic.topicId,
                    topicPath: topic.topicPath,
                    subject: topic.subject,
                    status: 'STUDY',
                    plannedMinutes: topic.estimatedMinutes,
                    completedMinutes: 0,
                    revisionLevel: 0,
                    lastStudiedDate: new Date()
                });

                // Update local loop state
                startedTopicIds.add(topic.topicId);
                availableMinutes -= allocated;
            }
        }

        // 4. Save to DB
        // Clear existing generated tasks for today to avoid duplicates if re-generated
        await Task.deleteMany({
            userId,
            date: dateString,
            type: { $in: ['SYLLABUS_STUDY', 'SYLLABUS_REVISION'] },
            status: 'PENDING' // Only wipe pending tasks, keep Completed/Skipped
        });

        await Task.insertMany(tasksToCreate);

        return tasksToCreate;
    },

    /**
     * Marks a study block as complete and updates revision schedule.
     */
    completeBlock: async (userId: string, taskId: string) => {
        const task = await Task.findById(taskId);
        if (!task || !task.topicId) return null;

        // 1. Update Task
        task.status = 'COMPLETED';
        await task.save();

        // 2. Update Tracker
        const tracker = await SyllabusTracker.findOne({ userId, topicId: task.topicId });
        if (tracker) {
            tracker.completedMinutes += (task.duration || 0);
            tracker.lastStudiedDate = new Date();

            // Check completion
            // If >= 45% done, consider it completed (Aggressive completion for user satisfaction)
            if (tracker.completedMinutes >= (tracker.plannedMinutes * 0.45)) {
                // Topic Finished -> Schedule Revision 1
                tracker.status = 'COMPLETED';

                // Calculate next revision date
                let daysToAdd = 1;
                if (tracker.revisionLevel === 1) daysToAdd = 7;
                if (tracker.revisionLevel === 2) daysToAdd = 30;

                const nextDate = new Date();
                nextDate.setDate(nextDate.getDate() + daysToAdd);

                tracker.nextRevisionDate = nextDate;
                tracker.revisionLevel += 1;
            } else {
                // Not finished yet, stay in STUDY
                tracker.status = 'STUDY';
            }

            await tracker.save();
        }

        return task;
    },

    skipBlock: async (userId: string, taskId: string, daysToSkip: number = 0) => {
        const task = await Task.findById(taskId);
        if (!task) return null;

        task.status = 'SKIPPED';
        await task.save();

        // Snooze logic: If daysToSkip > 0, postpone the topic
        if (task.topicId && daysToSkip > 0) {
            const tracker = await SyllabusTracker.findOne({ userId, topicId: task.topicId });
            if (tracker) {
                const snoozeDate = new Date();
                snoozeDate.setDate(snoozeDate.getDate() + daysToSkip);
                // We reuse nextRevisionDate for snoozing 'STUDY' topics as well
                tracker.nextRevisionDate = snoozeDate;
                await tracker.save();
            }
        }

        return task;
    },

    /**
     * Returns the full syllabus tree with status for each node.
     */
    getSyllabusStatus: async (userId: string) => {
        // 1. Get Static Syllabus
        const sections = syllabusController.getData();

        // 2. Get User Progress
        const trackers = await SyllabusTracker.find({ userId });
        const trackerMap = new Map(trackers.map(t => [t.topicPath, t]));

        // 3. Helper to recursively process nodes
        const processNode = (node: any, parentPath: string, subject: string) => {
            const currentPath = parentPath ? `${parentPath} > ${node.title}` : `${subject} > ${node.title}`;
            const topicId = generateTopicId(currentPath);
            const tracker = trackerMap.get(currentPath);

            let status = 'PENDING';
            let completedDate = null;

            // If found in tracker, use that status
            if (tracker) {
                status = tracker.status;
                if (status === 'COMPLETED') completedDate = tracker.lastStudiedDate;
            }

            // Recurse for children
            let children: any[] = [];
            if (node.subtopics && node.subtopics.length > 0) {
                children = node.subtopics.map((sub: any) => processNode(sub, currentPath, subject));

                // Aggregate status from children if not explicitly tracked
                // If all children are COMPLETED -> Parent is COMPLETED
                const allCompleted = children.every(c => c.status === 'COMPLETED');
                const someStarted = children.some(c => c.status !== 'PENDING');

                if (allCompleted) status = 'COMPLETED';
                else if (someStarted && status === 'PENDING') status = 'IN_PROGRESS';
            } else if (node.topics && node.topics.length > 0) {
                // Handle Section -> Topics level
                children = node.topics.map((t: any) => processNode(t, currentPath, subject));
            }

            return {
                title: node.title,
                topicId,
                topicPath: currentPath,
                status, // PENDING, IN_PROGRESS, STUDY, COMPLETED
                completedDate,
                children
            };
        };

        // 4. Transform Data
        const tree = sections.map(section => {
            const children = section.topics.map(topic => processNode(topic, section.subject, section.subject)); // Pass subject as parent for top level? No, parentPath is prefix.
            // Accessing section.subject is correct.
            // Actually, processNode's parentPath logic:
            // For Top Level Topic: parentPath should be Subject name? No, wait.
            // Syllabus structure: Section(Subject) -> Topics -> Subtopics
            // Path usually: Subject > Topic > Subtopic

            // Let's adjust helper call for top level topics:
            // parentPath should be 'Subject' so result is "Subject > Topic"

            return {
                title: section.subject,
                type: 'SUBJECT',
                children: section.topics.map(topic => processNode(topic, section.subject, section.subject))
            };
        });

        return tree;
    },

    toggleTopic: async (userId: string, topicPath: string, status: 'COMPLETED' | 'PENDING') => {
        // Hash path to get ID
        const topicId = generateTopicId(topicPath);
        const subject = topicPath.split('>')[0].trim();

        let tracker = await SyllabusTracker.findOne({ userId, topicId });

        if (status === 'COMPLETED') {
            if (!tracker) {
                tracker = new SyllabusTracker({
                    userId,
                    topicId,
                    topicPath,
                    subject,
                    status: 'COMPLETED',
                    plannedMinutes: 60, // Default estimate
                    completedMinutes: 60,
                    lastStudiedDate: new Date(),
                    revisionLevel: 1,
                    nextRevisionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Schedule rev 1 in 7 days
                });
            } else {
                tracker.status = 'COMPLETED';
                tracker.completedMinutes = tracker.plannedMinutes; // Assume done
                tracker.lastStudiedDate = new Date();
                // Schedule next revision if not set
                if (!tracker.nextRevisionDate) {
                    tracker.nextRevisionDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                }
            }
        } else {
            // Unmarking
            if (tracker) {
                tracker.status = 'PENDING';
                tracker.completedMinutes = 0;
                tracker.revisionLevel = 0;
                tracker.nextRevisionDate = undefined;
                tracker.lastStudiedDate = undefined;
            }
        }

        if (tracker) await tracker.save();
        return tracker;
    },

    getStats: async (userId: string) => {
        const totalTopics = await SyllabusTracker.countDocuments({ userId });
        const completedTopics = await SyllabusTracker.countDocuments({ userId, status: 'COMPLETED' });

        // Revision Backlog (Due and not completed today)
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        const backlog = await SyllabusTracker.countDocuments({
            userId,
            status: { $in: ['COMPLETED', 'REVISION'] },
            nextRevisionDate: { $lte: todayEnd }
        });

        const totalMinutes = await SyllabusTracker.aggregate([
            { $match: { userId } },
            { $group: { _id: null, total: { $sum: "$completedMinutes" } } }
        ]);

        return {
            totalTopics,
            completedTopics,
            coveragePercentage: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0,
            revisionBacklog: backlog,
            totalStudyHours: totalMinutes.length > 0 ? Math.round(totalMinutes[0].total / 60) : 0
        };
    }
};
