import { syllabusController } from './syllabusController.ts';
import { SyllabusFilter, SyllabusSection } from '../../types/syllabus.ts';

// Simulating a route handler. 
// In a real backend, this would take (req, res).
// Here, it takes params and returns the Result directly.

export const syllabusRouter = {
    getSyllabus: async (params: SyllabusFilter): Promise<{ success: boolean; data: SyllabusSection[] }> => {
        try {
            // Simulate network delay if needed, but keeping it fast for local
            const data = syllabusController.getData(params);

            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('Syllabus Route Error:', error);
            return { success: false, data: [] };
        }
    }
};
