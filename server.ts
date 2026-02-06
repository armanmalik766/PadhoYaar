import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Razorpay from 'razorpay';
import crypto from 'crypto';

import { getSyllabus } from './services/api/syllabusApi';
import { fetchRSSFeeds } from './services/api/rssService';
import { User, Task, QuizResult, SyllabusTracker } from './models/index';
import { plannerEngine } from './services/planner/PlannerEngine';

const app = express();
app.use(cors());
app.use(express.json());

/* ================= ENV ================= */
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb://192.168.1.9:27017/padhoyaar';

/* ================= DB ================= */
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB error', err));

/* ================= RAZORPAY ================= */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

/* ================= MODELS ================= */
/* ================= MODELS ================= */
// Models are now imported from ./models/index.ts



/* ================= PROGRESS & LEADERBOARD ================= */

// 3. User Progress API
app.get('/api/progress/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // 1. Overall Stats
    const totalStats = await QuizResult.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          averageScore: { $avg: '$percentage' }
        }
      }
    ]);

    // 2. Subject-wise Accuracy
    const subjectStats = await QuizResult.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$subject',
          avgAccuracy: { $avg: '$percentage' }
        }
      }
    ]);

    // 3. Last 7 Days Trend
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trendStats = await QuizResult.aggregate([
      {
        $match: {
          userId,
          date: { $gte: sevenDaysAgo }
        }
      },
      {
        $sort: { date: 1 }
      },
      {
        $project: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          score: '$percentage'
        }
      }
    ]);

    // Process Data
    const stats = totalStats[0] || { totalAttempts: 0, averageScore: 0 };
    const subjectWiseAccuracy: Record<string, number> = {};
    subjectStats.forEach((s) => {
      if (s._id) subjectWiseAccuracy[s._id] = Math.round(s.avgAccuracy);
    });

    const sortedSubjects = subjectStats.sort((a, b) => b.avgAccuracy - a.avgAccuracy);
    const bestSubject = sortedSubjects.length > 0 ? sortedSubjects[0]._id : 'N/A';
    const weakestSubject = sortedSubjects.length > 0 ? sortedSubjects[sortedSubjects.length - 1]._id : 'N/A';

    res.json({
      totalAttempts: stats.totalAttempts,
      averageScore: Math.round(stats.averageScore || 0),
      subjectWiseAccuracy,
      last7DaysTrend: trendStats,
      bestSubject,
      weakestSubject
    });

  } catch (error) {
    console.error('❌ Progress API error', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// 4. Global Leaderboard API
app.get('/api/leaderboard', async (req: Request, res: Response) => {
  try {
    const { period } = req.query; // 'weekly' or 'allTime' (default)

    let matchQuery: any = {};
    if (period === 'weekly') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      matchQuery.date = { $gte: sevenDaysAgo };
    }

    const leaderboard = await QuizResult.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$userId',
          averageScore: { $avg: '$percentage' },
          totalAttempts: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users', // Collection name matches User model (mongoose pluralizes)
          localField: '_id', // _id is userId string
          foreignField: '_id', // This might fail if userId is not _id, or if userId stored in QuizResult is simple string vs ObjectId
          // Wait, UserSchema defines email as unique but _id is auto. 
          // Auth flow: "const user = new User({ email, ...data });". 
          // user.id is usually _id. 
          // QuizResult stores userId. Assuming it comes from useStore().user.id which is likely _id.
          // BUT: mongoose stores _id as ObjectId. QuizResult.userId is defined as String.
          // We need to convert QuizResult.userId to ObjectId for lookup IF it matches _id.
          // Let's assume userId IS the string representation of _id.
          // $toObjectId might be needed if stored as string.
          let: { userIdStr: "$_id" },
          pipeline: [
            { $addFields: { userIdObj: { $toObjectId: "$$userIdStr" } } },
            { $match: { $expr: { $eq: ["$_id", "$userIdObj"] } } }
          ],
          as: 'userInfo'
        }
      },
      // Simpler lookup if we assume userId in QuizResult is exactly what's in User
      // Since we are not 100% sure of ID format stability (String vs ObjectId), let's try a simpler approach if possible.
      // actually the best way is to fetch user details separately or just assume name is stored? No, name is in User.
      // Let's stick to standard lookup but handle String vs ObjectId carefully.
      // Actually, in `server.ts` User model doesn't explicitly define _id as String, so it's ObjectId.
      // QuizResult.userId is String.
      // So we DO need conversion.
    ]);

    // Correction: Aggregation lookup with type conversion is tricky in older mongo versions or specific setups.
    // Let's TRY simpler: Fetch Top 50 aggregates -> Then populate names manually. safer.

    const topscorers = await QuizResult.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$userId',
          averageScore: { $avg: '$percentage' },
          totalAttempts: { $sum: 1 }
        }
      },
      { $sort: { averageScore: -1, totalAttempts: -1 } },
      { $limit: 50 }
    ]);

    // Populate User Details
    const result = await Promise.all(topscorers.map(async (item, index) => {
      let name = 'Unknown User';
      if (item._id && item._id !== 'guest') {
        try {
          const u = await User.findById(item._id);
          if (u && u.name) name = u.name;
          else if (u && u.email) name = u.email.split('@')[0];
        } catch (e) { /* ignore */ }
      }

      return {
        rank: index + 1,
        userId: item._id,
        name,
        averageScore: Math.round(item.averageScore),
        attempts: item.totalAttempts,
        streak: 0 // Placeholder as streak is hard to aggregate efficiently here
      };
    }));

    res.json(result);

  } catch (error) {
    console.error('❌ Leaderboard error', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/* ================= HEALTH ================= */
app.get('/api/health', (_: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

/* ================= USER ================= */
app.post('/api/tasks/bookmark', async (req: Request, res: Response) => {
  try {
    const { taskId, isBookmarked } = req.body;
    const task = await Task.findByIdAndUpdate(taskId, { isBookmarked }, { new: true });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ success: true, task });
  } catch (error) {
    console.error('Bookmark error', error);
    res.status(500).json({ error: 'Failed to toggle bookmark' });
  }
});

app.post('/api/sync-user', async (req: Request, res: Response) => {
  try {
    const { email, mode, ...data } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });

    if (mode === 'signup') {
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists. Please login.' });
      }
      // Create new user
      const user = new User({ email, ...data });
      await user.save();
      return res.json(user);
    }

    if (mode === 'login') {
      if (!existingUser) {
        return res.status(404).json({ error: 'User not found. Please register.' });
      }
      // Update data if provided (optional) or just return existing
      if (Object.keys(data).length > 0) {
        const updated = await User.findOneAndUpdate({ email }, { $set: data }, { new: true });
        return res.json(updated);
      }
      return res.json(existingUser);
    }

    // Fallback for old calls (optional, or just default to upsert behavior if needed, but strict is better)
    const user = await User.findOneAndUpdate(
      { email },
      { $set: data },
      { upsert: true, new: true }
    );
    res.json(user);

  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

/* ================= PLANNER ENGINE ================= */
app.post('/api/planner/generate', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body; // user email or id
    console.log('Generating plan for:', userId);

    const dateString = new Date().toISOString().split('T')[0];

    let tasks = await Task.find({ userId, date: dateString });

    // AUTO-GENERATION LOGIC
    if (tasks.length === 0) {
      console.log(`Creating fresh plan for ${userId} on ${dateString}`);
      tasks = await plannerEngine.generateDailyPlan(userId, dateString);
    }

    res.json(tasks);
  } catch (err) {
    console.error('❌ Planner Error', err);
    res.status(500).json({ error: 'Failed to fetch planner' });
  }
});

