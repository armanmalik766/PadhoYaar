import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  StatusBar,
  Modal,
  FlatList,
  ImageBackground
} from 'react-native';
import { useStore } from '../store/MockSupabaseStore';
import { generateQuizQuestions, submitQuizResult } from '../services/geminiService';
import { QuizQuestion } from '../types';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Trophy,
  Play,
  Clock,
  BookOpen,
  Brain,
  Globe,
  RotateCcw,
  ArrowLeft,
  Lightbulb,
  Award,
  Zap,
  BarChart2,
  X,
  History
} from 'lucide-react-native';

const SUBJECTS: Record<string, string[]> = {
  PRELIMS: ['History', 'Polity', 'Geography', 'Economy', 'Environment', 'Science & Tech'],
  MAINS: ['GS-I', 'GS-II', 'GS-III', 'GS-IV'],
  INTERVIEW: ['Ethics', 'Administration'],
  CURRENT_AFFAIRS: ['Daily', 'Economy', 'Environment', 'World', 'India', 'Science']
};

const COLORS = {
  primary: '#4f46e5', // Indigo 600
  secondary: '#8b5cf6', // Violet 500
  success: '#10b981', // Emerald 500
  error: '#ef4444',   // Red 500
  warning: '#f59e0b', // Amber 500
  text: '#1e293b',    // Slate 800
  textLight: '#64748b', // Slate 500
  background: '#f8fafc', // Slate 50
  card: '#ffffff',
  accent: '#fbbf24', // Amber 400
};

const { width } = Dimensions.get('window');

// Helper for Missing Icon
const FileTextIcon = ({ color }: { color: string }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
    <BookOpen size={24} color={color} />
  </View>
);

