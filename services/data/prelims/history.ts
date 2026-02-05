import { SyllabusSection } from '../../../types/syllabus.ts';

export const prelimsHistory: SyllabusSection = {
    examStage: 'PRELIMS',
    subject: 'History',
    paper: 'History',
    topics: [
        {
            title: 'Ancient India',
            subtopics: [
                { title: 'Prehistoric Cultures', description: 'Stone Age, Palaeolithic, Mesolithic, Neolithic, Chalcolithic phases' },
                {
                    title: 'Indus Valley Civilization',
                    description: 'Origin, Extent, and Chronology',
                    subtopics: [
                        { title: 'Town Planning', description: 'Grid system, Drainage, Granary, Great Bath' },
                        { title: 'Economy', description: 'Agriculture, Trade, Weights and Measures' },
                        { title: 'Religion', description: 'Pashupati Mahadeva, Mother Goddess, Nature worship' },
                        { title: 'Art & Architecture', description: 'Seals, Bronze dancing girl, Terracotta' },
                        { title: 'Decline', description: 'Theories of decline' }
                    ]
                },
                { title: 'Vedic Age', description: 'Early and Later Vedic Period, Society, Economy, Polity, Religion, Literature (Vedas, Upanishads)' },
                { title: 'Mauryan Empire', description: 'Chandragupta Maurya, Bindusara, Ashoka (Dhamma, Edicts), Administration, Art & Architecture (Stupas, Pillars)' },
                { title: 'Gupta Empire', description: 'Golden Age, Samudragupta, Chandragupta II, Administration, Literature (Kalidasa), Science (Aryabhatta), Art (Temple Architecture)' },
                {
                    title: 'Buddhism & Jainism',
                    description: 'Rise of Heterodox sects',
                    subtopics: [
                        { title: 'Life of Buddha & Mahavira', description: 'Birth, Enlightenment, Sermons, Mahaparinirvana' },
                        { title: 'Doctrines', description: 'Four Noble Truths, Eightfold Path, Triratnas' },
                        { title: 'Councils', description: 'Buddhist and Jain Councils' },
                        { title: 'Sects', description: 'Hinayana, Mahayana, Vajrayana; Digambara, Svetambara' },
                        { title: 'Literature', description: 'Tripitakas, Jatakas, Agamas' }
                    ]
                },
                { title: 'Post-Mauryan Period', description: 'Sungas, Kanvas, Indo-Greeks, Shakas, Kushanas (Kanishka - Gandhara & Mathura School of Art)' },
                { title: 'Sangam Age', description: 'Sangam Literature, Chera, Chola, Pandya Kingdoms, Society and Economy' }
            ]
        },
        {
            title: 'Medieval India',
            subtopics: [
                { title: 'Early Medieval Period', description: 'Tripartite Struggle (Palas, Pratiharas, Rashtrakutas), Cholas (Local Self Govt, Bronze Nataraja)' },
                { title: 'Delhi Sultanate', description: 'Slave Dynasty (Qutub-ud-din Aibak, Iltutmish, Balban), Khalji (Alauddin - Market Reforms), Tughlaq (Muhammad bin Tughlaq experiments), Sayyid, Lodi; Administration (Iqta system), Art & Architecture' },
                { title: 'Mughal Empire', description: 'Babur, Humayun, Sher Shah Suri (Administration), Akbar (Mansabdari, Religious policy), Jahangir (Painting), Shah Jahan (Architecture), Aurangzeb; Decline' },
                { title: 'Vijayanagara & Bahmani Kingdoms', description: 'Krishna Deva Raya, Amara-nayaka system, Hampi architecture; Bahmani kingdom breakdown' },
                { title: 'Bhakti & Sufi Movements', description: 'Alvars, Nayanars, Kabir, Guru Nanak, Meera Bai; Sufi Silsilas (Chishti, Suhrawardi)' },
                { title: 'Marathas', description: 'Shivaji (Administration, Ashtapradhan), Peshwas' }
            ]
        },
        {
            title: 'Modern India',
            subtopics: [
                { title: 'Advent of Europeans', description: 'Portuguese, Dutch, English, French; Carnatic Wars, Battle of Plassey, Battle of Buxar' },
                { title: 'British Expansion', description: 'Subsidiary Alliance, Doctrine of Lapse; Anglo-Mysore, Anglo-Maratha, Anglo-Sikh wars' },
                { title: 'Economic Impact of British Rule', description: 'Land Revenue Systems (Zamindari, Ryotwari, Mahalwari), Drain of Wealth, De-industrialization' },
                { title: 'Revolt of 1857', description: 'Causes, Leaders, Suppression, Nature, Consequences (Queen\'s Proclamation)' },
                { title: 'Socio-Religious Reform Movements', description: 'Raja Ram Mohan Roy (Brahmo Samaj), Dayanand Saraswati (Arya Samaj), Vivekananda, Jyotiba Phule, Theosophical Society' },
                { title: 'Indian National Congress (Pre-Gandhian)', description: 'Foundation (1885), Moderate Phase (Demands, Methods), Extremist Phase (Swadeshi Movement, Surat Split), Home Rule Movement' },
                { title: 'Gandhian Era', description: 'Return of Gandhi, Champaran, Kheda, Ahmedabad Mill Strike, Rowlatt Act, Jallianwala Bagh, Non-Cooperation Movement, Civil Disobedience Movement, Dandi March, Gandhi-Irwin Pact, Round Table Conferences, Quit India Movement' },
                { title: 'Revolutionary Nationalism', description: 'HRA, HSRA, Bhagat Singh, Chandrashekhar Azad, Surya Sen, INA (Subhash Chandra Bose)' },
                { title: 'Towards Independence', description: 'August Offer, Cripps Mission, Cabinet Mission Plan, Mountbatten Plan, Partition, Independence Act 1947' }
            ]
        }
    ]
};
