import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Platform,
  RefreshControl
} from 'react-native';
import { useStore } from '../store/MockSupabaseStore';
import { fetchUserProgress, fetchPlannerStats } from '../services/geminiService';
import {
  ArrowLeft,
  RefreshCw,
  Trophy,
  Target,
  TrendingUp,
  Award,
  BookOpen,
  PieChart,
  Clock,
  AlertTriangle
} from 'lucide-react-native';
import Svg, { Circle, Rect, Defs, LinearGradient, Stop, Path, Text as SvgText, G } from 'react-native-svg';

const COLORS = {
  primary: '#4f46e5', // Indigo 600
  secondary: '#8b5cf6', // Violet 500
  success: '#10b981', // Emerald 500
  warning: '#f59e0b', // Amber 500
  danger: '#ef4444', // Red 500
  text: '#1e293b', // Slate 800
  textLight: '#64748b', // Slate 500
  background: '#f8fafc', // Slate 50
  card: '#ffffff',
  accent: '#e0e7ff', // Indigo 100
};

// Circular Progress Component
const CircularProgress = ({ score, size = 120, strokeWidth = 12 }: any) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(Math.max(score, 0), 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  let color = COLORS.primary;
  if (score >= 80) color = COLORS.success;
  else if (score < 50) color = COLORS.warning;

  return (
    <View style={{ justifyContent: 'center', alignItems: 'center', width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle
          stroke={COLORS.accent}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Progress Circle */}
        <Circle
          stroke={color}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.circularTextContainer}>
        <Text style={[styles.circularScore, { color }]}>{score}</Text>
        <Text style={styles.circularLabel}>Avg Score</Text>
      </View>
    </View>
  );
};