const QuizScreen = ({ onNavigate }: { onNavigate?: (screen: string) => void }) => {
  const { user, tasks } = useStore();
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quizCategory, setQuizCategory] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState(1200);

  // Subject Selection Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategoryForModal, setSelectedCategoryForModal] = useState<string>('');
  const [modalTitle, setModalTitle] = useState('');

  const openSubjectModal = (category: string, title: string) => {
    setSelectedCategoryForModal(category);
    setModalTitle(title);
    setModalVisible(true);
  };

  const handleSubjectSelect = (subject: string) => {
    setModalVisible(false);
    startQuiz(selectedCategoryForModal, subject);
  };

  const startQuiz = async (category: string, subjectOrTitle: string) => {
    setLoading(true);
    setQuizCategory(category);
    setStartTime(Date.now());
    setTimeLeft(20 * 60);

    let context = subjectOrTitle;
    if (category === 'REVISION') {
      context = tasks.map(t => t.title).join(', ');
    } else if (category === 'SYLLABUS' && !SUBJECTS.PRELIMS.includes(subjectOrTitle)) {
      context = "History, Geography, Polity, Economy";
    }

    try {
      const questions = await generateQuizQuestions(category, context);
      if (questions && questions.length > 0) {
        setQuiz(questions);
        setIndex(0);
        setScore(0);
        setSelected(null);
        setShowExplanation(false);
        setShowResults(false);
        setLoading(false);
      } else {
        alert('Could not generate questions. Please try again.');
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      alert('Error starting quiz.');
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (!quiz || showResults || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [quiz, showResults, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const finishQuiz = async () => {
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    const correctCount = score;
    const wrongCount = quiz ? quiz.length - correctCount : 0;
    const finalPoints = (correctCount * 1) - (wrongCount * 0.33);
    const finalScore = Math.max(0, parseFloat(finalPoints.toFixed(2)));

    try {
      if (quiz && user) {
        await submitQuizResult({
          userId: user.id || 'guest',
          category: quizCategory,
          subject: quiz[0]?.category || quizCategory,
          totalQuestions: quiz.length,
          correct: correctCount,
          wrong: wrongCount,
          score: finalScore,
          percentage: Math.round((correctCount / quiz.length) * 100),
          timeTaken,
          date: new Date()
        });
      }
    } catch (e) {
      console.error('Submit error', e);
    }
    setShowResults(true);
  };

  const handleOptionSelect = (optIndex: number) => {
    if (selected !== null) return;
    setSelected(optIndex);
    setShowExplanation(true);
    if (quiz![index].correctAnswer === optIndex) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (quiz && index + 1 < quiz.length) {
      setIndex(index + 1);
      setSelected(null);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const restartQuiz = () => {
    setQuiz(null);
    setIndex(0);
    setScore(0);
    setSelected(null);
    setShowExplanation(false);
    setShowResults(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <Loader2 size={48} color={COLORS.primary} style={{ transform: [{ rotate: '45deg' }] }} />
          <Text style={styles.loadingText}>Curating Challenge...</Text>
          <Text style={styles.loadingSubText}>Consulting the archives...</Text>
        </View>
      </View>
    );
  }

  // Result View
  if (showResults && quiz) {
    const correctCount = score;
    const wrongCount = quiz.length - correctCount;
    const finalPoints = Math.max(0, (correctCount * 1) - (wrongCount * 0.33)).toFixed(2);
    const percentage = Math.round((correctCount / quiz.length) * 100);

    return (
      <View style={styles.container}>
        <View style={[styles.header, { marginTop: 20 }]}>
          <TouchableOpacity onPress={() => setQuiz(null)} style={styles.iconButton}>
            <ArrowLeft size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quiz Results</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.resultContent} showsVerticalScrollIndicator={false}>
          <View style={styles.resultCard}>
            <View style={styles.scoreCircle}>
              <Trophy size={48} color={COLORS.accent} />
              <Text style={styles.scoreValue}>{percentage}%</Text>
              <Text style={{ fontSize: 13, color: COLORS.textLight, fontWeight: '600' }}>ACCURACY</Text>
            </View>

            <View style={styles.statGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{correctCount}</Text>
                <Text style={styles.statLabel}>Correct</Text>
              </View>
              <View style={styles.verticalDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{finalPoints}</Text>
                <Text style={styles.statLabel}>Points</Text>
              </View>
              <View style={styles.verticalDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{wrongCount}</Text>
                <Text style={styles.statLabel}>Wrong</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={restartQuiz}>
            <RotateCcw size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>Back to Hub</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  const modalSubjects = selectedCategoryForModal ? SUBJECTS[selectedCategoryForModal] || [] : [];

  /* ================= HUB VIEW ================= */
  if (!quiz && !showResults) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back, {user?.name?.split(' ')[0] || 'Aspirant'}</Text>
            <Text style={styles.hubTitle}>Quiz Hub</Text>
          </View>
          <TouchableOpacity style={styles.profileIcon} onPress={() => onNavigate && onNavigate('progress')}>
            <BarChart2 size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.hubContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Stats Row */}
          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statPill} onPress={() => onNavigate && onNavigate('quiz-history')}>
              <History size={16} color={COLORS.primary} />
              <Text style={styles.statPillText}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statPill} onPress={() => onNavigate && onNavigate('leaderboard')}>
              <Trophy size={16} color={COLORS.warning} />
              <Text style={styles.statPillText}>Rankings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statPill} onPress={() => onNavigate && onNavigate('progress')}>
              <BarChart2 size={16} color={COLORS.success} />
              <Text style={styles.statPillText}>Progress</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Featured Challenges</Text>

          <View style={styles.featuredContainer}>
            <TouchableOpacity
              style={[styles.featureCard, { backgroundColor: '#0ea5e9' }]}
              onPress={() => startQuiz('CURRENT_AFFAIRS', 'Daily Updates')}
              activeOpacity={0.9}
            >
              <View style={styles.featureContent}>
                <View style={styles.featureIconBox}>
                  <Globe size={24} color="#0ea5e9" />
                </View>
                <View>
                  <Text style={styles.featureTitle}>Current Affairs</Text>
                  <Text style={styles.featureSubtitle}>Daily Updates & News</Text>
                </View>
              </View>
              <ChevronRight size={24} color="#fff" style={{ opacity: 0.8 }} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.featureCard, { backgroundColor: '#8b5cf6', marginTop: 12 }]}
              onPress={() => startQuiz('CSAT', 'General')}
              activeOpacity={0.9}
            >
              <View style={styles.featureContent}>
                <View style={styles.featureIconBox}>
                  <Brain size={24} color="#8b5cf6" />
                </View>
                <View>
                  <Text style={styles.featureTitle}>CSAT Practice</Text>
                  <Text style={styles.featureSubtitle}>Logic, Math & Reasoning</Text>
                </View>
              </View>
              <ChevronRight size={24} color="#fff" style={{ opacity: 0.8 }} />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Subject Wise</Text>

          <View style={styles.grid}>
            <QuizOptionCard
              title={
                user?.studyMode === 'INTERVIEW' ? "Interview Prep" :
                  user?.studyMode === 'MAINS' ? "General Studies" : "Static GK"
              }
              subtitle={
                user?.studyMode === 'INTERVIEW' ? "DAF, Hobbies..." :
                  user?.studyMode === 'MAINS' ? "GS-I to GS-IV" : "History, Polity..."
              }
              icon={<BookOpen size={24} color={COLORS.primary} />}
              color={COLORS.primary}
              onPress={() => {
                const mode = user?.studyMode;
                if (mode === 'INTERVIEW') {
                  setModalTitle('Interview Prep');
                  setQuizCategory('INTERVIEW');
                  setSelectedCategoryForModal('INTERVIEW');
                } else if (mode === 'MAINS') {
                  setModalTitle('General Studies');
                  setQuizCategory('MAINS');
                  setSelectedCategoryForModal('MAINS');
                } else {
                  setModalTitle('Static GK');
                  setQuizCategory('STATIC_GK');
                  setSelectedCategoryForModal('PRELIMS');
                }
                setModalVisible(true);
              }}
            />
            <QuizOptionCard
              title="Mains Answer"
              subtitle="Writing Practice"
              icon={<FileTextIcon color={COLORS.error} />}
              color={COLORS.error}
              onPress={() => alert("Feature coming soon!")} // Placeholder
            />
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{modalTitle}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X size={24} color={COLORS.textLight} />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalSubtitle}>Select a specific subject:</Text>
              <FlatList
                data={modalSubjects}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.subjectItem}
                    onPress={() => handleSubjectSelect(item)}
                  >
                    <Text style={styles.subjectText}>{item}</Text>
                    <ChevronRight size={20} color={COLORS.textLight} />
                  </TouchableOpacity>
                )}
                contentContainerStyle={{ paddingVertical: 8 }}
              />
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  /* ================= ACTIVE QUIZ VIEW ================= */
  const q = quiz[index];
  const progress = ((index + 1) / quiz.length) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.activeHeader}>
        <TouchableOpacity onPress={() => setQuiz(null)} style={styles.iconButton}>
          <X size={24} color={COLORS.textLight} />
        </TouchableOpacity>

        <View style={styles.timerBadge}>
          <Clock size={14} color={timeLeft < 60 ? COLORS.error : COLORS.text} />
          <Text style={[styles.timerText, timeLeft < 60 && { color: COLORS.error }]}>
            {formatTime(timeLeft)}
          </Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{index + 1} / {quiz.length}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.questionContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.questionCard}>
          <Text style={styles.categoryLabel}>{q.category.replace('_', ' ')}</Text>
          <Text style={styles.questionText}>{q.question}</Text>
        </View>

        <View style={styles.optionsContainer}>
          {q.options.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrect = q.correctAnswer === i;
            const showResult = selected !== null;

            let borderColor = '#f1f5f9';
            let bgColor = '#fff';

            if (showResult) {
              if (isCorrect) { borderColor = COLORS.success; bgColor = '#ecfdf5'; }
              else if (isSelected) { borderColor = COLORS.error; bgColor = '#fef2f2'; }
            } else if (isSelected) {
              borderColor = COLORS.primary; bgColor = '#eef2ff';
            }

            return (
              <TouchableOpacity
                key={i}
                style={[styles.option, { borderColor, backgroundColor: bgColor }]}
                onPress={() => handleOptionSelect(i)}
                disabled={selected !== null}
                activeOpacity={0.9}
              >
                <View style={[
                  styles.optionIndex,
                  { backgroundColor: showResult && isCorrect ? COLORS.success : (showResult && isSelected ? COLORS.error : '#f1f5f9') }
                ]}>
                  <Text style={[
                    styles.optionIndexText,
                    showResult && (isCorrect || isSelected) && { color: '#fff' }
                  ]}>{String.fromCharCode(65 + i)}</Text>
                </View>
                <Text style={[
                  styles.optionText,
                  showResult && isCorrect && { color: '#166534', fontWeight: '700' },
                  showResult && isSelected && !isCorrect && { color: '#991b1b', fontWeight: '700' }
                ]}>{opt}</Text>

                {showResult && isCorrect && <CheckCircle2 size={20} color={COLORS.success} />}
                {showResult && isSelected && !isCorrect && <XCircle size={20} color={COLORS.error} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {showExplanation && (
          <View style={styles.explanationCard}>
            <View style={styles.explanationHeader}>
              <Lightbulb size={20} color={COLORS.accent} fill={COLORS.accent} />
              <Text style={styles.explanationTitle}>Explanation</Text>
            </View>
            <Text style={styles.explanationText}>{q.explanation}</Text>

            <TouchableOpacity style={styles.nextButton} onPress={nextQuestion}>
              <Text style={styles.nextButtonText}>
                {index + 1 === quiz.length ? 'See Results' : 'Next Question'}
              </Text>
              <ChevronRight size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};


const QuizOptionCard = ({ title, subtitle, icon, color, onPress }: any) => (
  <TouchableOpacity style={styles.optionCard} onPress={onPress} activeOpacity={0.9}>
    <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
      {React.cloneElement(icon, { color: color })}
    </View>
    <View style={styles.optionCardContent}>
      <Text style={styles.optionCardTitle}>{String(title)}</Text>
      <Text style={styles.optionCardSubtitle}>{String(subtitle)}</Text>
    </View>
    <ChevronRight size={20} color="#cbd5e1" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  hubContainer: { padding: 20 },

  header: {
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  welcomeText: { fontSize: 13, color: COLORS.textLight, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  hubTitle: { fontSize: 28, fontWeight: '800', color: COLORS.text },
  profileIcon: { padding: 10, backgroundColor: '#fff', borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  statPill: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#fff', paddingVertical: 12, borderRadius: 12,
    borderWidth: 1, borderColor: '#f1f5f9'
  },
  statPillText: { fontSize: 13, fontWeight: '600', color: COLORS.text },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 16 },

  featuredContainer: { marginBottom: 32 },
  featureCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, borderRadius: 20,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 4
  },
  featureContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  featureIconBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  featureTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  featureSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },

  grid: { gap: 16 },
  optionCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', padding: 16, borderRadius: 16,
    borderWidth: 1, borderColor: '#f1f5f9',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8
  },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  optionCardContent: { flex: 1 },
  optionCardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  optionCardSubtitle: { fontSize: 13, color: COLORS.textLight },

  // Active Quiz
  activeHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16
  },
  iconButton: { padding: 8, backgroundColor: '#fff', borderRadius: 10, elevation: 2 },
  timerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#f1f5f9', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20
  },
  timerText: { fontSize: 14, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: COLORS.text },
  badge: { backgroundColor: '#e0e7ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },

  progressTrack: { height: 4, backgroundColor: '#e2e8f0', marginHorizontal: 0 },
  progressBar: { height: '100%', backgroundColor: COLORS.primary },

  questionContainer: { padding: 24 },
  questionCard: { marginBottom: 32 },
  categoryLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textLight, letterSpacing: 1, marginBottom: 12 },
  questionText: { fontSize: 24, fontWeight: '700', color: COLORS.text, lineHeight: 34 },

  optionsContainer: { gap: 12 },
  option: {
    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16,
    borderWidth: 2, backgroundColor: '#fff',
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4
  },
  optionIndex: {
    width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12
  },
  optionIndexText: { fontSize: 14, fontWeight: '700', color: COLORS.textLight },
  optionText: { fontSize: 16, fontWeight: '500', color: COLORS.text, flex: 1 },

  explanationCard: {
    marginTop: 24, padding: 20, backgroundColor: '#fff', borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.accent
  },
  explanationHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  explanationTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  explanationText: { fontSize: 15, color: '#334155', lineHeight: 24, marginBottom: 20 },
  nextButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.primary, padding: 16, borderRadius: 14,
    elevation: 4
  },
  nextButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Loading
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  loadingCard: { alignItems: 'center' },
  loadingText: { marginTop: 24, fontSize: 18, fontWeight: '700', color: COLORS.text },
  loadingSubText: { marginTop: 8, color: COLORS.textLight },

  // Results
  resultContent: { padding: 24, alignItems: 'center' },
  resultCard: { width: '100%', alignItems: 'center', backgroundColor: '#fff', borderRadius: 32, padding: 32, elevation: 4, marginBottom: 24 },
  scoreCircle: { width: 140, height: 140, borderRadius: 70, justifyContent: 'center', alignItems: 'center', borderWidth: 8, borderColor: '#f8fafc', marginBottom: 24 },
  scoreValue: { fontSize: 40, fontWeight: '800', color: COLORS.text },
  statGrid: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: 12, color: COLORS.textLight, textTransform: 'uppercase', marginTop: 4 },
  verticalDivider: { width: 1, height: 40, backgroundColor: '#e2e8f0' },

  primaryButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.primary, width: '100%', padding: 16, borderRadius: 16
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  modalSubtitle: { fontSize: 14, color: COLORS.textLight, marginBottom: 16 },
  subjectItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  subjectText: { fontSize: 16, fontWeight: '600', color: COLORS.text }
});

export default QuizScreen;
