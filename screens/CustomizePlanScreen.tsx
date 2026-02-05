import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useStore } from '../store/MockSupabaseStore';
import { Button, Badge } from '../components/UIComponents';
import {
  ArrowLeft,
  Check,
  Layers,
  Clock,
  Zap,
  PenTool,
  AlertTriangle,
  Lock,
} from 'lucide-react-native';
import { StudyPreferences } from '../types';

interface CustomizePlanScreenProps {
  onBack: () => void;
}

const CustomizePlanScreen: React.FC<CustomizePlanScreenProps> = ({ onBack }) => {
  const { user, updateStudyPreferences, refreshDailyTasks, t } = useStore();

  const isLocked =
    user?.preferences?.lockedUntil &&
    user.preferences.lockedUntil > Date.now();

  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState<StudyPreferences>({
    planType: user?.preferences?.planType || 'GUIDED',
    dailyTaskLimit: user?.preferences?.dailyTaskLimit || 4,
    structure: user?.preferences?.structure || 'MIXED_DAILY',
    revisionStyle: user?.preferences?.revisionStyle || 'DAILY_LIGHT',
    answerWritingFreq: user?.preferences?.answerWritingFreq || 'DAILY',
    lastModified: 0,
    lockedUntil: 0,
  });

  const handleSave = async () => {
    updateStudyPreferences(prefs);
    await refreshDailyTasks(true);
    onBack();
  };

  /* ---------------- LOCKED STATE ---------------- */

  if (isLocked) {
    const daysLeft = Math.ceil(
      (user!.preferences!.lockedUntil - Date.now()) /
      (1000 * 60 * 60 * 24)
    );

    return (
      <View style={styles.center}>
        <View style={styles.lockIcon}>
          <Lock size={32} color="#94a3b8" />
        </View>
        <Text style={styles.title}>Plan Locked</Text>
        <Text style={styles.subtext}>
          {t('cust_lock_msg')}
          {'\n'}
          <Text style={styles.highlight}>{daysLeft} days left</Text>
        </Text>
        <Button variant="outline" onPress={onBack}>
          Go Back
        </Button>
      </View>
    );
  }

  /* ---------------- STEP 0 ---------------- */

  if (step === 0) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>{t('cust_title')}</Text>

        <TouchableOpacity
          style={[styles.card, styles.cardActive]}
          onPress={() => {
            setPrefs({ ...prefs, planType: 'GUIDED' });
            setStep(5);
          }}
        >
          <View style={styles.row}>
            <Text style={styles.cardTitle}>{t('cust_opt_guided')}</Text>
            <Badge color="blue">Default</Badge>
          </View>
          <Text style={styles.cardDesc}>
            {t('cust_opt_guided_desc')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => {
            setPrefs({ ...prefs, planType: 'CUSTOM' });
            setStep(1);
          }}
        >
          <Text style={styles.cardTitle}>
            {t('cust_opt_custom')}
          </Text>
          <Text style={styles.cardDesc}>
            {t('cust_opt_custom_desc')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  /* ---------------- STEP 5 (CONFIRM) ---------------- */

  if (step === 5) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Review Plan</Text>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryItem}>
            Type: <Text style={styles.bold}>{prefs.planType}</Text>
          </Text>

          {prefs.planType === 'CUSTOM' && (
            <>
              <Text style={styles.summaryItem}>
                Tasks/Day:{' '}
                <Text style={styles.bold}>
                  {prefs.dailyTaskLimit}
                </Text>
              </Text>
              <Text style={styles.summaryItem}>
                Structure:{' '}
                <Text style={styles.bold}>{prefs.structure}</Text>
              </Text>
            </>
          )}
        </View>

        <Button fullWidth onPress={handleSave}>
          {t('cust_btn_save')}
        </Button>

        <Button
          fullWidth
          variant="ghost"
          onPress={() => setStep(0)}
        >
          {t('cust_btn_adjust')}
        </Button>
      </ScrollView>
    );
  }

  /* ---------------- OPTION RENDER ---------------- */

  const Option = ({
    label,
    selected,
    onPress,
  }: {
    label: string;
    selected: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.option,
        selected && styles.optionActive,
      ]}
    >
      <Text
        style={[
          styles.optionText,
          selected && styles.optionTextActive,
        ]}
      >
        {label}
      </Text>
      {selected && <Check size={18} color="#4f46e5" />}
    </TouchableOpacity>
  );

  /* ---------------- STEPS 1–4 ---------------- */

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => setStep(step - 1)}>
        <View style={styles.backRow}>
          <ArrowLeft size={16} color="#94a3b8" />
          <Text style={styles.backText}>Back</Text>
        </View>
      </TouchableOpacity>

      {step === 1 && (
        <>
          <Text style={styles.header}>
            {t('cust_step1_q')}
          </Text>
          <Option
            label={t('cust_struct_rot')}
            selected={prefs.structure === 'STATIC_ROTATION'}
            onPress={() =>
              setPrefs({
                ...prefs,
                structure: 'STATIC_ROTATION',
              })
            }
          />
          <Option
            label={t('cust_struct_mix')}
            selected={prefs.structure === 'MIXED_DAILY'}
            onPress={() =>
              setPrefs({
                ...prefs,
                structure: 'MIXED_DAILY',
              })
            }
          />
        </>
      )}

      {step === 2 && (
        <>
          <Text style={styles.header}>
            {t('cust_step2_q')}
          </Text>
          <Option
            label="2 Tasks / Day"
            selected={prefs.dailyTaskLimit === 2}
            onPress={() =>
              setPrefs({ ...prefs, dailyTaskLimit: 2 })
            }
          />
          <Option
            label="4 Tasks / Day"
            selected={prefs.dailyTaskLimit === 4}
            onPress={() =>
              setPrefs({ ...prefs, dailyTaskLimit: 4 })
            }
          />
        </>
      )}

      {step === 3 && (
        <>
          <Text style={styles.header}>
            {t('cust_step3_q')}
          </Text>
          <Option
            label={t('cust_rev_daily')}
            selected={prefs.revisionStyle === 'DAILY_LIGHT'}
            onPress={() =>
              setPrefs({
                ...prefs,
                revisionStyle: 'DAILY_LIGHT',
              })
            }
          />
          <Option
            label={t('cust_rev_alt')}
            selected={
              prefs.revisionStyle === 'ALTERNATE_DAYS'
            }
            onPress={() =>
              setPrefs({
                ...prefs,
                revisionStyle: 'ALTERNATE_DAYS',
              })
            }
          />
        </>
      )}

      {step === 4 && (
        <>
          <Text style={styles.header}>
            {t('cust_step4_q')}
          </Text>
          <Option
            label={t('cust_aw_daily')}
            selected={prefs.answerWritingFreq === 'DAILY'}
            onPress={() =>
              setPrefs({
                ...prefs,
                answerWritingFreq: 'DAILY',
              })
            }
          />
          <Option
            label={t('cust_aw_alt')}
            selected={
              prefs.answerWritingFreq === 'ALTERNATE'
            }
            onPress={() =>
              setPrefs({
                ...prefs,
                answerWritingFreq: 'ALTERNATE',
              })
            }
          />
        </>
      )}

      <Button
        fullWidth
        onPress={() => setStep(step + 1)}
      >
        Next
      </Button>
    </ScrollView>
  );
};

export default CustomizePlanScreen;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  lockIcon: {
    padding: 20,
    backgroundColor: '#f1f5f9',
    borderRadius: 40,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtext: {
    textAlign: 'center',
    color: '#64748b',
    marginBottom: 24,
  },
  highlight: {
    color: '#4f46e5',
    fontWeight: '700',
  },
  header: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  cardActive: {
    borderColor: '#4f46e5',
    backgroundColor: '#eef2ff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardDesc: {
    color: '#64748b',
    marginTop: 8,
  },
  summaryBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  summaryItem: {
    marginBottom: 8,
    color: '#475569',
  },
  bold: {
    fontWeight: '700',
    color: '#0f172a',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  optionActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#4f46e5',
  },
  optionText: {
    fontSize: 15,
    color: '#0f172a',
  },
  optionTextActive: {
    fontWeight: '700',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backText: {
    marginLeft: 6,
    color: '#94a3b8',
  },
});