const ProgressScreen = ({ onBack, onNavigate }: { onBack: () => void, onNavigate: (screen: any) => void }) => {
  const { user } = useStore();
  const [stats, setStats] = useState<any>(null);
  const [plannerStats, setPlannerStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartLayoutWidth, setChartLayoutWidth] = useState(0);
  const [activePoint, setActivePoint] = useState<number | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    if (user) {
      const [progressData, plannerData] = await Promise.all([
        fetchUserProgress(user.id),
        fetchPlannerStats(user.id)
      ]);
      setStats(progressData);
      setPlannerStats(plannerData);
    }
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Unable to load progress data.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadStats}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.iconButton}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Performance</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.iconButton}>
          <RefreshCw size={20} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* PLANNER STATS SECTION */}
        {plannerStats && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <PieChart size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Syllabus Planner</Text>
              <TouchableOpacity onPress={() => onNavigate('tracker')} style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ color: COLORS.primary, fontWeight: '600', fontSize: 13 }}>View Tracker</Text>
                <ArrowLeft size={14} color={COLORS.primary} style={{ transform: [{ rotate: '180deg' }] }} />
              </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
              {/* Coverage Card */}
              <View style={[styles.statCard, { flex: 1, marginRight: 8, backgroundColor: '#eff6ff' }]}>
                <View style={[styles.iconCircle, { backgroundColor: '#bfdbfe' }]}>
                  <PieChart size={18} color="#1d4ed8" />
                </View>
                <Text style={styles.statValue}>{plannerStats.coveragePercentage}%</Text>
                <Text style={styles.statLabel}>Syllabus Covered</Text>
              </View>

              {/* Study Hours Card */}
              <View style={[styles.statCard, { flex: 1, marginLeft: 8, marginRight: 8, backgroundColor: '#f0fdf4' }]}>
                <View style={[styles.iconCircle, { backgroundColor: '#bbf7d0' }]}>
                  <Clock size={18} color="#15803d" />
                </View>
                <Text style={styles.statValue}>{plannerStats.totalStudyHours}h</Text>
                <Text style={styles.statLabel}>Total Study</Text>
              </View>

              {/* Backlog Card */}
              <View style={[styles.statCard, { flex: 1, marginLeft: 8, backgroundColor: plannerStats.revisionBacklog > 5 ? '#fef2f2' : '#f8fafc' }]}>
                <View style={[styles.iconCircle, { backgroundColor: plannerStats.revisionBacklog > 5 ? '#fecaca' : '#e2e8f0' }]}>
                  <AlertTriangle size={18} color={plannerStats.revisionBacklog > 5 ? "#b91c1c" : "#64748b"} />
                </View>
                <Text style={[styles.statValue, { color: plannerStats.revisionBacklog > 5 ? COLORS.danger : COLORS.text }]}>
                  {plannerStats.revisionBacklog}
                </Text>
                <Text style={styles.statLabel}>Revision Due</Text>
              </View>
            </View>
          </View>
        )}

        {/* Main Score Card */}
        <View style={styles.mainCard}>
          <View style={styles.mainCardHeader}>
            <View>
              <Text style={styles.mainCardTitle}>Overall Accuracy</Text>
              <Text style={styles.mainCardSubtitle}>Keep pushing your limits!</Text>
            </View>
            <View style={styles.badge}>
              <Award size={16} color={COLORS.primary} />
              <Text style={styles.badgeText}>{stats.totalAttempts} Quizzes</Text>
            </View>
          </View>

          <View style={styles.scoreRow}>
            <CircularProgress score={stats.averageScore || 0} />

            <View style={styles.statsColumn}>
              <View style={styles.miniStat}>
                <View style={[styles.miniStatIcon, { backgroundColor: '#dcfce7' }]}>
                  <Trophy size={18} color="#15803d" />
                </View>
                <View>
                  <Text style={styles.miniStatLabel}>Best Subject</Text>
                  <Text style={styles.miniStatValue} numberOfLines={1}>{stats.bestSubject}</Text>
                </View>
              </View>

              <View style={[styles.miniStat, { marginTop: 16 }]}>
                <View style={[styles.miniStatIcon, { backgroundColor: '#fee2e2' }]}>
                  <Target size={18} color="#b91c1c" />
                </View>
                <View>
                  <Text style={styles.miniStatLabel}>Needs Focus</Text>
                  <Text style={styles.miniStatValue} numberOfLines={1}>{stats.weakestSubject}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Weekly Trend Chart - Enhanced Redesign */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Weekly Trend</Text>
          </View>
          <View style={styles.chartCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={styles.cardTitle}>Daily Performance</Text>
              {activePoint !== null && (
                <View style={styles.activeScoreBadge}>
                  <Text style={styles.activeScoreText}>
                    {stats.last7DaysTrend[activePoint]?.score || 0}
                  </Text>
                </View>
              )}
            </View>

            {(!stats.last7DaysTrend || stats.last7DaysTrend.length === 0) ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No activity in last 7 days</Text>
              </View>
            ) : (
              <View
                style={{ height: 220, width: '100%' }}
                onLayout={(e) => setChartLayoutWidth(e.nativeEvent.layout.width)}
              >
                {(() => {
                  if (chartLayoutWidth === 0) return null;

                  const data = stats.last7DaysTrend;
                  const chartHeight = 160; // Max height for bars
                  const chartWidth = chartLayoutWidth;
                  const barWidth = 16;
                  const spacing = (chartWidth - (data.length * barWidth)) / (data.length + 1);
                  const maxScore = 100;

                  return (
                    <Svg width={chartWidth} height={200}>
                      <Defs>
                        <LinearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <Stop offset="0" stopColor={COLORS.primary} stopOpacity="1" />
                          <Stop offset="1" stopColor={COLORS.secondary} stopOpacity="1" />
                        </LinearGradient>
                        <LinearGradient id="barGradientActive" x1="0" y1="0" x2="0" y2="1">
                          <Stop offset="0" stopColor={COLORS.success} stopOpacity="1" />
                          <Stop offset="1" stopColor="#059669" stopOpacity="1" />
                        </LinearGradient>
                      </Defs>

                      {/* Grid Lines (Horizontal) */}
                      {[0, 25, 50, 75, 100].map((val, i) => {
                        const y = chartHeight - (val / 100) * chartHeight;
                        return (
                          <G key={i}>
                            <Path d={`M 0 ${y} L ${chartWidth} ${y}`} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4,4" />
                          </G>
                        )
                      })}

                      {data.map((d: any, i: number) => {
                        const barHeight = (d.score / maxScore) * chartHeight;
                        const x = spacing + i * (barWidth + spacing);
                        const y = chartHeight - barHeight;
                        const isActive = activePoint === i;
                        const dayLabel = d.date.split('-')[2]; // Extract day assuming format YYYY-MM-DD

                        return (
                          <G key={i} onPress={() => setActivePoint(isActive ? null : i)}>
                            {/* Touch Area Overlay (Invisible larger rect for easier tapping) */}
                            <Rect
                              x={x - spacing / 2}
                              y={0}
                              width={barWidth + spacing}
                              height={200}
                              fill="transparent"
                            />

                            {/* The Bar */}
                            <Rect
                              x={x}
                              y={y}
                              width={barWidth}
                              height={barHeight}
                              rx={barWidth / 2}
                              fill={isActive ? "url(#barGradientActive)" : "url(#barGradient)"}
                            />

                            {/* Label */}
                            <SvgText
                              x={x + barWidth / 2}
                              y={chartHeight + 20}
                              fontSize="12"
                              fontWeight={isActive ? "700" : "500"}
                              fill={isActive ? COLORS.primary : COLORS.textLight}
                              textAnchor="middle"
                            >
                              {dayLabel}
                            </SvgText>
                          </G>
                        );
                      })}
                    </Svg>
                  );
                })()}
              </View>
            )}
          </View>
        </View>

        {/* Subject Breakdown */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <BookOpen size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Subject Analysis</Text>
          </View>

          <View style={styles.subjectsCard}>
            {Object.keys(stats.subjectWiseAccuracy || {}).length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Take a quiz to see analysis</Text>
              </View>
            ) : (
              Object.entries(stats.subjectWiseAccuracy).map(([subject, score]: [string, any], idx) => (
                <View key={subject} style={[styles.subjectRow, idx !== 0 && styles.borderTop]}>
                  <View style={styles.subjectHeader}>
                    <Text style={styles.subjectName}>{subject}</Text>
                    <Text style={[
                      styles.subjectScore,
                      { color: score >= 70 ? COLORS.success : score >= 40 ? COLORS.warning : COLORS.danger }
                    ]}>{score}%</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${score}%`,
                          backgroundColor: score >= 70 ? COLORS.success : score >= 40 ? COLORS.warning : COLORS.danger
                        }
                      ]}
                    />
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: COLORS.danger, marginBottom: 16 },
  retryButton: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: COLORS.primary, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '600' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20,
    backgroundColor: COLORS.background,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text, letterSpacing: -0.5 },
  iconButton: { padding: 8, borderRadius: 12, backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },

  scrollContent: { padding: 20 },

  // Main Card
  mainCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 24,
    marginBottom: 24,
    elevation: 4, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16
  },
  mainCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  mainCardTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  mainCardSubtitle: { fontSize: 13, color: COLORS.textLight },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.accent, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
  badgeText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },

  scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statsColumn: { flex: 1, marginLeft: 24 },
  circularTextContainer: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  circularScore: { fontSize: 32, fontWeight: '800' },
  circularLabel: { fontSize: 12, color: COLORS.textLight, marginTop: -4 },

  miniStat: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  miniStatIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  miniStatLabel: { fontSize: 12, color: COLORS.textLight, fontWeight: '600' },
  miniStatValue: { fontSize: 16, fontWeight: '700', color: COLORS.text, maxWidth: 120 },

  // Section
  sectionContainer: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },

  // Chart
  chartCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8
  },
  chartHint: { fontSize: 10, color: COLORS.textLight, textAlign: 'center', marginTop: 8, fontStyle: 'italic' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  activeScoreBadge: { backgroundColor: COLORS.success, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  activeScoreText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  chartWrapper: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 150 },
  barContainer: { alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' },
  barTrack: { height: 120, justifyContent: 'flex-end', width: '100%', alignItems: 'center' },
  barFill: { width: 12, borderRadius: 6 },
  barLabel: { marginTop: 12, fontSize: 12, color: COLORS.textLight, fontWeight: '600' },
  emptyState: { padding: 24, alignItems: 'center' },
  emptyStateText: { color: COLORS.textLight },

  // Subjects
  subjectsCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 8,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8
  },
  subjectRow: { padding: 16 },
  borderTop: { borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  subjectHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  subjectName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  subjectScore: { fontSize: 15, fontWeight: '700' },
  progressTrack: { height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 4 },

  // Planner Stats
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statCard: { padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  iconCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 2 },
  statLabel: { fontSize: 11, color: COLORS.textLight, fontWeight: '600' }
});

export default ProgressScreen;