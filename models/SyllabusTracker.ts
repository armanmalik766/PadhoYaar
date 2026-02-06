import mongoose, { Document, Model } from 'mongoose';

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
