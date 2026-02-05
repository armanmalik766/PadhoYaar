import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Modal,
  TouchableOpacity,
  TextInput,
  Switch,
  Platform,
  Dimensions
} from 'react-native';
import { useStore } from '../store/MockSupabaseStore';
import { Button, Card, Select, Badge } from '../components/UIComponents';
import {
  LogOut,
  User,
  Sliders,
  Lock,
  CreditCard,
  ChevronRight,
  Star,
  ShieldCheck,
  Crown,
  Zap,
  Edit2,
  X,
  Target,
  BookOpen,
  Mail,
  MoreHorizontal
} from 'lucide-react-native';
import { Language, SubscriptionTier } from '../types';

export type ScreenName =
  | 'today'
  | 'revision'
  | 'quiz'
  | 'progress'
  | 'settings'
  | 'customize'
  | 'subscription';

interface SettingsScreenProps {
  onNavigate?: (screen: ScreenName) => void;
}

const SUBJECT_OPTIONS: Record<string, string[]> = {
  PRELIMS: ['History', 'Geography', 'Polity', 'Economy', 'Science & Tech', 'Environment', 'CSAT', 'Current Affairs'],
  MAINS: ['Sociology', 'Geography', 'History', 'Political Science', 'Public Administration', 'Anthropology', 'Philosophy', 'Psychology', 'Economics', 'Mathematics', 'Medical Science', 'Law', 'Commerce'].sort(),
  INTERVIEW: ['DAF Analysis', 'Current Affairs', 'Hobbies', 'Mock Interview', 'Home State']
};

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onNavigate }) => {
  const { user, logout, t, updateLanguage, language, completeOnboarding } = useStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    targetYear: user?.attemptYear?.toString() || '2025',
    studyMode: user?.studyMode || 'PRELIMS',
    optionalSubject: user?.optionalSubject || 'None'
  });

  if (!user) return null;

  const isLocked =
    user.preferences?.lockedUntil &&
    user.preferences.lockedUntil > Date.now();

  const tier = user.subscription?.tier || 'FREE_TRIAL';
  const isPaid = tier !== 'FREE_TRIAL' && tier !== 'EXPIRED';

  const getTierColor = () => {
    switch (tier) {
      case 'LIFETIME':
      case 'ANNUAL': return '#10b981'; // Emerald
      case 'MONTHLY': return '#3b82f6'; // Blue
      case 'EXPIRED': return '#ef4444'; // Red
      default: return '#64748b'; // Slate
    }
  };

  const getTierName = (t: SubscriptionTier) => {
    switch (t) {
      case 'MONTHLY': return 'Pro Monthly';
      case 'ANNUAL': return 'Elite Annual';
      case 'LIFETIME': return 'Lifetime Access';
      case 'FREE_TRIAL': return 'Free Trial';
      case 'EXPIRED': return 'Plan Expired';
      default: return 'Guest';
    }
  };

  const start = user.subscription?.trialStartedAt ? new Date(user.subscription.trialStartedAt).getTime() : Date.now();
  const diff = Date.now() - start;
  const trialDaysLeft = Math.max(0, 90 - Math.floor(diff / (1000 * 60 * 60 * 24)));

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      await completeOnboarding({
        name: editForm.name,
        attemptYear: parseInt(editForm.targetYear),
        studyMode: editForm.studyMode as any,
        optionalSubject: editForm.optionalSubject
      });
      setModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (e) {
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  // Modern Header Component
  const SettingsHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.bigTitle}>Settings</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <MoreHorizontal size={24} color="#1e293b" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <SettingsHeader />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* PREMIUM PROFILE CARD */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=200` }}
                style={styles.avatarImg}
              />
              <TouchableOpacity style={styles.editBadge} onPress={() => setModalVisible(true)}>
                <Edit2 size={14} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.profileTexts}>
              <Text style={styles.profileName}>{user.name}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
              {isPaid && (
                <View style={styles.proBadge}>
                  <Crown size={12} color="#fff" strokeWidth={3} />
                  <Text style={styles.proBadgeText}>PRO MEMBER</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>TARGET</Text>
              <Text style={styles.statValue}>{user.attemptYear}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>MODE</Text>
              <Text style={styles.statValue}>{user.studyMode}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>FOCUS</Text>
              <Text style={styles.statValue} numberOfLines={1}>
                {(user.optionalSubject && user.optionalSubject !== 'None')
                  ? (user.optionalSubject.includes(',') ? 'Multiple' : user.optionalSubject.slice(0, 8) + (user.optionalSubject.length > 8 ? '..' : ''))
                  : 'General'}
              </Text>
            </View>
          </View>
        </View>

        {/* SUBSCRIPTION BANNER */}
        <TouchableOpacity
          style={styles.premiumCard}
          activeOpacity={0.9}
          onPress={() => onNavigate?.('subscription')}
        >
          <View style={styles.premiumContent}>
            <View style={[styles.premiumIconBox, { backgroundColor: tier === 'LIFETIME' ? '#fffbeb' : '#f1f5f9' }]}>
              {tier === 'LIFETIME' ? <Star size={24} color="#f59e0b" fill="#f59e0b" /> : <Crown size={24} color="#f59e0b" />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.premiumTitle}>Current Plan</Text>
              <Text style={styles.premiumSubtitle}>
                {tier === 'FREE_TRIAL' ? `${trialDaysLeft} Days Remaining` : getTierName(tier)}
              </Text>
            </View>
            <View style={styles.statusChip}>
              <Text style={[styles.statusText, { color: getTierColor() }]}>
                {tier === 'FREE_TRIAL' ? 'TRIAL' : 'ACTIVE'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* SETTINGS GROUP */}
        <Text style={styles.sectionHeader}>Preferences</Text>
        <View style={styles.settingsGroup}>


          <View style={styles.settingItem}>
            <View style={[styles.settingIcon, { backgroundColor: '#fae8ff' }]}>
              <Zap size={20} color="#d946ef" />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>{t('label_language')}</Text>
              <Text style={styles.settingSubLabel}>App display language</Text>
            </View>
            <Select
              value={language}
              onChange={(e) => updateLanguage(e.target.value as Language)}
              options={[
                { value: 'HINGLISH', label: 'Hinglish' },
                { value: 'HI', label: 'Hindi' },
                { value: 'EN', label: 'English' },
              ]}
              style={{ width: 100, marginLeft: 10 }}
            />
          </View>
        </View>

        {/* SUPPORT */}
        <Text style={styles.sectionHeader}>Support</Text>
        <View style={styles.settingsGroup}>
          <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert('Support', 'Contact: support@padhoyaar.com')}>
            <View style={[styles.settingIcon, { backgroundColor: '#dcfce7' }]}>
              <ShieldCheck size={20} color="#16a34a" />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Help & Support</Text>
              <Text style={styles.settingSubLabel}>FAQs and Contact</Text>
            </View>
            <ChevronRight size={20} color="#cbd5e1" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.logoutText}>{t('set_logout')}</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>PadhoYaar v1.40 Made by  Socially Connect (Developer Arman Malik)</Text>
        </View>

      </ScrollView>

      {/* EDIT MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.name}
                onChangeText={(t) => setEditForm(prev => ({ ...prev, name: t }))}
                placeholder="Enter your name"
                placeholderTextColor="#94a3b8"
              />

              <Text style={styles.inputLabel}>Target Year</Text>
              <View style={styles.chipRow}>
                {['2025', '2026', '2027', '2028', '2029', '2030'].map(y => (
                  <TouchableOpacity
                    key={y}
                    style={[styles.modalChip, editForm.targetYear === y && styles.activeModalChip]}
                    onPress={() => setEditForm(p => ({ ...p, targetYear: y }))}
                  >
                    <Text style={[styles.modalChipText, editForm.targetYear === y && styles.activeModalChipText]}>{y}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Study Stage</Text>
              <View style={styles.chipRow}>
                {(['PRELIMS', 'MAINS', 'INTERVIEW'] as const).map(m => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.modalChip, editForm.studyMode === m && styles.activeModalChip]}
                    onPress={() => setEditForm(p => ({ ...p, studyMode: m as any, optionalSubject: SUBJECT_OPTIONS[m].join(',') }))}
                  >
                    <Text style={[styles.modalChipText, editForm.studyMode === m && styles.activeModalChipText]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Focus Subjects (Select Multiple)</Text>
              <View style={styles.subjectGrid}>
                {(SUBJECT_OPTIONS[editForm.studyMode] || []).map(sub => {
                  const isSelected = (editForm.optionalSubject || '').split(',').map(s => s.trim()).includes(sub);
                  return (
                    <TouchableOpacity
                      key={sub}
                      style={[styles.subjectChip, isSelected && styles.activeSubjectChip]}
                      onPress={() => {
                        const current = (editForm.optionalSubject || '').split(',').filter(s => s && s !== 'None').map(s => s.trim());
                        const newList = current.includes(sub) ? current.filter(s => s !== sub) : [...current, sub];
                        setEditForm(p => ({ ...p, optionalSubject: newList.length ? newList.join(',') : 'None' }));
                      }}
                    >
                      <Text style={[styles.subjectText, isSelected && styles.activeSubjectText]}>{sub}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc', // Very Light Slate
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  bigTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5
  },
  iconBtn: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 12
  },
  container: {
    padding: 24,
    paddingBottom: 40
  },

  // Profile Card
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 24
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16
  },
  avatarImg: {
    width: 100,
    height: 100,
    borderRadius: 40,
    backgroundColor: '#f1f5f9'
  },
  editBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#4f46e5',
    padding: 8,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#fff'
  },
  profileTexts: {
    alignItems: 'center',
    gap: 4
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a'
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500'
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f59e0b',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 8
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9'
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e2e8f0'
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.5
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155'
  },

  // Premium Card
  premiumCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  premiumIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a'
  },
  premiumSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2
  },
  statusChip: {
    backgroundColor: '#f8fafc',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5
  },

  // Section
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8
  },
  settingsGroup: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    marginBottom: 24
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 16
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 56
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  settingText: {
    flex: 1
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b'
  },
  settingSubLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 16,
    gap: 8,
    marginBottom: 40
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ef4444'
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20
  },
  footerText: {
    fontSize: 12,
    color: '#cbd5e1',
    fontWeight: '500'
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    height: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a'
  },
  closeBtn: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 20
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 16, // Smoother corners
    fontSize: 16,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  inputLabel: {
    fontSize: 14, // Smaller
    fontWeight: '700',
    color: '#64748b',
    marginTop: 20,
    marginBottom: 10
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  modalChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  activeModalChip: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  modalChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b'
  },
  activeModalChipText: {
    color: '#fff'
  },
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  subjectChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  activeSubjectChip: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1'
  },
  subjectText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500'
  },
  activeSubjectText: {
    color: '#4f46e5',
    fontWeight: '700'
  },
  saveBtn: {
    backgroundColor: '#0f172a',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  }
});
