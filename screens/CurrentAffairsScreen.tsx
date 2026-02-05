
import React, { useEffect, useState } from 'react';
import { FlatList, View, ActivityIndicator, Text, TouchableOpacity, ScrollView, StyleSheet, Platform, StatusBar } from 'react-native';
import NewsClipCard from '../components/NewsClipCard';
import NewsDetailScreen from './NewsDetailScreen'; // Import detail screen
import { API_BASE } from '../services/config';
import { useStore } from '../store/MockSupabaseStore'; // Added

// User requested specifc filters
const TABS = ['ALL', 'The Hindu', 'Indian Express', 'BBC India'];

const CurrentAffairsScreen = () => {
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL');
    const [selectedNews, setSelectedNews] = useState<any | null>(null);

    const { markNewsRead } = useStore(); // Added

    useEffect(() => {
        markNewsRead(); // Clear badge on entry
        fetch(`${API_BASE}/current-affairs/today`)
            .then(res => res.json())
            .then(data => {
                setNews(data.items || []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch news:', err);
                setLoading(false);
            });
    }, []);

    const filteredNews = activeTab === 'ALL'
        ? news
        : news.filter(item => item.source === activeTab);

    if (selectedNews) {
        return (
            <NewsDetailScreen
                item={selectedNews}
                onClose={() => setSelectedNews(null)}
            />
        );
    }

    return (
        <View style={styles.container}>
            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
                    {TABS.map(tab => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activeTab === tab && styles.activeTab]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#4f46e5" />
                </View>
            ) : (
                <FlatList
                    data={filteredNews}
                    keyExtractor={(item, index) => index.toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <NewsClipCard
                            title={item.title}
                            summary={item.summaryPoints?.join(' • ') || item.summary || ''}
                            source={item.source}
                            date={item.date}
                            imageUrl={item.imageUrl}
                            onPress={() => setSelectedNews(item)}
                        />
                    )}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={styles.emptyText}>No recent news from {activeTab}.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

export default CurrentAffairsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff', // Clean white background
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 50,
    },
    tabsContainer: {
        backgroundColor: '#fff',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        zIndex: 10,
    },
    tabsScroll: {
        paddingHorizontal: 16,
        gap: 12,
    },
    tab: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 24,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginRight: 8,
    },
    activeTab: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
        elevation: 4,
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        letterSpacing: 0.3,
    },
    activeTabText: {
        color: '#ffffff',
        fontWeight: '700',
    },
    listContent: {
        paddingBottom: 24, // Bottom breathing room only
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    emptyText: {
        fontSize: 16,
        color: '#94a3b8'
    }
});