app.post('/api/planner/complete-block', async (req: Request, res: Response) => {
  try {
    const { userId, taskId } = req.body;
    const task = await plannerEngine.completeBlock(userId, taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ success: true, task });
  } catch (error) {
    console.error('Planner complete error', error);
    res.status(500).json({ error: 'Failed to complete task' });
  }
});

app.post('/api/planner/skip-block', async (req: Request, res: Response) => {
  try {
    const { userId, taskId, daysToSkip } = req.body;
    const task = await plannerEngine.skipBlock(userId, taskId, daysToSkip);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ success: true, task });
  } catch (error) {
    console.error('Planner skip error', error);
    res.status(500).json({ error: 'Failed to skip task' });
  }
});

app.get('/api/planner/stats/:userId', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const stats = await plannerEngine.getStats(userId);
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Planner stats error', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.get('/api/planner/syllabus-status/:userId', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const statusTree = await plannerEngine.getSyllabusStatus(userId);
    res.json({ success: true, tree: statusTree });
  } catch (error) {
    console.error('Syllabus status error', error);
    res.status(500).json({ error: 'Failed to fetch syllabus status' });
  }
});

app.post('/api/planner/toggle-topic', async (req: Request, res: Response) => {
  try {
    const { userId, topicPath, status } = req.body;
    const tracker = await plannerEngine.toggleTopic(userId, topicPath, status);
    res.json({ success: true, tracker });
  } catch (error) {
    console.error('Toggle topic error', error);
    res.status(500).json({ error: 'Failed to toggle topic' });
  }
});

