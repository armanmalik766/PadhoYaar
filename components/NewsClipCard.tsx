
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

type Props = {
    title: string;
    summary: string;
    source: string;
    date: string;
    imageUrl?: string;
    onPress: () => void;
};

// Helper for source colors
const getSourceColor = (source: string) => {
    const s = source.toLowerCase();
    if (s.includes('hindu')) return '#1d4ed8'; // Blue
    if (s.includes('bbc')) return '#be123c'; // Red/Rose
    if (s.includes('express')) return '#ea580c'; // Orange
    if (s.includes('pib')) return '#059669'; // Green
    if (s.includes('air')) return '#0891b2'; // Cyan
    return '#6366f1'; // Default Indigo
};

const NewsClipCard = ({
    title,
    summary,
    source,
    date,
    imageUrl,
    onPress
}: Props) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.mainContent}>
                <View style={[styles.textColumn, !imageUrl && styles.fullWidth]}>
                    <View style={styles.metaRow}>
                        <Text style={[styles.source, { color: getSourceColor(source) }]}>{source}</Text>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.date}>{date}</Text>
                    </View>

                    <Text style={styles.title} numberOfLines={3}>
                        {title}
                    </Text>

                    <Text style={styles.summary} numberOfLines={2}>
                        {summary}
                    </Text>
                </View>

                {imageUrl ? (
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : null}
            </View>
        </TouchableOpacity>
    );
};

export default NewsClipCard;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    mainContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    textColumn: {
        flex: 1,
        paddingRight: 16,
    },
    fullWidth: {
        paddingRight: 0,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    source: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    bullet: {
        fontSize: 12,
        color: '#94a3b8',
        marginHorizontal: 4,
    },
    date: {
        fontSize: 11,
        color: '#64748b',
        fontWeight: '500',
    },
    title: {
        fontSize: 17,
        fontWeight: '700', // Editorial weight
        color: '#1e293b',
        lineHeight: 24, // Better breathability
        marginBottom: 6,
        letterSpacing: -0.3,
    },
    summary: {
        fontSize: 15, // Slightly larger reading size
        color: '#475569',
        lineHeight: 22,
    },
    image: {
        width: 100,
        height: 100, // Larger image square
        borderRadius: 8,
        backgroundColor: '#f1f5f9',
    },
});
