import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useStore } from '../store/MockSupabaseStore';
import { Card, Badge, Button } from '../components/UIComponents';
import { Clock, Check, Calendar } from 'lucide-react-native';

const RevisionScreen = () => {
  const { revisions, completeRevision, t } = useStore();
  const [filter, setFilter] = React.useState<'ALL' | 'DUE' | 'UPCOMING'>('DUE');
  const today = new Date().toISOString().split('T')[0];

  const due = revisions.filter(
    r => r.nextRevisionDate <= today && r.status !== 'COMPLETED_FOR_CYCLE'
  );

  const upcoming = revisions
    .filter(r => r.nextRevisionDate > today)
    .sort((a, b) => a.nextRevisionDate.localeCompare(b.nextRevisionDate));

  const displayList = filter === 'DUE' ? due : filter === 'UPCOMING' ? upcoming : [...due, ...upcoming];

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('rev_title')}</Text>
        <Text style={styles.subtitle}>Master your subjects with spaced repetition.</Text>
      </View>

      {/* FILTER TABS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {(['DUE', 'UPCOMING', 'ALL'] as const).map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'DUE' ? 'Due Today' : f === 'UPCOMING' ? 'Upcoming' : 'All Requests'}
            </Text>
            {f === 'DUE' && due.length > 0 && (
              <View style={styles.badgeCount}><Text style={styles.badgeCountText}>{due.length}</Text></View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {displayList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Check size={48} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>All Caught Up!</Text>
          <Text style={styles.emptyText}>You have no pending revisions for this category.</Text>
        </View>
      ) : (
        displayList.map(r => {
          const isDue = r.nextRevisionDate <= today;
          return (
            <Card key={r.id} style={styles.revCard}>
              <View style={styles.cardHeader}>
                <Badge color={isDue ? 'red' : 'blue'}>{isDue ? 'DUE NOW' : `Due ${r.nextRevisionDate}`}</Badge>
                <Text style={styles.stageText}>Stage {r.stage}</Text>
              </View>

              <Text style={styles.topicTitle}>{r.topic}</Text>

              <View style={styles.actionRow}>
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() => { /* Mock Reschedule */ alert('Rescheduled for tomorrow'); }}
                  style={styles.actionBtn}
                >
                  <Clock size={14} color="#64748b" /> Later
                </Button>

                {isDue && (
                  <Button
                    size="sm"
                    variant="primary"
                    onPress={() => completeRevision(r.id)}
                    style={styles.actionBtn}
                  >
                    <Check size={14} color="#fff" /> Complete
                  </Button>
                )}
              </View>
            </Card>
          );
        })
      )}
    </ScrollView>
  );
};

export default RevisionScreen;

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 100, paddingTop: 60 },
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '900', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },

  filterRow: { marginBottom: 20, flexDirection: 'row' },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  filterBtnActive: { backgroundColor: '#0f172a' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  filterTextActive: { color: '#fff' },
  badgeCount: { backgroundColor: '#ef4444', borderRadius: 10, paddingHorizontal: 6, height: 16, justifyContent: 'center', marginLeft: 6 },
  badgeCountText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  revCard: { marginBottom: 16, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  stageText: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
  topicTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginBottom: 16 },

  actionRow: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  actionBtn: { paddingHorizontal: 16 },

  emptyContainer: { alignItems: 'center', marginTop: 60, opacity: 0.8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16, color: '#334155' },
  emptyText: { color: '#94a3b8', textAlign: 'center', marginTop: 8, maxWidth: 250 },
});
