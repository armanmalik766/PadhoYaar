import { syllabusRouter } from './syllabusRoutes.ts';
import { SyllabusFilter, SyllabusSection } from '../../types/syllabus.ts';

/**
 * Fetches syllabus data based on the provided filter.
 * This is the main entry point for the frontend to access syllabus data.
 * 
 * @param filter Object containing examStage, subject, or paper
 * @returns Promise resolution with the syllabus data
 */
export const getSyllabus = async (filter: SyllabusFilter): Promise<SyllabusSection[]> => {
    const result = await syllabusRouter.getSyllabus(filter);

    if (result.success) {
        return result.data;
    } else {
        // Handle error gracefully or throw
        return [];
    }
};
