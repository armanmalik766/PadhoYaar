import { SyllabusSection } from '../../types/syllabus';

export const interviewData: SyllabusSection = {
    examStage: 'INTERVIEW',
    subject: 'Personality Test',
    paper: 'Interview',
    topics: [
        {
            title: 'Objective',
            subtopics: [
                { title: 'Assessment', description: 'The candidate will be interviewed by a Board who will have before them a record of his/her career. He/she will be asked questions on matters of general interest.' },
                { title: 'Purpose', description: 'The object of the interview is to assess the personal suitability of the candidate for a career in public service by a Board of competent and unbiased observers.' },
                { title: 'Format', description: 'The test is intended to be judged by the mental calibre of a candidate. In broad terms this is really an assessment of not only his intellectual qualities but also social traits and his interest in current affairs.' }
            ]
        },
        {
            title: 'Qualities to be Assessed',
            subtopics: [
                { title: 'Mental Qualities', description: 'Mental alertness, critical powers of assimilation, clear and logical exposition.' },
                { title: 'Judgment', description: 'Balance of judgement, variety and depth of interest.' },
                { title: 'Leadership', description: 'Ability for social cohesion and leadership.' },
                { title: 'Integrity', description: 'Intellectual and moral integrity.' }
            ]
        },
        {
            title: 'DAF Based Questions',
            subtopics: [
                { title: 'Background', description: 'Place of birth, Home State, Graduation subject, University.' },
                { title: 'Hobbies', description: 'Questions related to listed hobbies and extracurricular activities.' },
                { title: 'Job Experience', description: 'Roles and responsibilities in previous jobs.' },
                { title: 'Service Preferences', description: 'Reason for IPS/IAS/IFS preferences.' }
            ]
        },
        {
            title: 'Current Affairs',
            subtopics: [
                { title: 'National', description: 'Recent government schemes, Supreme Court verdicts, Social issues.' },
                { title: 'International', description: 'Geopolitics, India\'s relations with major powers, Global summits.' }
            ]
        }
    ]
};
