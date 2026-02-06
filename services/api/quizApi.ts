import { questions as history } from '../data/questions/prelims/history';
import { questions as polity } from '../data/questions/prelims/polity';
import { questions as geography } from '../data/questions/prelims/geography';
import { questions as economy } from '../data/questions/prelims/economy';
import { questions as environment } from '../data/questions/prelims/environment';
import { questions as science } from '../data/questions/prelims/science';

import { questions as gs1 } from '../data/questions/mains/gs1';
import { questions as gs2 } from '../data/questions/mains/gs2';
import { questions as gs3 } from '../data/questions/mains/gs3';
import { questions as gs4 } from '../data/questions/mains/gs4';

import { questions as ethics } from '../data/questions/interview/ethics';
import { questions as administration } from '../data/questions/interview/administration';

import { questions as currentAffairs } from '../data/questions/currentAffairs/daily';
import { questions as csatGeneral } from '../data/questions/csat/general';

// Map all questions
const QUESTION_BANK: any = {
    PRELIMS: {
        History: history,
        Polity: polity,
        Geography: geography,
        Economy: economy,
        Environment: environment,
        'Science & Tech': science
    },
    MAINS: {
        'GS-I': gs1,
        'GS-II': gs2,
        'GS-III': gs3,
        'GS-IV': gs4
    },
    INTERVIEW: {
        Ethics: ethics,
        Administration: administration
    },
    CURRENT_AFFAIRS: {
        Daily: currentAffairs
    },
    CSAT: {
        General: csatGeneral
    }
};

export const getQuizQuestions = async ({ category, subject, limit = 20 }: any) => {
    let allQuestions: any[] = [];

    const catData = QUESTION_BANK[category];

    if (!catData) {
        // If category specific files not found, or if category is generic like 'GK' or 'REVISION',
        // For now we default to PRELIMS or return empty.
        // However, the user request specific categories: PRELIMS, MAINS, INTERVIEW, CURRENT_AFFAIRS.
        // If 'subject' is mentioned and available in other categories we might search?
        // But strictly following the structure:
        return [];
    }

    if (subject && catData[subject]) {
        allQuestions = catData[subject];
    } else {
        // Aggregate all subjects in this category
        Object.values(catData).forEach((qList: any) => {
            allQuestions = [...allQuestions, ...qList];
        });
    }

    // Shuffle and limit
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
};
