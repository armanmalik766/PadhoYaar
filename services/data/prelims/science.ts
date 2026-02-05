import { SyllabusSection } from '../../../types/syllabus.ts';

export const prelimsScience: SyllabusSection = {
    examStage: 'PRELIMS',
    subject: 'Science',
    paper: 'Science',
    topics: [
        {
            title: 'Space Technology',
            subtopics: [
                { title: 'Orbits', description: 'LEO, MEO, GEO, GSO, Sun-synchronous, Polar' },
                { title: 'Launch Vehicles', description: 'PSLV, GSLV (Mk II, Mk III), SSLV, Reusable LV' },
                { title: 'Missions', description: 'Chandrayaan, Mangalyaan, Gaganyaan, Aditya-L1, Shukrayaan' },
                { title: 'Concepts', description: 'Black Holes, Gravitational Waves, Dark Matter, Dark Energy' }
            ]
        },
        {
            title: 'Defence Technology',
            subtopics: [
                { title: 'Missiles', description: 'Ballistic vs Cruise, Ramjet vs Scramjet, IGPMP (Prithvi, Agni, Trishul, Nag, Akash), BrahMos' },
                { title: 'Aircraft & Submarines', description: 'Tejas, Rafale, INS Arihant, Project 75' },
                { title: 'Nuclear Tech', description: 'Fission vs Fusion, Three Stage Nuclear Program of India' }
            ]
        },
        {
            title: 'Biotechnology',
            subtopics: [
                { title: 'Genetics', description: 'DNA, RNA, Gene, Chromosome' },
                { title: 'Applications', description: 'GM Crops (Bt Cotton, Bt Brinjal, DMH-11 Mustard), CRISPR-Cas9 (Gene Editing), Cloning, Stem Cells' },
                { title: 'Diseases', description: 'Vaccines types, Antimicrobial Resistance' }
            ]
        },
        {
            title: 'Information Technology',
            subtopics: [
                { title: 'Emerging Tech', description: 'Artificial Intelligence, Machine Learning, Deep Learning, Big Data' },
                { title: 'Connectivity', description: '5G vs 4G, Optical Fiber, Li-Fi, IoT' },
                { title: 'BlockChain', description: 'Cryptocurrency, NFTs, Web 3.0' },
                { title: 'Cyber Security', description: 'Ransomware, Malware, Phishing' }
            ]
        },
        {
            title: 'Nanotechnology',
            subtopics: [
                { title: 'Basics', description: 'Scale, Carbon Nanotubes, Graphene' },
                { title: 'Applications', description: 'Medicine (Targeted drug delivery), Electronics, Textiles' }
            ]
        }
    ]
};
