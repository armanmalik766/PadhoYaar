import mongoose, { Document, Model } from 'mongoose';

/* ================= USER ================= */
export interface IUser extends Document {
    email: string;
    name?: string;
    dailyHoursGoal?: number;
    [key: string]: any;
}

export const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: String,
    attemptYear: Number,
    optionalSubject: String,
    dailyHoursGoal: Number,
    studyMode: String,
    language: String,
    preferences: Object,
    subscription: Object
});
export const User = (mongoose.models.User || mongoose.model<IUser>('User', UserSchema)) as Model<IUser>;

/* ================= TASK ================= */
export interface ITask extends Document {
    userId: string;
    date: string;
    title: string;
    type: string;
    status: string;
    description: string;
    duration: number;
    yield: string;
    subTasks: string[];
    topicId?: string;
    [key: string]: any;
}

export const TaskSchema = new mongoose.Schema({
    userId: String,
    date: String,
    title: String,
    type: String, // 'STUDY', 'REVISION', 'QUIZ', 'SYLLABUS_STUDY', 'SYLLABUS_REVISION'
    status: { type: String, default: 'PENDING' },
    description: String,
    duration: Number,
    yield: String,
    subTasks: [String],
    topicId: String, // Link to SyllabusTracker
    isBookmarked: { type: Boolean, default: false }
});
export const Task = (mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema)) as Model<ITask>;

/* ================= QUIZ RESULT ================= */
export interface IQuizResult extends Document {
    userId: string;
    category: string;
    subject: string;
    totalQuestions: number;
    correct: number;
    wrong: number;
    score: number;
    percentage: number;
    timeTaken: number;
    examStage: string;
    date: Date;
    [key: string]: any;
}

export const QuizResultSchema = new mongoose.Schema({
    userId: String,
    category: String,
    subject: String,
    totalQuestions: Number,
    correct: Number,
    wrong: Number,
    score: Number,
    percentage: Number,
    timeTaken: Number, // in seconds
    examStage: String,
    date: { type: Date, default: Date.now }
});
export const QuizResult = (mongoose.models.QuizResult || mongoose.model<IQuizResult>('QuizResult', QuizResultSchema)) as Model<IQuizResult>;

/* ================= SYLLABUS TRACKER ================= */
export interface ISyllabusTracker extends Document {
    userId: string;
    topicId: string;
    topicPath: string;
    subject: string;
    status: 'PENDING' | 'STUDY' | 'REVISION' | 'COMPLETED';
    plannedMinutes: number;
    completedMinutes: number;
    nextRevisionDate?: Date;
    revisionLevel: number;
    lastStudiedDate?: Date;
}

export const SyllabusTrackerSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    topicId: { type: String, required: true }, // Stable Hash
    topicPath: { type: String, required: true }, // "History > Ancient India > Indus Valley"
    subject: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'STUDY', 'REVISION', 'COMPLETED'], default: 'PENDING' },
    plannedMinutes: { type: Number, default: 90 },
    completedMinutes: { type: Number, default: 0 },
    nextRevisionDate: { type: Date },
    revisionLevel: { type: Number, default: 0 }, // 0=New, 1=1d, 2=7d, 3=30d
    lastStudiedDate: { type: Date }
});
SyllabusTrackerSchema.index({ userId: 1, topicId: 1 }, { unique: true });
SyllabusTrackerSchema.index({ userId: 1, status: 1 });
SyllabusTrackerSchema.index({ userId: 1, nextRevisionDate: 1 });

export const SyllabusTracker = (mongoose.models.SyllabusTracker || mongoose.model<ISyllabusTracker>('SyllabusTracker', SyllabusTrackerSchema)) as Model<ISyllabusTracker>;
