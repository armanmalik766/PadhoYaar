import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Image, Dimensions, StatusBar, Platform } from 'react-native';
import { useStore } from '../store/MockSupabaseStore';
import { fetchLeaderboard } from '../services/geminiService';
import { ArrowLeft, Crown, Trophy, Sparkles, Medal, Zap } from 'lucide-react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle, ClipPath } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Colors for Dark Theme
const THEME = {
    bgStart: '#1e1b4b', // Deep Indigo
    bgEnd: '#312e81',   // Indigo 900
    cardBg: 'rgba(255, 255, 255, 0.1)',
    cardBorder: 'rgba(255, 255, 255, 0.2)',
    text: '#ffffff',
    textDim: '#a5b4fc', // Indigo 200
    gold: '#fbbf24',
    silver: '#cbd5e1',
    bronze: '#d97706',
    accent: '#818cf8',
};

const getAvatarUrl = (name: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random&color=fff&size=128&bold=true`;
};

const LeaderboardScreen = ({ onBack }: { onBack: () => void }) => {
    const { user } = useStore();
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<'weekly' | 'allTime'>('allTime');

    useEffect(() => {
        loadLeaderboard();
        if (Platform.OS === 'android') {
            StatusBar.setBackgroundColor('transparent');
            StatusBar.setTranslucent(true);
        }
    }, [period]);

    const loadLeaderboard = async () => {
        setLoading(true);
        const data = await fetchLeaderboard(period);
        setLeaderboard(data);
        setLoading(false);
    };

    const topThree = leaderboard.slice(0, 3);
    const restList = leaderboard.slice(3);

    const renderPodiumItem = (item: any, rank: number) => {
        if (!item) return null;
        const isFirst = rank === 1;
        const size = isFirst ? 90 : 70;
        const color = isFirst ? THEME.gold : rank === 2 ? THEME.silver : THEME.bronze;
        const heightAdjust = isFirst ? 0 : 40; // Push 2nd and 3rd down

        return (
            <View style={[styles.podiumItem, { marginTop: heightAdjust }]}>
                {isFirst && (
                    <View style={styles.crownContainer}>
                        <Crown size={32} color={THEME.gold} fill={THEME.gold} />
                    </View>
                )}

                <View style={[styles.avatarGlow, { borderColor: color, width: size + 8, height: size + 8 }]}>
                    <Image
                        source={{ uri: getAvatarUrl(item.name) }}
                        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
                    />
                    <View style={[styles.rankBadge, { backgroundColor: color }]}>
                        <Text style={styles.rankBadgeText}>{rank}</Text>
                    </View>
                </View>

                <View style={styles.podiumInfo}>
                    <Text style={styles.podiumName} numberOfLines={1}>{item.name.split(' ')[0]}</Text>
                    <Text style={[styles.podiumScore, { color: color }]}>{item.averageScore}%</Text>
                </View>
            </View>
        );
    };

    const renderItem = ({ item }: { item: any }) => {
        const isCurrentUser = item.userId === user?.id;
        const rank = item.rank;

        return (
            <View style={[styles.glassCard, isCurrentUser && styles.currentUserCard]}>
                <View style={styles.rankCol}>
                    <Text style={styles.rankText}>{rank}</Text>
                </View>

                <Image
                    source={{ uri: getAvatarUrl(item.name) }}
                    style={styles.listAvatar}
                />

                <View style={styles.userCol}>
                    <Text style={styles.userName} numberOfLines={1}>
                        {item.name || 'User'} {isCurrentUser && '(You)'}
                    </Text>
                    <Text style={styles.userSubtext}>{item.attempts} Quizzes</Text>
                </View>

                <View style={styles.scoreContainer}>
                    <Zap size={14} color={THEME.accent} fill={THEME.accent} />
                    <Text style={styles.scoreValue}>{item.averageScore}%</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Immersive Background */}
            <View style={StyleSheet.absoluteFill}>
                <Svg height="100%" width="100%">
                    <Defs>
                        <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                            <Stop offset="0" stopColor={THEME.bgStart} stopOpacity="1" />
                            <Stop offset="1" stopColor={THEME.bgEnd} stopOpacity="1" />
                        </LinearGradient>
                        <LinearGradient id="sphere" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor="#4f46e5" stopOpacity="0.4" />
                            <Stop offset="1" stopColor="#4f46e5" stopOpacity="0" />
                        </LinearGradient>
                    </Defs>
                    <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
                    {/* Decorative Spheres */}
                    <Circle cx={width} cy="0" r="200" fill="url(#sphere)" />
                    <Circle cx="0" cy={height * 0.6} r="150" fill="url(#sphere)" />
                </Svg>
            </View>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.iconButton}>
                    <ArrowLeft size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Champions</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={THEME.accent} />
                </View>
            ) : leaderboard.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Trophy size={48} color={THEME.textDim} />
                    <Text style={styles.emptyText}>No data available yet.</Text>
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    {/* Period Tabs */}
                    <View style={styles.tabContainer}>
                        <View style={styles.glassTab}>
                            <TouchableOpacity
                                style={[styles.tabItem, period === 'allTime' && styles.activeTab]}
                                onPress={() => setPeriod('allTime')}
                            >
                                <Text style={[styles.tabText, period === 'allTime' && styles.activeTabText]}>All Time</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tabItem, period === 'weekly' && styles.activeTab]}
                                onPress={() => setPeriod('weekly')}
                            >
                                <Text style={[styles.tabText, period === 'weekly' && styles.activeTabText]}>Weekly</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <FlatList
                        data={restList}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.userId.toString()}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListHeaderComponent={
                            <View style={styles.podiumContainer}>
                                {topThree.length >= 2 && renderPodiumItem(topThree[1], 2)}
                                {topThree.length >= 1 && renderPodiumItem(topThree[0], 1)}
                                {topThree.length >= 3 && renderPodiumItem(topThree[2], 3)}
                            </View>
                        }
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.bgStart },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 60, paddingBottom: 10,
    },
    headerTitle: { fontSize: 28, fontWeight: '800', color: THEME.text, letterSpacing: 0.5 },
    iconButton: {
        padding: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)'
    },

    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
    emptyText: { color: THEME.textDim, fontSize: 16 },

    // Tabs
    tabContainer: { alignItems: 'center', marginVertical: 20 },
    glassTab: {
        flexDirection: 'row', padding: 4, width: '60%',
        backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 20,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
    },
    tabItem: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 16 },
    activeTab: { backgroundColor: 'rgba(255,255,255,0.15)' },
    tabText: { color: THEME.textDim, fontWeight: '600', fontSize: 13 },
    activeTabText: { color: '#fff' },

    // Podium
    podiumContainer: {
        flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start',
        marginBottom: 40, height: 220, paddingHorizontal: 10
    },
    podiumItem: { alignItems: 'center', marginHorizontal: 10 },
    crownContainer: { marginBottom: -15, zIndex: 10 },
    avatarGlow: {
        borderWidth: 2, padding: 2, borderRadius: 100,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#fff', shadowOpacity: 0.2, shadowRadius: 10, elevation: 5,
        backgroundColor: 'rgba(255,255,255,0.05)'
    },
    avatar: { backgroundColor: '#333' },
    rankBadge: {
        position: 'absolute', bottom: -10,
        width: 24, height: 24, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: '#1e1b4b'
    },
    rankBadgeText: { color: '#1e1b4b', fontSize: 12, fontWeight: '800' },
    podiumInfo: { alignItems: 'center', marginTop: 16 },
    podiumName: { color: '#fff', fontWeight: '700', fontSize: 15, marginBottom: 4, maxWidth: 90, textAlign: 'center' },
    podiumScore: { fontWeight: '800', fontSize: 14 },

    // List
    listContent: { paddingBottom: 40, paddingHorizontal: 20 },
    glassCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: THEME.cardBg, borderColor: THEME.cardBorder, borderWidth: 1,
        borderRadius: 20, padding: 16, marginBottom: 12
    },
    currentUserCard: {
        backgroundColor: 'rgba(99, 102, 241, 0.2)', // Indigo tint
        borderColor: '#818cf8'
    },
    rankCol: { width: 30, alignItems: 'center' },
    rankText: { color: THEME.textDim, fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'] },
    listAvatar: { width: 44, height: 44, borderRadius: 22, marginHorizontal: 12 },
    userCol: { flex: 1 },
    userName: { color: '#fff', fontSize: 16, fontWeight: '600' },
    userSubtext: { color: THEME.textDim, fontSize: 12 },
    scoreContainer: { alignItems: 'flex-end', justifyContent: 'center' },
    scoreValue: { color: '#fff', fontSize: 16, fontWeight: '700' }
});

export default LeaderboardScreen;
