import { SyllabusSection } from '../../../types/syllabus';

export const prelimsGeography: SyllabusSection = {
    examStage: 'PRELIMS',
    subject: 'Geography',
    paper: 'Geography',
    topics: [
        {
            title: 'Geomorphology',
            subtopics: [
                { title: 'The Earth', description: 'Interior structure (Crust, Mantle, Core)' },
                { title: 'Plate Tectonics', description: 'Continental Drift, Plate Boundaries, Seafloor Spreading' },
                { title: 'Endogenic Forces', description: 'Volcanism (Types of Volcanoes, Landforms), Earthquakes (Waves, Shadow zones)' },
                { title: 'Exogenic Forces', description: 'Weathering, Erosion, Mass movements' },
                { title: 'Landforms', description: 'Fluvial, Aeolian, Glacial, Coastal, Karst' }
            ]
        },
        {
            title: 'Climatology',
            subtopics: [
                { title: 'Atmosphere', description: 'Composition and Structure' },
                { title: 'Insolation and Heat Budget', description: 'Heat balance of the earth' },
                { title: 'Pressure and Winds', description: 'Atmospheric pressure, Pressure belts, Planetary winds, Monsoon, Jet streams' },
                { title: 'Atmospheric Circulation', description: 'Hadley, Ferrel, Polar cells' },
                { title: 'Cyclones', description: 'Tropical and Temperate Cyclones, Anti-cyclones' },
                { title: 'Climatic Regions', description: 'Koppen’s classification' }
            ]
        },
        {
            title: 'Oceanography',
            subtopics: [
                { title: 'Ocean Relief', description: 'Continental Shelf, Slope, Deep Sea Plains, Trenches' },
                { title: 'Temperature and Salinity', description: 'Horizontal and Vertical distribution' },
                { title: 'Ocean Movements', description: 'Waves, Tides, Ocean Currents (Pacific, Atlantic, Indian Ocean)' },
                { title: 'Marine Resources', description: 'Coral Reefs (Types, Bleaching), Marine pollution' }
            ]
        },
        {
            title: 'Indian Geography',
            subtopics: [
                { title: 'Physical Features', description: 'Northern Mountains (Himalayas), Northern Plains, Peninsular Plateau, Coastal Plains, Islands' },
                { title: 'Drainage System', description: 'Himalayan Rivers (Indus, Ganga, Brahmaputra), Peninsular Rivers (East & West flowing)' },
                { title: 'Climate', description: 'Mechanism of Monsoon (El Nino, La Nina, IOD), Seasons, Rainfall distribution' },
                { title: 'Soils', description: 'Classification (Alluvial, Black, Red, Laterite, etc.), Soil conservation' },
                { title: 'Natural Vegetation', description: 'Forest types, Forest cover' },
                { title: 'Agriculture', description: 'Cropping patterns, Green Revolution, Major crops' },
                { title: 'Resources', description: 'Minerals (Iron, Coal, Petroleum), Energy resources (Solar, Wind)' },
                { title: 'Transport', description: 'Roads, Railways, Ports' }
            ]
        }
    ]
};
