import { SyllabusSection } from '../../../types/syllabus';

export const prelimsEconomy: SyllabusSection = {
    examStage: 'PRELIMS',
    subject: 'Economy',
    paper: 'Economy',
    topics: [
        {
            title: 'National Income Accounting',
            subtopics: [
                { title: 'Macroeconomic Aggregates', description: 'GDP, GNP, NDP, NNP (Factor Cost vs Market Price)' },
                { title: 'Real vs Nominal GDP', description: 'GDP Deflator' },
                { title: 'Methods of Calculation', description: 'Value Added, Income, Expenditure methods' }
            ]
        },
        {
            title: 'Money and Banking',
            subtopics: [
                { title: 'Money', description: 'Functions, Money Multiplier, Money Supply Measures (M0, M1, M2, M3, M4)' },
                { title: 'RBI', description: 'History, Functions, Monetary Policy (Repo, Reverse Repo, CRR, SLR, OMO, MSF, Bank Rate)' },
                { title: 'Banking System', description: 'Commercial Banks, PSBs vs Private, RRBs, Cooperative Banks, Small Finance Banks, Payment Banks' },
                { title: 'NPA Crisis', description: 'Classification of Assets, SARFAESI, IBC, Bad Bank' },
                { title: 'Financial Inclusion', description: 'PMJDY, JAM Trinity, Digital Payments (UPI, NEFT, RTGS)' }
            ]
        },
        {
            title: 'Inflation',
            subtopics: [
                { title: 'Types', description: 'Demand Pull, Cost Push, Structural, Creeping, Galloping, Hyperinflation' },
                { title: 'Indices', description: 'WPI, CPI (Combined, Rural, Urban), PPI, GDP Deflator' },
                { title: 'Effects & Control', description: 'Impact on borrowers/lenders, exports/imports; Monetary vs Fiscal measures' }
            ]
        },
        {
            title: 'Fiscal Policy',
            subtopics: [
                { title: 'Union Budget', description: 'Revenue & Capital Receipts/Expenditure' },
                { title: 'Deficits', description: 'Fiscal Deficit, Revenue Deficit, Primary Deficit, Effective Revenue Deficit' },
                { title: 'Taxation', description: 'Direct Taxes (Income, Corporate), Indirect Taxes (GST Structure, Slab rates)' },
                { title: 'FRBM Act', description: 'Targets and recommendations' }
            ]
        },
        {
            title: 'External Sector',
            subtopics: [
                { title: 'Balance of Payments', description: 'Current Account (Visible, Invisible), Capital Account (FDI, FII/FPI, Loans)' },
                { title: 'Exchange Rate', description: 'NEER, REER, Depreciation, Appreciation' },
                { title: 'International Organizations', description: 'IMF (SDR, Quota), World Bank Group, WTO (Trips, Trims, AoA)' }
            ]
        },
        {
            title: 'Planning and Development',
            subtopics: [
                { title: 'Planning Commission vs NITI Aayog', description: 'Structure and approach' },
                { title: 'Poverty', description: 'Estimation committees (Tendulkar, Rangarajan), MPI' },
                { title: 'Unemployment', description: 'Types, PLFS data' }
            ]
        }
    ]
};
