import { SyllabusSection, SyllabusFilter } from '../../types/syllabus.ts';

// Import all data
import { prelimsHistory } from '../data/prelims/history.ts';
import { prelimsPolity } from '../data/prelims/polity.ts';
import { prelimsGeography } from '../data/prelims/geography.ts';
import { prelimsEconomy } from '../data/prelims/economy.ts';
import { prelimsEnvironment } from '../data/prelims/environment.ts';
import { prelimsScience } from '../data/prelims/science.ts';

import { mainsGS1 } from '../data/mains/gs1.ts';
import { mainsGS2 } from '../data/mains/gs2.ts';
import { mainsGS3 } from '../data/mains/gs3.ts';
import { mainsGS4 } from '../data/mains/gs4.ts';
import { mainsEssay } from '../data/mains/essay.ts';

import { interviewData } from '../data/interview.ts';

// Aggregate all data into a single queryable structure
const ALL_SYLLABUS_DATA: SyllabusSection[] = [
    prelimsHistory,
    prelimsPolity,
    prelimsGeography,
    prelimsEconomy,
    prelimsEnvironment,
    prelimsScience,
    mainsGS1,
    mainsGS2,
    mainsGS3,
    mainsGS4,
    mainsEssay,
    interviewData
];

export const syllabusController = {
    getData: (filter?: SyllabusFilter): SyllabusSection[] => {
        let results = ALL_SYLLABUS_DATA;

        if (!filter) return results;

        if (filter.examStage) {
            results = results.filter(item => item.examStage === filter.examStage);
        }

        if (filter.subject) {
            // Case-insensitive filtering for better UX
            const subjectQuery = filter.subject.toLowerCase();
            results = results.filter(item => item.subject.toLowerCase().includes(subjectQuery));
        }

        if (filter.paper) {
            const paperQuery = filter.paper.toLowerCase();
            results = results.filter(item => item.paper && item.paper.toLowerCase() === paperQuery);
        }

        return results;
    }
};
