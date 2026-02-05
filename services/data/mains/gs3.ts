import { SyllabusSection } from '../../../types/syllabus.ts';

export const mainsGS3: SyllabusSection = {
    examStage: 'MAINS',
    subject: 'General Studies III',
    paper: 'GS-III',
    topics: [
        {
            title: 'Economy',
            subtopics: [
                { title: 'Indian Economy', description: 'Indian Economy and issues relating to planning, mobilization, of resources, growth, development and employment.' },
                { title: 'Inclusive Growth', description: 'Inclusive growth and issues arising from it.' },
                { title: 'Budgeting', description: 'Government Budgeting.' },
                { title: 'Liberalization', description: 'Effects of liberalization on the economy, changes in industrial policy and their effects on industrial growth.' },
                { title: 'Infrastructure', description: 'Infrastructure: Energy, Ports, Roads, Airports, Railways etc.' },
                { title: 'Investment', description: 'Investment models.' }
            ]
        },
        {
            title: 'Agriculture',
            subtopics: [
                { title: 'Cropping', description: 'Major crops-cropping patterns in various parts of the country, - different types of irrigation and irrigation systems storage, transport and marketing of agricultural produce and issues and related constraints; e-technology in the aid of farmers.' },
                { title: 'Subsidies & PDS', description: 'Issues related to direct and indirect farm subsidies and minimum support prices; Public Distribution System- objectives, functioning, limitations, revamping; issues of buffer stocks and food security; Technology missions; economics of animal-rearing.' },
                { title: 'Food Processing', description: 'Food processing and related industries in India- scope' },
                { title: 'Land Reforms', description: 'Land reforms in India.' }
            ]
        },
        {
            title: 'Science & Technology',
            subtopics: [
                { title: 'Recent Developments', description: 'Science and Technology- developments and their applications and effects in everyday life.' },
                { title: 'Indigenization', description: 'Achievements of Indians in science & technology; indigenization of technology and developing new technology.' },
                { title: 'Future Tech', description: 'Awareness in the fields of IT, Space, Computers, robotics, nano-technology, bio-technology and issues relating to intellectual property rights.' }
            ]
        },
        {
            title: 'Environment',
            subtopics: [
                { title: 'Conservation', description: 'Conservation, environmental pollution and degradation, environmental impact assessment.' }
            ]
        },
        {
            title: 'Disaster Management',
            subtopics: [
                { title: 'Disaster Management', description: 'Disaster and disaster management.' }
            ]
        },
        {
            title: 'Security',
            subtopics: [
                { title: 'Extremism', description: 'Linkages between development and spread of extremism.' },
                { title: 'Non-State Actors', description: 'Role of external state and non-state actors in creating challenges to internal security.' },
                { title: 'Cyber Security', description: 'Challenges to internal security through communication networks, role of media and social networking sites in internal security challenges, basics of cyber security; money-laundering and its prevention.' },
                { title: 'Border Management', description: 'Security challenges and their management in border areas - linkages of organized crime with terrorism.' },
                { title: 'Forces', description: 'Various Security forces and agencies and their mandate.' }
            ]
        }
    ]
};
