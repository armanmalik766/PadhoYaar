import mongoose, { Document, Model } from 'mongoose';

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
