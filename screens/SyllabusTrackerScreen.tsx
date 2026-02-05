import React, { useEffect, useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import { useStore } from '../store/MockSupabaseStore';
import { fetchSyllabusStatus, toggleTopicStatus } from '../services/geminiService';
import { ChevronRight, ChevronDown, CheckSquare, Square, CheckCircle, BookOpen, ArrowLeft } from 'lucide-react-native';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const TopicNode = ({ node, level, onToggle }: { node: any, level: number, onToggle: (path: string, status: string) => void }) => {
    const [expanded, setExpanded] = useState(false);
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;
    const isCompleted = node.status === 'COMPLETED';
    const isPartial = node.status === 'IN_PROGRESS';

    const handleToggle = () => {
        const newStatus = isCompleted ? 'PENDING' : 'COMPLETED';
        onToggle(node.topicPath, newStatus);
    };

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    return (
        <View style={{ marginLeft: level * 12, marginTop: 4 }}>
            <View style={styles.nodeRow}>
                <TouchableOpacity onPress={toggleExpand} style={styles.expandIcon} disabled={!hasChildren}>
                    {hasChildren && (
                        expanded ? <ChevronDown size={14} color="#64748b" /> : <ChevronRight size={14} color="#94a3b8" />
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={handleToggle} style={styles.checkbox}>
                    {isCompleted ? (
                        <CheckSquare size={20} color="#22c55e" />
                    ) : (
                        <Square size={20} color={isPartial ? "#f59e0b" : "#cbd5e1"} fill={isPartial ? "#fef3c7" : "transparent"} />
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={toggleExpand} style={{ flex: 1, paddingVertical: 8 }}>
                    <Text style={[
                        styles.nodeTitle,
                        { fontSize: level === 0 ? 16 : 14, fontWeight: level === 0 ? '700' : '400' },
                        isCompleted && { textDecorationLine: 'line-through', color: '#94a3b8' }
                    ]}>
                        {String(node.title || '')}
                    </Text>
                </TouchableOpacity>

                {isPartial && !expanded && <View style={styles.dot} />}
            </View>

            {expanded && hasChildren && (
                <View>
                    {node.children.map((child: any, index: number) => (
                        <TopicNode key={child.topicId || index} node={child} level={level + 1} onToggle={onToggle} />
                    ))}
                </View>
            )}
        </View>
    );
};

const SyllabusTrackerScreen = ({ navigation, onBack }: { navigation?: any, onBack?: () => void }) => {
    const { user } = useStore();
    const [loading, setLoading] = useState(true);
    const [tree, setTree] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'TREE' | 'COMPLETED'>('TREE');

    useEffect(() => {
        loadSyllabus();
    }, [user]);

    const loadSyllabus = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await fetchSyllabusStatus(user.id);
            setTree(Array.isArray(data) ? data : []);
        } catch (e) {
            setTree([]);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (path: string, newStatus: string) => {
        // Optimistic Update
        const newTree = JSON.parse(JSON.stringify(tree));

        const updateNode = (nodes: any[]) => {
            for (const node of nodes) {
                if (node.topicPath === path) {
                    node.status = newStatus;
                    return true;
                }
                if (node.children) {
                    if (updateNode(node.children)) return true;
                }
            }
            return false;
        };

        updateNode(newTree);
        setTree(newTree); // Temporary set

        if (user) {
            await toggleTopicStatus(user.id, path, newStatus as any);
            loadSyllabus(); // Fetch authoritative state (aggregations etc)
        }
    };

    // Flatten for completed view
    const completedList = useMemo(() => {
        const list: any[] = [];
        const traverse = (nodes: any[]) => {
            nodes.forEach(node => {
                if (node.status === 'COMPLETED' && (!node.children || node.children.length === 0)) {
                    list.push(node);
                }
                if (node.children) traverse(node.children);
            });
        };
        if (Array.isArray(tree)) {
            traverse(tree);
        }
        return list.sort((a, b) => (new Date(b.completedDate || 0).getTime() - new Date(a.completedDate || 0).getTime()));
    }, [tree]);

    return (
        <View style={styles.root}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={{ padding: 8, marginRight: 8, marginLeft: -8 }}>
                    <ArrowLeft size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.title}>Syllabus Tracker</Text>
            </View>

            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'TREE' && styles.activeTab]}
                    onPress={() => setActiveTab('TREE')}
                >
                    <BookOpen size={16} color={activeTab === 'TREE' ? '#4f46e5' : '#64748b'} />
                    <Text style={[styles.tabText, activeTab === 'TREE' && styles.activeTabText]}>Syllabus Tree</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'COMPLETED' && styles.activeTab]}
                    onPress={() => setActiveTab('COMPLETED')}
                >
                    <CheckCircle size={16} color={activeTab === 'COMPLETED' ? '#4f46e5' : '#64748b'} />
                    <Text style={[styles.tabText, activeTab === 'COMPLETED' && styles.activeTabText]}>Completed ({completedList.length})</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#4f46e5" />
                    <Text style={{ marginTop: 12, color: '#94a3b8' }}>Syncing Syllabus...</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {activeTab === 'TREE' ? (
                        <View style={{ paddingBottom: 40 }}>
                            {Array.isArray(tree) && tree.map((section: any) => (
                                <TopicNode key={section.topicId || Math.random()} node={section} level={0} onToggle={handleToggle} />
                            ))}
                        </View>
                    ) : (
                        <View>
                            {completedList.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyText}>No topics completed properly yet.</Text>
                                </View>
                            ) : (
                                completedList.map((item, i) => (
                                    <View key={item.topicId || i} style={styles.completedItem}>
                                        <CheckCircle size={16} color="#22c55e" />
                                        <View>
                                            <Text style={styles.completedTitle}>{String(item.title || '')}</Text>
                                            <Text style={styles.completedPath}>{String(item.topicPath || '')}</Text>
                                            {item.completedDate && <Text style={styles.completedDate}>Done on {new Date(item.completedDate).toLocaleDateString()}</Text>}
                                        </View>
                                    </View>
                                ))
                            )}
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#f8fafc' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    title: { fontSize: 24, fontWeight: '800', color: '#1e293b' },
    tabs: { flexDirection: 'row', padding: 4, margin: 16, backgroundColor: '#fff', borderRadius: 12 },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: 10 },
    activeTab: { backgroundColor: '#e0e7ff' },
    tabText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
    activeTabText: { color: '#4f46e5' },
    content: { paddingHorizontal: 16 },

    // Node Styles
    nodeRow: { flexDirection: 'row', alignItems: 'center' },
    expandIcon: { padding: 8, width: 32, alignItems: 'center' },
    checkbox: { padding: 8 },
    nodeTitle: { color: '#1e293b' },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#f59e0b', marginLeft: 8 },

    // Completed Styles
    completedItem: { flexDirection: 'row', gap: 12, padding: 16, backgroundColor: '#fff', borderRadius: 12, marginBottom: 8 },
    completedTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
    completedPath: { fontSize: 11, color: '#64748b', marginTop: 2 },
    completedDate: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
    emptyState: { padding: 40, alignItems: 'center' },
    emptyText: { color: '#94a3b8' }
});

export default SyllabusTrackerScreen;
