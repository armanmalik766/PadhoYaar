import { SyllabusSection } from '../../../types/syllabus';

export const mainsGS2: SyllabusSection = {
    examStage: 'MAINS',
    subject: 'General Studies II',
    paper: 'GS-II',
    topics: [
        {
            title: 'Polity',
            subtopics: [
                { title: 'Constitution', description: 'Indian Constitution—historical underpinnings, evolution, features, amendments, significant provisions and basic structure.' },
                { title: 'Federalism', description: 'Functions and responsibilities of the Union and the States, issues and challenges pertaining to the federal structure, devolution of powers and finances up to local levels and challenges therein.' },
                { title: 'Separation of Powers', description: 'Separation of powers between various organs dispute redressal mechanisms and institutions.' },
                { title: 'Comparison', description: 'Comparison of the Indian constitutional scheme with that of other countries.' },
                { title: 'Legislature', description: 'Parliament and State legislatures—structure, functioning, conduct of business, powers & privileges and issues arising out of these.' }
            ]
        },
        {
            title: 'Governance',
            subtopics: [
                { title: 'Executive & Judiciary', description: 'Structure, organization and functioning of the Executive and the Judiciary—Ministries and Departments of the Government; pressure groups and formal/informal associations and their role in the Polity.' },
                { title: 'RPA', description: 'Salient features of the Representation of People’s Act.' },
                { title: 'Constitutional Bodies', description: 'Appointment to various Constitutional posts, powers, functions and responsibilities of various Constitutional Bodies.' },
                { title: 'Regulatory Bodies', description: 'Statutory, regulatory and various quasi-judicial bodies.' },
                { title: 'Government Policies', description: 'Government policies and interventions for development in various sectors and issues arising out of their design and implementation.' },
                { title: 'NGOs & SHGs', description: 'Development processes and the development industry —the role of NGOs, SHGs, various groups and associations, donors, charities, institutional and other stakeholders.' }
            ]
        },
        {
            title: 'Social Justice',
            subtopics: [
                { title: 'Welfare Schemes', description: 'Welfare schemes for vulnerable sections of the population by the Centre and States and the performance of these schemes; mechanisms, laws, institutions and Bodies constituted for the protection and betterment of these vulnerable sections.' },
                { title: 'Social Services', description: 'Issues relating to development and management of Social Sector/Services relating to Health, Education, Human Resources.' },
                { title: 'Poverty & Hunger', description: 'Issues relating to poverty and hunger.' }
            ]
        },
        {
            title: 'International Relations',
            subtopics: [
                { title: 'Neighborhood', description: 'India and its neighborhood- relations.' },
                { title: 'Groupings', description: 'Bilateral, regional and global groupings and agreements involving India and/or affecting India’s interests.' },
                { title: 'Global Politics', description: 'Effect of policies and politics of developed and developing countries on India’s interests, Indian diaspora.' },
                { title: 'Institutions', description: 'Important International institutions, agencies and fora- their structure, mandate.' }
            ]
        }
    ]
};
