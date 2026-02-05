import { SyllabusSection } from '../../../types/syllabus.ts';

export const prelimsPolity: SyllabusSection = {
    examStage: 'PRELIMS',
    subject: 'Polity',
    paper: 'Polity',
    topics: [
        {
            title: 'Constitutional Framework',
            subtopics: [
                { title: 'Historical Background', description: 'Regulating Act 1773 to Indian Independence Act 1947' },
                { title: 'Making of the Constitution', description: 'Constituent Assembly, Major Committees, Enactment' },
                { title: 'Salient Features', description: 'Lengthiest written constitution, Federal with unitary bias, Parliamentary form' },
                { title: 'Preamble', description: 'Text, Keywords (Sovereign, Socialist, Secular, Democratic, Republic), Justice, Liberty, Equality, Fraternity' },
                { title: 'Union and its Territory', description: 'Articles 1-4, Reorganization of States' },
                { title: 'Citizenship', description: 'Articles 5-11, Citizenship Amendment Act' }
            ]
        },
        {
            title: 'Rights and Duties',
            subtopics: [
                { title: 'Fundamental Rights', description: 'Articles 12-35 (Right to Equality, Freedom, Against Exploitation, Religion, Cultural & Educational, Constitutional Remedies), Writs' },
                { title: 'Directive Principles of State Policy', description: 'Articles 36-51, Classification (Socialist, Gandhian, Liberal-Intellectual)' },
                { title: 'Fundamental Duties', description: 'Article 51A, Swaran Singh Committee' }
            ]
        },
        {
            title: 'System of Government',
            subtopics: [
                { title: 'Parliamentary System', description: 'Features, Merits, Demerits, Distinction from Presidential' },
                { title: 'Federal System', description: 'Federal features, Unitary features, Centre-State Relations (Legislative, Administrative, Financial)' },
                { title: 'Inter-State Relations', description: 'Inter-state Water Disputes, Inter-State Councils, Zonal Councils' },
                { title: 'Emergency Provisions', description: 'National (Art 352), State (Art 356), Financial (Art 360)' }
            ]
        },
        {
            title: 'Central Government',
            subtopics: [
                { title: 'President', description: 'Election, Oath, Term, Powers (Executive, Legislative, Financial, Judicial, Diplomatic, Military, Emergency), Veto power, Ordinance power' },
                { title: 'Vice-President', description: 'Election, Removal, Functions' },
                { title: 'Prime Minister', description: 'Appointment, Powers, Relationship with President' },
                { title: 'Council of Ministers', description: 'Cabinet vs Council of Ministers, Collective Responsibility' },
                { title: 'Parliament', description: 'Lok Sabha, Rajya Sabha, Composition, Sessions, Question Hour, Zero Hour, Motions, Bills (Ordinary, Money, Financial, Const. Amendment), Budget procedure, Committees' }
            ]
        },
        {
            title: 'Judiciary',
            subtopics: [
                { title: 'Supreme Court', description: 'Appointment of Judges (Collegium), Removal, Jurisdiction (Original, Writ, Appellate, Advisory), Judicial Review, Judicial Activism, PIL' },
                { title: 'High Courts', description: 'Appointment, Jurisdiction' },
                { title: 'Subordinate Courts', description: 'District Judges, Gram Nyayalayas, Lok Adalats, NALSA' }
            ]
        },
        {
            title: 'State Government',
            subtopics: [
                { title: 'Governor', description: 'Appointment, Role, Discretionary Powers' },
                { title: 'Chief Minister & Council of Ministers', description: '' },
                { title: 'State Legislature', description: 'Unicameral vs Bicameral, Legislative Assembly, Legislative Council' }
            ]
        },
        {
            title: 'Local Government',
            subtopics: [
                { title: 'Panchayati Raj', description: 'evolution, 73rd Amendment, PESA Act' },
                { title: 'Municipalities', description: '74th Amendment, Types of Urban Local Bodies' }
            ]
        },
        {
            title: 'Constitutional Bodies',
            subtopics: [
                { title: 'Election Commission', description: 'Article 324' },
                { title: 'UPSC & SPSC', description: 'Articles 315-323' },
                { title: 'Finance Commission', description: 'Article 280' },
                { title: 'CAG', description: 'Article 148' },
                { title: 'National Commissions', description: 'For SCs (Art 338), STs (Art 338A), BCs (Art 338B)' },
                { title: 'Attorney General', description: 'Article 76' }
            ]
        }
    ]
};
