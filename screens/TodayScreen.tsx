import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  Pressable,
  LayoutAnimation,
  UIManager,
  Modal as RNModal,
  Linking,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

import { useStore } from '../store/MockSupabaseStore';
import { Button, Modal, Input } from '../components/UIComponents';
import { TaskType, TaskStatus } from '../types';
import {
  BookOpen,
  RefreshCw,
  PenTool,
  Flame,
  Play,
  Plus,
  RotateCcw,
  Target,
  PartyPopper,
  ChevronDown,
  ChevronUp,
  Clock,
  Check,
  Repeat,
  Bookmark,
  SkipForward, // Added
  CheckCircle, // Added
} from 'lucide-react-native';
import { FocusTimer } from '../components/FocusTimer';

const { width } = Dimensions.get('window');

const TodayScreen = () => {
  const {
    tasks,
    refreshDailyTasks,
    markTaskComplete,
    skipTask, // Added
    startSession,
    endSession,
    activeSession,
    addCustomTask,
    user,
    examDates,
    getRealtimeExamDates,
    streak,
    isLoading, // Added
    toggleBookmark,
  } = useStore();

  const [expanded, setExpanded] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false); // Added
  const [showAdd, setShowAdd] = useState(false);
  // Skip Menu State
  const [skippingId, setSkippingId] = useState<string | null>(null); // Added
  const [title, setTitle] = useState('');
  const [customDuration, setCustomDuration] = useState('60');
  const [fetchingDates, setFetchingDates] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const todaysTasks = useMemo(() => tasks.filter(t => t.date === today), [tasks, today]);
  const completed = todaysTasks.filter(t => t.status === TaskStatus.COMPLETED);
  const pending = todaysTasks.filter(t => t.status === TaskStatus.PENDING).sort((a, b) => {
    if (a.isBookmarked && !b.isBookmarked) return -1;
    if (!a.isBookmarked && b.isBookmarked) return 1;
    return 0;
  });

  // Time-based Progress Calculation
  const totalMinutes = todaysTasks.reduce((acc, t) => acc + (t.duration || 0), 0);
  const completedMinutes = completed.reduce((acc, t) => acc + (t.duration || 0), 0);
  const progress = totalMinutes === 0 ? 0 : Math.round((completedMinutes / totalMinutes) * 100);

  // Group tasks by subject (Optional, for future use)
  const tasksBySubject = useMemo(() => {
    const groups: Record<string, typeof pending> = {};
    pending.forEach(t => {
      let subject = 'General';
      if (t.title.includes(':')) {
        subject = t.title.split(':')[0].trim();
      } else if (t.type === TaskType.REVISION) {
        subject = 'Revision';
      }
      if (!groups[subject]) groups[subject] = [];
      groups[subject].push(t);
    });
    return groups;
  }, [pending]);

  const countdown = useMemo(() => {
    const now = new Date();
    const year = user?.attemptYear || 2026;
    const parse = (d?: string) => {
      if (!d) return null;
      const [y, m, da] = d.split('-').map(Number);
      return new Date(y, m - 1, da);
    };
    const prelims = parse(examDates?.prelims) || new Date(year, 4, 25);
    const mains = parse(examDates?.mains) || new Date(year, 8, 20); // Sept 20 estimate

    const diff = (d: Date) => Math.max(0, Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    return {
      prelims: diff(prelims),
      mains: diff(mains),
      prelimsDate: prelims,
      mainsDate: mains
    };
  }, [examDates, user?.attemptYear]);

  useEffect(() => {
    if (user) {
      refreshDailyTasks();
      setFetchingDates(true);
      getRealtimeExamDates().finally(() => setFetchingDates(false));
    }
  }, [user]);



  const createTask = () => {
    if (!title.trim()) return;
    const duration = parseInt(customDuration) || 60;
    addCustomTask({ title, type: TaskType.STUDY, duration, description: 'Custom task' }, 'NONE');
    setTitle('');
    setCustomDuration('60');
    setShowAdd(false);
  };

  const getTaskColor = (task: any) => {
    // 1. Completed always Green
    if (task.status === TaskStatus.COMPLETED) return '#22c55e';

    // 2. Revisions have own color (Sky Blue)
    if (task.type === TaskType.REVISION || task.type === TaskType.SYLLABUS_REVISION) return '#0ea5e9';

    // 3. All Pending Subjects -> "Plus Button" Blue
    return '#4f46e5';
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning,';
    if (hours < 18) return 'Good Afternoon,';
    return 'Good Evening,';
  };

  const renderTaskItem = (task: any) => {
    const isSyllabus = task.type === TaskType.SYLLABUS_STUDY || task.type === TaskType.SYLLABUS_REVISION;
    const Icon = (task.type === TaskType.REVISION || task.type === TaskType.SYLLABUS_REVISION) ? Repeat : task.type === TaskType.ANSWER_WRITING ? PenTool : BookOpen;
    const isExpanded = expanded === task.id;
    const taskColor = getTaskColor(task);

    const toggleExpand = () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExpanded(isExpanded ? null : task.id);
      setSkippingId(null); // Close skip options when expanding/collapsing
    };

    return (
      <View key={task.id} style={[styles.taskCard, isExpanded && styles.taskCardExpanded]}>
        <Pressable onPress={toggleExpand} style={styles.taskContent}>
          <View style={[styles.taskLeftStrip, { backgroundColor: taskColor }]} />

          <View style={styles.taskMain}>
            <View style={styles.taskHeaderRow}>
              <Text style={styles.taskSubject}>{task.type.replace('SYLLABUS_', '')}</Text>
              <View style={styles.durationBadge}>
                <Clock size={10} color="#64748b" />
                <Text style={styles.durationText}>{task.duration}m</Text>
              </View>
            </View>

            <Text style={styles.taskTitle}>{task.title}</Text>

            {(!isExpanded && task.description) && (
              <Text style={styles.taskDescPreview} numberOfLines={1}>{task.description}</Text>
            )}

            {/* Show Topic Path for Syllabus Tasks */}
            {isExpanded && isSyllabus && (
              <View style={{ marginBottom: 8, padding: 8, backgroundColor: '#f8fafc', borderRadius: 8 }}>
                <Text style={{ fontSize: 11, color: '#64748b', fontWeight: '600' }}>TOPIC PATH</Text>
                <Text style={{ fontSize: 13, color: '#334155' }}>{task.description}</Text>
              </View>
            )}

            {isExpanded && (
              <View style={styles.expandedContent}>
                {task.description && <Text style={styles.fullDesc}>{task.description}</Text>}

                {task.subtasks && task.subtasks.length > 0 && (
                  <View style={styles.subtaskList}>
                    {task.subtasks.map((sub: string, i: number) => (
                      <View key={i} style={styles.subtaskRow}>
                        <View style={[styles.dot, { backgroundColor: taskColor }]} />
                        <Text style={styles.subtaskText}>{sub}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Expanded Content: Actions */}
                <View style={{ marginTop: 12 }}>
                  {/* Skip Options Row */}
                  {skippingId === task.id ? (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f1f5f9', padding: 8, borderRadius: 12, marginBottom: 12 }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b' }}>Snooze for:</Text>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        {[1, 3, 7].map(days => (
                          <TouchableOpacity
                            key={days}
                            onPress={() => {
                              skipTask(task.id, days);
                              setSkippingId(null);
                            }}
                            style={{ backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' }}
                          >
                            <Text style={{ fontSize: 12, fontWeight: '700', color: '#475569' }}>{days}d</Text>
                          </TouchableOpacity>
                        ))}
                        <TouchableOpacity onPress={() => setSkippingId(null)} style={{ padding: 6 }}>
                          <Text style={{ fontSize: 12, color: '#ef4444', fontWeight: '600' }}>X</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#f1f5f9' }]}
                        onPress={() => setSkippingId(task.id)}
                      >
                        <SkipForward size={18} color="#64748b" />
                        <Text style={[styles.actionBtnText, { color: '#64748b' }]}>Skip</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#dcfce7' }]}
                        onPress={() => markTaskComplete(task.id)}
                      >
                        <CheckCircle size={18} color="#16a34a" />
                        <Text style={[styles.actionBtnText, { color: '#16a34a' }]}>Mark Done</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {task.status !== TaskStatus.COMPLETED && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.btnOutline} onPress={() => startSession(task.id, task.duration)}>
                      <Play size={16} color="#64748b" fill="#64748b" />
                      <Text style={styles.btnOutlineText}>Start Session</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: taskColor }]} onPress={() => toggleBookmark(task.id)}>
                      <Bookmark size={16} color="#fff" fill={task.isBookmarked ? "#fff" : "transparent"} />
                      <Text style={styles.btnPrimaryText}>{task.isBookmarked ? 'Unbookmark' : 'Bookmark'}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* MODERN HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.title}>{user?.name?.split(' ')[0] || 'Aspirant'}</Text>
            <View style={styles.dateBadge}>
              <Clock size={12} color="#64748b" />
              <Text style={styles.dateLabel}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setShowAdd(true)} style={styles.premiumAddBtn} activeOpacity={0.8}>
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* STATS STRIP - MODERN */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#e0e7ff' }]}>
              <Target size={18} color="#4f46e5" />
            </View>
            <Text style={styles.statValue}>{fetchingDates ? '--' : countdown.prelims}</Text>
            <Text style={styles.statLabel}>Prelims Days</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#ffedd5' }]}>
              <PenTool size={18} color="#ea580c" />
            </View>
            <Text style={styles.statValue}>{fetchingDates ? '--' : countdown.mains}</Text>
            <Text style={styles.statLabel}>Mains Days</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#fee2e2' }]}>
              <Flame size={18} color="#ef4444" />
            </View>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        {/* PROGRESS CARD */}
        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <View>
              <Text style={styles.progressLabel}>Daily Progress</Text>
              <Text style={styles.progressValue}>{progress}% <Text style={{ fontSize: 14, color: '#94a3b8', fontWeight: '400' }}>completed</Text></Text>
            </View>
            <View style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
              <PartyPopper size={24} color={progress === 100 ? '#fbbf24' : '#64748b'} />
            </View>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressFooter}>{completed.length} / {todaysTasks.length} tasks done</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today Schedule</Text>
          <TouchableOpacity onPress={() => refreshDailyTasks(true)}>
            <RefreshCw size={16} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* TASKS - Show ALL tasks for today, sorted by status (Pending first) */}
        {isLoading && (
          <View style={{ padding: 20 }}>
            <ActivityIndicator size="large" color="#4f46e5" />
            <Text style={{ textAlign: 'center', marginTop: 10, color: '#64748b' }}>Generating your plan...</Text>
          </View>
        )}

        {!isLoading && todaysTasks.length === 0 && (
          <View style={{ padding: 40, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 18, color: '#94a3b8', fontWeight: '500' }}>Your daily plan is ready.</Text>
            <Text style={{ fontSize: 14, color: '#cbd5e1', marginTop: 8 }}>Pull to refresh if it doesn't appear.</Text>
          </View>
        )}

        {/* PENDING TASKS */}
        {pending.map(renderTaskItem)}

        {/* COMPLETED HEADER */}
        {completed.length > 0 && (
          <View style={styles.completedHeader}>
            <Text style={styles.completedTitle}>Completed</Text>
            <View style={styles.completedCount}>
              <Text style={styles.completedCountText}>{completed.length}</Text>
            </View>
          </View>
        )}

        {/* COMPLETED TASKS */}
        {completed.map(renderTaskItem)}

        {/* Modal remains same */}
        <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Quick Add Task">
          <View style={styles.modalContent}>
            <View style={styles.modalBody}>
              <Input label="Title" value={title} onChangeText={setTitle} placeholder="Topic to study..." />
              <View style={{ height: 16 }} />
              <Input
                label="Duration (mins)"
                value={customDuration}
                onChangeText={setCustomDuration}
                placeholder="60"
                keyboardType="numeric"
              />
              <View style={{ height: 16 }} />
              <Button fullWidth onPress={createTask}>Add Task</Button>
            </View>
          </View>
        </Modal>

        {/* FULL SCREEN FOCUS TIMER */}
        {activeSession && (
          <RNModal
            visible={!!activeSession}
            animationType="slide"
            onRequestClose={endSession}
            statusBarTranslucent={true}
            presentationStyle="fullScreen"
          >
            <FocusTimer
              task={tasks.find(t => t.id === activeSession!.taskId)!}
              startTime={activeSession!.startTime}
              durationMinutes={activeSession!.duration}
              onComplete={() => markTaskComplete(activeSession!.taskId)}
              onCancel={endSession}
            />
          </RNModal>
        )}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  container: { padding: 20, paddingBottom: 120 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, marginTop: 10 },
  greeting: { fontSize: 14, color: '#64748b', fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '800', color: '#1e293b', lineHeight: 32 },
  dateBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 },
  dateLabel: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  premiumAddBtn: { backgroundColor: '#4f46e5', width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', shadowColor: '#4f46e5', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  iconCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statValue: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  statLabel: { fontSize: 11, color: '#64748b', fontWeight: '600' },

  // Progress
  progressCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  progressLabel: { fontSize: 14, color: '#64748b', fontWeight: '600' },
  progressValue: { fontSize: 24, fontWeight: '800', color: '#1e293b' },
  progressBarTrack: { height: 10, backgroundColor: '#f1f5f9', borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#4f46e5', borderRadius: 5 },
  progressFooter: { marginTop: 12, fontSize: 12, color: '#64748b', textAlign: 'right', fontWeight: '500' },

  // Section
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },

  // Task Card
  taskCard: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  taskCardExpanded: { shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
  taskContent: { flexDirection: 'row' },
  taskLeftStrip: { width: 6, height: '100%' },
  taskMain: { flex: 1, padding: 16 },

  taskHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  taskSubject: { fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' },
  durationBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f1f5f9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  durationText: { fontSize: 11, color: '#64748b', fontWeight: '600' },

  taskTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
  taskDescPreview: { fontSize: 13, color: '#94a3b8' },

  expandedContent: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  fullDesc: { fontSize: 13, color: '#475569', lineHeight: 20, marginBottom: 12 },

  subtaskList: { marginBottom: 16, gap: 8 },
  subtaskRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  subtaskText: { flex: 1, fontSize: 13, color: '#334155', lineHeight: 20 },

  // Action Row Styles
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 16, flexWrap: 'wrap' },
  actionBtn: { flex: 1, minWidth: 120, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 8, borderRadius: 12, gap: 6 },
  actionBtnText: { fontWeight: '700', fontSize: 13 },

  actionButtons: { flexDirection: 'row', gap: 12, marginTop: 12, flexWrap: 'wrap' },
  btnOutline: { flex: 1, minWidth: 120, height: 40, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  btnOutlineText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  btnPrimary: { flex: 1, minWidth: 120, height: 40, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  btnPrimaryText: { fontSize: 14, fontWeight: '600', color: '#fff' },

  // Completed Section
  completedHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 32, marginBottom: 16, paddingHorizontal: 4 },
  completedTitle: { fontSize: 18, fontWeight: '700', color: '#94a3b8' },
  completedCount: { backgroundColor: '#e2e8f0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginLeft: 8 },
  completedCountText: { fontSize: 12, fontWeight: '700', color: '#64748b' },

  emptyState: { alignItems: 'center', padding: 40, opacity: 0.8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginTop: 4, marginBottom: 24 },
  createBtn: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  createBtnText: { fontSize: 14, fontWeight: '600', color: '#475569' },

  modalContent: { padding: 4 },
  modalBody: { gap: 4 }
});

export default TodayScreen;
