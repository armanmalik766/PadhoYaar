
// services/api/currentAffairsApi.ts

export type CurrentAffairsItem = {
    title: string;
    summary: string;
    source: string;
    date: string;
    imageUrl?: string;
};

export const getCurrentAffairs = async (date?: string): Promise<CurrentAffairsItem[]> => {
    // Mock data (UPSC-relevant, MAINS focused)
    return [
        {
            title: "Union Budget 2026 Highlights",
            summary:
                "Focus on capital expenditure, digital public infrastructure, green hydrogen mission, and fiscal consolidation roadmap.",
            source: "The Hindu",
            date: "2026-02-01",
            imageUrl: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5"
        },
        {
            title: "New Bill on Data Protection Passed in Parliament",
            summary:
                "The bill strengthens data fiduciary obligations, introduces consent-based data processing, and sets up a Data Protection Board.",
            source: "PRS India",
            date: "2026-02-01",
            imageUrl: "https://images.unsplash.com/photo-1589820296156-2454bb8a6ad1"
        },
        {
            title: "India–EU Summit: Key Outcomes",
            summary:
                "Emphasis on clean energy cooperation, semiconductor supply chains, and rules-based international order.",
            source: "AIR News",
            date: "2026-02-01",
            imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c"
        }
    ];
};