/* ================= LEGACY PLANNER (Keep for backward compat if needed) ================= */
function generateMockPlan(limit = 5) {
  return Array.from({ length: limit }).map((_, i) => ({
    title: `Study Session ${i + 1}`,
    description: `Focus on core concepts for session ${i + 1}`,
    type: i % 3 === 0 ? 'REVISION' : 'STUDY',
    duration: 60,
    yield: 'HIGH',
    subTasks: [
      'Read standard book',
      'Make short notes',
      'Revise highlights'
    ]
  }));
}

/* ================= PLAN ================= */
app.post('/api/generate-plan', async (req: Request, res: Response) => {
  try {
    const { userId, limit = 5 } = req.body;

    const today = new Date().toISOString().split('T')[0];
    const tasks = generateMockPlan(limit).map((t) => ({
      ...t,
      userId,
      date: today
    }));

    await Task.deleteMany({ userId, date: today });
    const saved = await Task.insertMany(tasks);

    res.json(saved);
  } catch (err) {
    console.error('❌ generate-plan error', err);
    res.status(500).json({ error: 'Plan generation failed' });
  }
});

/* ================= TASKS ================= */
app.get('/api/tasks/:userId', async (req: Request, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    let tasks = await Task.find({
      userId: req.params.userId,
      date: today
    });

    if (tasks.length === 0) {
      console.log(`Auto-generating plan for ${req.params.userId}`);
      tasks = await plannerEngine.generateDailyPlan(req.params.userId as string, today);
    }

    res.json(tasks);
  } catch {
    res.status(500).json({ error: 'Fetch failed' });
  }
});

app.patch('/api/tasks/:taskId', async (req: Request, res: Response) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      { status: req.body.status },
      { new: true }
    );
    res.json(task);
  } catch {
    res.status(500).json({ error: 'Update failed' });
  }
});

