import { SyllabusSection } from '../../../types/syllabus.ts';

export const mainsGS1: SyllabusSection = {
    examStage: 'MAINS',
    subject: 'General Studies I',
    paper: 'GS-I',
    topics: [
        {
            title: 'Indian Heritage and Culture',
            subtopics: [
                { title: 'Art & Architecture', description: 'Salient aspects of Art Forms, Literature and Architecture from ancient to modern times.' },
                { title: 'Classical Dances', description: 'Bharatnatyam, Kathak, Kathakali, Kuchipudi, Odissi, Sattriya, Manipuri, Mohiniyattam' },
                { title: 'Music', description: 'Hindustani vs Carnatic' }
            ]
        },
        {
            title: 'Modern Indian History',
            subtopics: [
                { title: 'Events & Personalities', description: 'Significant events, personalities, issues from the middle of the eighteenth century until the present.' },
                { title: 'Freedom Struggle', description: 'The Freedom Struggle - its various stages and important contributors/contributions from different parts of the country.' }
            ]
        },
        {
            title: 'Post-Independence',
            subtopics: [
                { title: 'Consolidation', description: 'Post-independence consolidation and reorganization within the country.' }
            ]
        },
        {
            title: 'World History',
            subtopics: [
                { title: 'Events from 18th Century', description: 'Industrial Revolution, World wars, Redrawal of national boundaries, Colonization, Decolonization.' },
                { title: 'Political Philosophies', description: 'Communism, Capitalism, Socialism etc. - their forms and effect on the society.' }
            ]
        },
        {
            title: 'Indian Society',
            subtopics: [
                { title: 'Features', description: 'Salient features of Indian Society, Diversity of India.' },
                { title: 'Women', description: 'Role of women and women’s organization, population and associated issues.' },
                { title: 'Poverty & Urbanization', description: 'Poverty and developmental issues, urbanization, their problems and their remedies.' },
                { title: 'Globalization', description: 'Effects of globalization on Indian society.' },
                { title: 'Social Empowerment', description: 'Social empowerment, communalism, regionalism & secularism.' }
            ]
        },
        {
            title: 'Geography',
            subtopics: [
                { title: 'Physical Geography', description: 'Salient features of world’s physical geography.' },
                { title: 'Natural Resources', description: 'Distribution of key natural resources across the world (including South Asia and the Indian sub-continent); factors responsible for the location of primary, secondary, and tertiary sector industries in various parts of the world (including India).' },
                { title: 'Geophysical Phenomena', description: 'Important Geophysical phenomena such as earthquakes, Tsunami, Volcanic activity, cyclone etc., geographical features and their location-changes in critical geographical features (including water-bodies and ice-caps) and in flora and fauna and the effects of such changes.' }
            ]
        }
    ]
};
