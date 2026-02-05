import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useStore } from '../store/MockSupabaseStore';
import { Button, Input, Select, Card } from '../components/UIComponents';
import { BookOpen, Search, Check, X } from 'lucide-react-native';
import { Language, StudyMode } from '../types';
import { getSyllabus } from '../services/api/syllabusApi';
import { ExamStage } from '../types/syllabus';

// Get device width for conditional styling
const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

const OnboardingScreen = () => {
  const { completeOnboarding, t, updateLanguage, language } = useStore();

  const [attemptYear, setAttemptYear] = useState(new Date().getFullYear());
  const [dailyHoursGoal, setDailyHoursGoal] = useState(6);
  const [mode, setMode] = useState<'SELF_STUDY' | 'COACHING'>('SELF_STUDY');
  const [studyMode, setStudyMode] = useState<StudyMode>('PRELIMS');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [subjectSearch, setSubjectSearch] = useState('');

  const toggleSubject = (subject: string) => {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(prev => prev.filter(s => s !== subject));
    } else {
      setSelectedSubjects(prev => [...prev, subject]);
    }
  };

  const handleSubmit = () => {
    if (selectedSubjects.length === 0) {
      alert("Please select at least one Optional Subject");
      return;
    }

    completeOnboarding({
      attemptYear,
      dailyHoursGoal,
      mode,
      studyMode,
      optionalSubject: selectedSubjects.join(', '),
      language
    });
  };

  const yearOptions = Array.from({ length: 2040 - 2024 + 1 }, (_, i) => {
    const year = 2024 + i;
    return { value: year, label: String(year) };
  });

  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  // Fetch subjects when stage changes
  React.useEffect(() => {
    const fetchSubjects = async () => {
      let stage: ExamStage = 'PRELIMS';
      if (studyMode === 'MAINS') stage = 'MAINS';
      if (studyMode === 'FINAL') stage = 'INTERVIEW';

      try {
        const data = await getSyllabus({ examStage: stage });
        // Extract unique subjects or paper names
        // For Prelims: use 'subject'
        // For Mains: use 'subject' (GS-I, etc.)
        const subjects = Array.from(new Set(data.map(item => item.subject)));
        setAvailableSubjects(subjects);

        // Auto-select all subjects by default for convenience
        setSelectedSubjects(subjects);
      } catch (e) {
        console.error("Failed to fetch subjects", e);
      }
    };

    fetchSubjects();
  }, [studyMode]);

  const filteredSubjects = availableSubjects.filter(s =>
    s.toLowerCase().includes(subjectSearch.toLowerCase())
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <BookOpen size={isSmallDevice ? 40 : 48} color="#4f46e5" style={styles.icon} />
          <Text style={styles.title}>{t('setup_title')}</Text>
          <Text style={styles.subtitle}>{t('setup_subtitle')}</Text>
        </View>

        <Card style={styles.formCard}>
          {/* Language Selection */}
          <View style={styles.section}>
            <Select
              label={t('label_language')}
              options={[
                { value: "EN", label: "English (Default)" },
                { value: "HINGLISH", label: "Hinglish" },
                { value: "HI", label: "Hindi" },
                // ... rest of languages
              ]}
              value={language}
              onChange={(e: any) => updateLanguage(e.target.value as Language)}
            />
          </View>

          {/* Year and Stage - Responsive Row */}
          <View style={styles.responsiveRow}>
            <View style={styles.rowItem}>
              <Select
                label={t('label_year')}
                options={yearOptions}
                value={attemptYear}
                onChange={(e: any) => setAttemptYear(Number(e.target.value))}
              />
            </View>
            <View style={styles.rowItem}>
              <Select
                label={t('label_stage')}
                options={[
                  { value: 'PRELIMS', label: 'Prelims' },
                  { value: 'MAINS', label: 'Mains' },
                  { value: 'FINAL', label: 'Interview' }
                ]}
                value={studyMode}
                onChange={(e: any) => setStudyMode(e.target.value as StudyMode)}
              />
            </View>
          </View>

          {/* Optional Subjects Section */}
          <View style={styles.section}>
            <Text style={styles.label}>{studyMode === 'MAINS' ? t('label_optional') : 'Select Subjects'}</Text>
            <View style={styles.searchContainer}>
              <Search size={18} color="#94a3b8" style={styles.searchIcon} />
              <TextInput
                placeholder="Search subjects..."
                style={styles.searchInput}
                value={subjectSearch}
                onChangeText={setSubjectSearch}
                placeholderTextColor="#94a3b8"
              />
            </View>

            {selectedSubjects.length > 0 && (
              <View style={styles.chipContainer}>
                {selectedSubjects.map(subject => (
                  <View key={subject} style={styles.chip}>
                    <Text style={styles.chipText}>{subject}</Text>
                    <TouchableOpacity onPress={() => toggleSubject(subject)}>
                      <X size={14} color="#4338ca" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.subjectList}>
              <ScrollView nestedScrollEnabled={true}>
                {filteredSubjects.map(subject => {
                  const isSelected = selectedSubjects.includes(subject);
                  return (
                    <TouchableOpacity
                      key={subject}
                      onPress={() => toggleSubject(subject)}
                      style={[styles.subjectItem, isSelected && styles.subjectItemActive]}
                    >
                      <Text style={[styles.subjectText, isSelected && styles.subjectTextActive]}>
                        {subject}
                      </Text>
                      {isSelected && <Check size={16} color="#4f46e5" />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          {/* Daily Hours Section */}
          <View style={styles.section}>
            <Text style={styles.label}>{t('label_hours')}</Text>
            <View style={styles.hoursRow}>
              <View style={styles.sliderMock}>
                <View style={[styles.sliderTrack, { width: `${(dailyHoursGoal / 14) * 100}%` }]} />
              </View>
              <Text style={styles.hoursValue}>{dailyHoursGoal}h</Text>
            </View>
            <View style={styles.hoursButtons}>
              {[4, 6, 8, 10, 12].map(h => (
                <TouchableOpacity
                  key={h}
                  onPress={() => setDailyHoursGoal(h)}
                  style={[styles.hBtn, dailyHoursGoal === h && styles.hBtnActive]}
                >
                  <Text style={[styles.hBtnText, dailyHoursGoal === h && styles.hBtnTextActive]}>{h}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Study Mode - Responsive Row */}
          <View style={styles.responsiveRow}>
            <TouchableOpacity
              style={[styles.modeCard, mode === 'SELF_STUDY' && styles.modeCardActive]}
              onPress={() => setMode('SELF_STUDY')}
            >
              <Text style={[styles.modeTitle, mode === 'SELF_STUDY' && styles.modeTitleActive]}>{t('mode_self')}</Text>
              <Text style={styles.modeDesc} numberOfLines={2}>{t('mode_self_desc')}</Text>
            </TouchableOpacity>

            {/* Spacer removed for gap usage */}

            <TouchableOpacity
              style={[styles.modeCard, mode === 'COACHING' && styles.modeCardActive]}
              onPress={() => setMode('COACHING')}
            >
              <Text style={[styles.modeTitle, mode === 'COACHING' && styles.modeTitleActive]}>{t('mode_coaching')}</Text>
              <Text style={styles.modeDesc} numberOfLines={2}>{t('mode_coaching_desc')}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 10 }}>
            <Button fullWidth size="lg" onPress={handleSubmit}>{t('start_btn')}</Button>
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  content: {
    paddingHorizontal: width * 0.05,
    paddingBottom: 40,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    maxWidth: 600, // Limit max width for tablets/web
    alignSelf: 'center',
    width: '100%'
  },
  header: {
    alignItems: 'center',
    marginBottom: 24
  },
  icon: { marginBottom: 12 },
  title: {
    fontSize: isSmallDevice ? 20 : 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 10
  },
  formCard: {
    padding: isSmallDevice ? 15 : 20,
    width: '100%'
  },
  section: { marginBottom: 20 },
  responsiveRow: {
    flexDirection: isSmallDevice ? 'column' : 'row', // Stack on small screens
    gap: 12, // Use gap instead of margins/spacers
    marginBottom: 20,
    width: '100%'
  },
  rowItem: {
    flex: 1,
    width: isSmallDevice ? '100%' : 'auto'
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 14
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  chipText: { fontSize: 12, color: '#4338ca', fontWeight: '600', marginRight: 6 },
  subjectList: {
    height: 200,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    overflow: 'hidden'
  },
  subjectItem: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  subjectItemActive: { backgroundColor: '#f0f4ff' },
  subjectText: { fontSize: 14, color: '#475569' },
  subjectTextActive: { fontWeight: '700', color: '#4f46e5' },
  hoursRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sliderMock: {
    flex: 1,
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden'
  },
  sliderTrack: { height: '100%', backgroundColor: '#4f46e5' },
  hoursValue: {
    width: 45,
    textAlign: 'right',
    fontWeight: '700',
    color: '#4f46e5',
    fontSize: 16
  },
  hoursButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8 // Add gap
  },
  hBtn: {
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flex: 1, // Distribute evenly
    alignItems: 'center'
  },
  hBtnActive: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  hBtnText: { color: '#64748b', fontWeight: '600', fontSize: 12 },
  hBtnTextActive: { color: '#fff' },
  modeCard: {
    flex: 1,
    width: isSmallDevice ? '100%' : 'auto', // Full width on small screens
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center'
  },
  modeCardActive: { borderColor: '#4f46e5', backgroundColor: '#f5f7ff' },
  modeTitle: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 4 },
  modeTitleActive: { color: '#4f46e5' },
  modeDesc: { fontSize: 10, color: '#94a3b8', textAlign: 'center' },
});

export default OnboardingScreen;
