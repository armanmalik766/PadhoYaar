
// services/api/rssService.ts
import Parser from 'rss-parser';

export type CurrentAffairsItem = {
    title: string;
    summary: string;
    source: string;
    date: string;
    imageUrl?: string;
    link?: string;
};

const parser = new Parser({
    timeout: 15000,
    customFields: {
        item: ['media:content', 'media:thumbnail']
    }
});

// 🧩 STEP 2 — PURE REGEX PIB FETCH (NO XML PARSER AT ALL)
const fetchPIBManually = async () => {
    try {
        const res = await fetch('https://pib.gov.in/RssMain.aspx');
        const xml = await res.text();

        const items: any[] = [];

        // Split safely on <item>
        const rawItems = xml.split('<item>').slice(1);

        for (const raw of rawItems) {
            const title = raw.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/s)?.[1];
            const link = raw.match(/<link>(.*?)<\/link>/)?.[1];
            const pubDate = raw.match(/<pubDate>(.*?)<\/pubDate>/)?.[1];
            const description =
                raw.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/s)?.[1];

            if (!title) continue;

            items.push({
                title: title.trim(),
                summary: description
                    ? description.replace(/<[^>]+>/g, '').trim()
                    : '',
                source: 'PIB',
                date: pubDate
                    ? new Date(pubDate).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0],
                imageUrl: undefined, // PIB has no usable images
                link: link?.trim() || 'https://pib.gov.in'
            });
        }

        return items;
    } catch (e) {
        console.warn('⚠️ PIB skipped (regex manual fetch failed)', e);
        return [];
    }
};

export const fetchRSSFeeds = async (): Promise<CurrentAffairsItem[]> => {
    const items: any[] = [];

    // ✅ The Hindu, Indian Express, BBC (User Request)
    const NORMAL_FEEDS = [
        {
            source: 'The Hindu',
            url: 'https://www.thehindu.com/news/national/feeder/default.rss'
        },
        {
            source: 'Indian Express',
            url: 'https://indianexpress.com/feed/'
        },
        {
            source: 'BBC India',
            url: 'http://feeds.bbci.co.uk/news/world/asia/india/rss.xml'
        }
    ];

    for (const feed of NORMAL_FEEDS) {
        try {
            const parsed = await parser.parseURL(feed.url);

            parsed.items.forEach((item: any) => {
                // Ensure we get a valid date string or fallback
                const itemDateStr = item.isoDate || item.pubDate || new Date().toISOString();
                const itemDateObj = new Date(itemDateStr);

                items.push({
                    title: item.title,
                    summary: item.contentSnippet || '',
                    source: feed.source,
                    date: itemDateObj.toISOString().split('T')[0],
                    timestamp: itemDateObj.getTime(), // Store for filtering
                    imageUrl:
                        item.enclosure?.url ||
                        item['media:content']?.url ||
                        item['media:thumbnail']?.url,
                    link: item.link
                });
            });
        } catch (e) {
            console.warn(`⚠️ RSS skipped: ${feed.source}`);
        }
    }

    // Filter items older than 24 hours
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);

    return items
        .filter(item => item.title && item.timestamp > twentyFourHoursAgo)
        .sort((a: any, b: any) => b.timestamp - a.timestamp);
};
