import mongoose, { Document, Model } from 'mongoose';

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