/* ================= STREAK ================= */
app.get('/api/streak/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // 1. Fetch ALL completed tasks sorted nicely
    const tasks = await Task.find({
      userId,
      status: 'COMPLETED'
    }).sort({ date: -1 });

    // 2. Get unique dates
    const uniqueDates = Array.from(new Set(tasks.map(t => t.date as string))).sort().reverse();

    // 3. Logic
    const today = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    const todayCompleted = uniqueDates.includes(today);

    let currentStreak = 0;

    // Check if streak is active (completed today OR yesterday)
    // If neither today nor yesterday is completed, streak is 0.
    if (uniqueDates.includes(today) || uniqueDates.includes(yesterday)) {
      // Count backwards
      // If today is done, start checking from today. 
      // If today is NOT done but yesterday IS, start checking from yesterday.
      let checkDate = uniqueDates.includes(today) ? new Date() : yesterdayDate;

      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (uniqueDates.includes(dateStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // 4. Calculate Longest Streak (Bonus)
    let longestStreak = 0;
    let tempStreak = 0;

    // Iterate specific dates? Or just gaps in uniqueDates?
    // Since uniqueDates is sorted DESC: 2026-01-30, 2026-01-29, 2026-01-25...
    // We can just iterate the list and check gaps.
    if (uniqueDates.length > 0) {
      tempStreak = 1;
      longestStreak = 1;

      for (let i = 0; i < uniqueDates.length - 1; i++) {
        const curr = new Date(uniqueDates[i]);
        const next = new Date(uniqueDates[i + 1]);

        // Difference in days
        const diffTime = Math.abs(curr.getTime() - next.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      }
    }

    res.json({
      userId,
      currentStreak,
      longestStreak,
      lastActiveDate: uniqueDates[0] || null,
      todayCompleted
    });

  } catch (err) {
    console.error('Streak calc error:', err);
    res.status(500).json({ error: 'Streak calc failed' });
  }
});

/* ================= SYLLABUS ================= */
app.get('/api/syllabus', async (req: Request, res: Response) => {
  try {
    const { examStage, subject, paper } = req.query;

    const data = await getSyllabus({
      examStage: examStage as any,
      subject: subject as string,
      paper: paper as string
    });

    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    console.error('❌ Syllabus error', error);
    res.status(500).json({ error: 'Failed to fetch syllabus' });
  }
});

/* ================= QUIZ ================= */
import { getQuizQuestions } from './services/api/quizApi';

app.get('/api/quiz', async (req: Request, res: Response) => {
  try {
    const { category, subject, limit } = req.query;
    console.log('GET /api/quiz', { category, subject, limit }); // DEBUG LOG
    const questions = await getQuizQuestions({
      category: category as string,
      subject: subject as string,
      limit: Number(limit) || 20
    });
    console.log('Questions found:', questions?.length); // DEBUG LOG
    res.json({
      success: true,
      questions
    });
  } catch (error) {
    console.error('❌ Quiz error', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

app.post('/api/quiz/submit', async (req: Request, res: Response) => {
  try {
    const result = new QuizResult(req.body);
    await result.save();

    // Create a Task entry to count towards Streak
    if (result.userId && result.userId !== 'guest') {
      const today = new Date().toISOString().split('T')[0];
      const task = new Task({
        userId: result.userId,
        date: today,
        title: `Quiz: ${result.category || 'General'}`,
        type: 'QUIZ',
        status: 'COMPLETED',
        description: `Scored ${result.score} points (${result.percentage}%) in ${result.subject || 'Quiz'}`,
        duration: Math.round((result.timeTaken || 0) / 60), // minutes
        yield: (result.percentage || 0) >= 60 ? 'HIGH' : 'MEDIUM'
      });
      await task.save();
    }

    res.json({ success: true, result });
  } catch (error) {
    console.error('❌ Quiz submit error', error);
    res.status(500).json({ error: 'Failed to submit quiz result' });
  }
});

app.get('/api/quiz/results/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const results = await QuizResult.find({ userId }).sort({ date: -1 });
    res.json({ success: true, results });
  } catch (error) {
    console.error('❌ Quiz history error', error);
    res.status(500).json({ error: 'Failed to fetch quiz history' });
  }
});

/* ================= PAYMENT API ================= */
app.post('/api/create-order', async (req: Request, res: Response) => {
  try {
    const { amount, currency = 'INR' } = req.body;
    const options = {
      amount: amount * 100, // amount in smallest currency unit
      currency,
      receipt: `receipt_${Date.now()}`
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Something went wrong w/ Razorpay' });
  }
});

app.post('/api/verify-payment', async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const key_secret = process.env.RAZORPAY_KEY_SECRET || '';

    const generated_signature = crypto
      .createHmac('sha256', key_secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      res.json({ success: true, message: 'Payment verified' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ================= CURRENT AFFAIRS ================= */
app.get('/api/current-affairs/today', async (req: Request, res: Response) => {
  try {
    const items = await fetchRSSFeeds();

    res.json({
      success: true,
      count: items.length,
      items
    });
  } catch (err) {
    console.error('❌ current-affairs RSS error', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch current affairs'
    });
  }
});

/* ================= START ================= */
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});

// Force restart trigger - 24h Filter Added

