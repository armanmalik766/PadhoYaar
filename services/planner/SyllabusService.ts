import { syllabusController } from '../api/syllabusController.ts';
import crypto from 'crypto';

export interface FlatTopic {
    topicId: string;
    topicPath: string;
    subject: string;
    description?: string;
    estimatedMinutes: number;
}

// Generate a stable hash for the topic ID
const generateTopicId = (path: string): string => {
    return crypto.createHash('md5').update(path).digest('hex');
};

export const syllabusService = {
    /**
     * Flattens the hierarchical syllabus data into a linear list of topics.
     * This allows for easier sequential planning.
     */
    getFlatSyllabus: (): FlatTopic[] => {
        const sections = syllabusController.getData(); // Get all data
        const flatList: FlatTopic[] = [];

        sections.forEach(section => {
            const subject = section.subject;

            section.topics.forEach(topic => {
                // If topic has subtopics, flatten them
                if (topic.subtopics && topic.subtopics.length > 0) {
                    processSubtopics(topic.subtopics, `${subject} > ${topic.title}`, subject, flatList);
                } else {
                    // It's a leaf node itself (unlikely based on structure, but good to handle)
                    const path = `${subject} > ${topic.title}`;
                    flatList.push({
                        topicId: generateTopicId(path),
                        topicPath: path,
                        subject: subject,
                        description: '',
                        estimatedMinutes: calculateDuration(path)
                    });
                }
            });
        });

        return flatList;
    }
};

const processSubtopics = (subtopics: any[], parentPath: string, subject: string, list: FlatTopic[]) => {
    subtopics.forEach(sub => {
        const currentPath = `${parentPath} > ${sub.title}`;

        if (sub.subtopics && sub.subtopics.length > 0) {
            processSubtopics(sub.subtopics, currentPath, subject, list);
        } else {
            list.push({
                topicId: generateTopicId(currentPath),
                topicPath: currentPath,
                subject: subject,
                description: sub.description,
                estimatedMinutes: calculateDuration(currentPath)
            });
        }
    });
};
const calculateDuration = (path: string): number => {
    // History > Ancient India > Indus Valley > Town Planning
    const depth = path.split('>').length;

    // Depth 1 (Subject): N/A usually
    // Depth 2 (Topic): 60 mins (e.g. Ancient India)
    // Depth 3 (Subtopic): 90 mins (e.g. Indus Valley)
    // Depth 4+ (Micro): 120 mins (e.g. Town Planning)

    if (depth <= 2) return 40;
    if (depth === 3) return 60;
    return 60;
};
