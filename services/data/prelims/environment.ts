import { SyllabusSection } from '../../../types/syllabus.ts';

export const prelimsEnvironment: SyllabusSection = {
    examStage: 'PRELIMS',
    subject: 'Environment',
    paper: 'Environment',
    topics: [
        {
            title: 'Ecology & Ecosystem',
            subtopics: [
                { title: 'Levels of Organization', description: 'Individual, Population, Community, Ecosystem, Biome, Biosphere' },
                { title: 'Ecosystem Functions', description: 'Energy Flow, Food Chain, Food Web, Ecological Pyramids (Number, Biomass, Energy)' },
                { title: 'Biogeochemical Cycles', description: 'Gaseous (Carbon, Nitrogen), Sedimentary (Phosphorus, Sulphur)' },
                { title: 'Ecological Succession', description: 'Primary and Secondary' },
                { title: 'Biotic Interactions', description: 'Mutualism, Commensalism, Amensalism, Parasitism, Predation, Competition' }
            ]
        },
        {
            title: 'Biodiversity',
            subtopics: [
                { title: 'Measurement', description: 'Alpha, Beta, Gamma diversity' },
                { title: 'Conservation', description: 'In-situ (National Parks, Wildlife Sanctuaries, Biosphere Reserves, Tiger Reserves), Ex-situ (Zoos, Seed Banks)' },
                { title: 'IUCN Status', description: 'CR, EN, VU species in India' },
                { title: 'Protected Areas', description: 'Important NPs and WLS in news' }
            ]
        },
        {
            title: 'Climate Change',
            subtopics: [
                { title: 'Global Warming', description: 'Greenhouse Gases, Global Warming Potential' },
                { title: 'Ocean Acidification', description: 'Causes and Impacts' },
                { title: 'Ozone Depletion', description: 'Montreal Protocol, Kigali Amendment' },
                { title: 'Climate Summits', description: 'UNFCCC COPs, Paris Agreement (NDCs), Glasgow Pact' }
            ]
        },
        {
            title: 'Pollution',
            subtopics: [
                { title: 'Air Pollution', description: 'Pollutants (SOx, NOx, PM, Ozone), AQI, BS-VI Norms' },
                { title: 'Water Pollution', description: 'Bio-magnification, Bio-accumulation, Eutrophication' },
                { title: 'Agencies', description: 'CPCB, NGT' }
            ]
        },
        {
            title: 'Legislation',
            subtopics: [
                { title: 'Wildlife Protection Act 1972', description: 'Schedules' },
                { title: 'Environment (Protection) Act 1986', description: 'Eco-Sensitive Zones' },
                { title: 'Forest Rights Act 2006', description: 'Rights of dwellers' },
                { title: 'Biodiversity Act 2002', description: 'NBA, SBB, BMC' }
            ]
        }
    ]
};
