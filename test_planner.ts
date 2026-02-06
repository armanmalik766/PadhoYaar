
import { plannerEngine } from './services/planner/PlannerEngine.ts';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://192.168.1.9:27017/padhoyaar';

const run = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB");

        const userId = "test_user_repro_123";
        console.log(`Generating plan for ${userId}...`);

        const plan = await plannerEngine.generateDailyPlan(userId, new Date().toISOString().split('T')[0]);
        console.log("Plan generated successfully:", plan.length, "items");

        process.exit(0);
    } catch (e) {
        console.error("CRASHED:", e);
        process.exit(1);
    }
};

run();
