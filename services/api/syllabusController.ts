import { SyllabusSection, SyllabusFilter } from '../../types/syllabus';

// Import all data
import { prelimsHistory } from '../data/prelims/history';
import { prelimsPolity } from '../data/prelims/polity';
import { prelimsGeography } from '../data/prelims/geography';
import { prelimsEconomy } from '../data/prelims/economy';
import { prelimsEnvironment } from '../data/prelims/environment';
import { prelimsScience } from '../data/prelims/science';

import { mainsGS1 } from '../data/mains/gs1';
import { mainsGS2 } from '../data/mains/gs2';
import { mainsGS3 } from '../data/mains/gs3';
import { mainsGS4 } from '../data/mains/gs4';
import { mainsEssay } from '../data/mains/essay';

import { interviewData } from '../data/interview';

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
