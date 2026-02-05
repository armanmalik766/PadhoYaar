import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { fetchQuizHistory } from '../services/geminiService';
import { useStore } from '../store/MockSupabaseStore';
import { Ionicons } from '@expo/vector-icons';

const QuizHistoryScreen = ({ onBack }: { onBack: () => void }) => {
    const { user } = useStore();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        if (user) {
            const data = await fetchQuizHistory(user.id);
            if (data.success) {
                setHistory(data.results);
            }
        }
        setLoading(false);
    };

    const renderItem = ({ item }: { item: any }) => {
        const isPass = item.percentage >= 50;
        const date = new Date(item.date).toLocaleDateString();

        return (
            <View style={styles.card}>
                <View style={{ flex: 1 }}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.subjectText}>
                            {item.subject || item.category || 'General Quiz'}
                        </Text>
                        <View style={[styles.badge, isPass ? styles.badgePass : styles.badgeFail]}>
                            <Text style={[styles.badgeText, isPass ? styles.textPass : styles.textFail]}>
                                {isPass ? 'PASS' : 'FAIL'}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.dateText}>{date}</Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.percentageText}>
                        {item.percentage}%
                    </Text>
                    <Text style={styles.scoreText}>
                        {item.score} pts
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Quiz History</Text>
                <View style={{ width: 32 }} />
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#4F46E5" />
                </View>
            ) : history.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="document-text-outline" size={64} color="#d1d5db" />
                    <Text style={styles.emptyText}>No quiz attempts yet.</Text>
                    <Text style={styles.emptySubText}>Start a quiz to see your results here.</Text>
                </View>
            ) : (
                <FlatList
                    data={history}
                    renderItem={renderItem}
                    keyExtractor={(_, index) => index.toString()}
                    contentContainerStyle={{ padding: 20 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 48,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        backgroundColor: '#fff',
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#f3f4f6',
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        // Elevation for Android
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    subjectText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginRight: 8,
        flexShrink: 1,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 9999,
    },
    badgePass: {
        backgroundColor: '#dcfce7',
    },
    badgeFail: {
        backgroundColor: '#fee2e2',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    textPass: {
        color: '#15803d',
    },
    textFail: {
        color: '#b91c1c',
    },
    dateText: {
        fontSize: 12,
        color: '#6b7280',
    },
    percentageText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4f46e5',
    },
    scoreText: {
        fontSize: 12,
        color: '#9ca3af',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#9ca3af',
        textAlign: 'center',
    },
    emptySubText: {
        marginTop: 8,
        fontSize: 14,
        color: '#9ca3af',
        textAlign: 'center',
    }
});

export default QuizHistoryScreen;
