import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking, Platform, StatusBar } from 'react-native';

const NewsDetailScreen = ({ item, onClose }: any) => {
    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 50 }}>
            <TouchableOpacity onPress={onClose}>
                <Text style={{ padding: 16, color: '#2563eb', fontSize: 16 }}>← Back</Text>
            </TouchableOpacity>

            {item.imageUrl && (
                <Image source={{ uri: item.imageUrl }} style={styles.image} />
            )}

            <View style={styles.contentContainer}>
                <Text style={styles.source}>
                    {item.source} • {item.date}
                </Text>

                <Text style={styles.title}>{item.title}</Text>

                <Text style={styles.summary}>{item.summary}</Text>

                {item.link ? (
                    <Text
                        style={styles.readMore}
                        onPress={() => Linking.openURL(item.link)}
                    >
                        Read full article →
                    </Text>
                ) : null}
            </View>
        </ScrollView>
    );
};

export default NewsDetailScreen;

const styles = StyleSheet.create({
    image: {
        width: '100%',
        height: 220,
        backgroundColor: '#e5e7eb'
    },
    contentContainer: {
        padding: 16
    },
    source: {
        fontSize: 12,
        color: '#2563eb',
        marginBottom: 8,
        fontWeight: '600'
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#0f172a',
        marginBottom: 12,
        lineHeight: 30
    },
    summary: {
        fontSize: 16,
        lineHeight: 24,
        color: '#334155'
    },
    readMore: {
        marginTop: 20,
        fontSize: 16,
        fontWeight: '700',
        color: '#2563eb'
    }
});
