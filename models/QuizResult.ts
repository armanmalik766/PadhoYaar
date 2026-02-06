import mongoose, { Document, Model } from 'mongoose';

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
