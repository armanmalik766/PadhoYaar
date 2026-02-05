import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserProfile,
  Task,
  UserStatus,
  Language,
  RevisionItem,
  ReadinessScore,
  ActiveSession,
  TaskStatus,
  TaskType,
  RecurrenceType,
  StudyPreferences,
  SubscriptionTier,
} from '../types';
import { TRANSLATIONS, TranslationKey } from '../translations';
import { getSyllabus } from '../services/api/syllabusApi';
import { ExamStage } from '../types/syllabus';


import { API_BASE } from '../services/config';





/* ================= CONTEXT TYPES ================= */
interface StoreContextType {
  user: UserProfile | null;
  status: UserStatus;
  tasks: Task[];
  revisions: RevisionItem[];
  readiness: ReadinessScore[];
  streak: number;
  isLoading: boolean;
  isOnline: boolean;
  isSyncing: boolean;
  language: Language;
  activeSession: ActiveSession | null;
  examDates: { prelims: string; mains: string } | null;

  loginWithEmail: (email: string, name: string, isLoginMode: boolean) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: (data: Partial<UserProfile>) => Promise<void>;
  updateLanguage: (lang: Language) => void;

  markTaskComplete: (taskId: string) => Promise<void>;
  skipTask: (taskId: string, daysToSkip?: number) => Promise<void>;
  addCustomTask: (task: Partial<Task>, recurrence: RecurrenceType) => void;

  refreshDailyTasks: (force?: boolean) => Promise<void>;

  startSession: (taskId: string, duration: number) => void;
  endSession: () => void;

  getRealtimeExamDates: () => Promise<void>;
  completeRevision: (revisionId: string) => void;

  updateStudyPreferences: (prefs: StudyPreferences) => void;
  updateSubscription: (tier: SubscriptionTier) => void;

  t: (key: TranslationKey) => string;
  toggleBookmark: (taskId: string) => Promise<void>;
  unreadNewsCount: number;
  markNewsRead: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

/* ================= PROVIDER ================= */
export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<UserStatus>(UserStatus.GUEST);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [revisions] = useState<RevisionItem[]>([]);
  const [readiness, setReadiness] = useState<ReadinessScore[]>([]);

  // Update readiness based on Study Mode
  useEffect(() => {
    if (!user) return;

    let newReadiness: ReadinessScore[] = [];
    if (user.studyMode === 'MAINS') {
      newReadiness = [
        { subject: 'GS-I', score: 60, fullMark: 100 },
        { subject: 'GS-II', score: 75, fullMark: 100 },
        { subject: 'GS-III', score: 50, fullMark: 100 },
        { subject: 'GS-IV', score: 80, fullMark: 100 },
        { subject: 'Essay', score: 65, fullMark: 100 },
      ];
    } else if (user.studyMode === 'INTERVIEW') {
      newReadiness = [
        { subject: 'DAF Analysis', score: 40, fullMark: 100 },
        { subject: 'Current Affairs', score: 70, fullMark: 100 },
        { subject: 'Hobbies', score: 85, fullMark: 100 },
        { subject: 'Home State', score: 55, fullMark: 100 },
      ];
    } else {
      // PRELIMS (Default)
      newReadiness = [
        { subject: 'History', score: 65, fullMark: 100 },
        { subject: 'Polity', score: 80, fullMark: 100 },
        { subject: 'Geography', score: 45, fullMark: 100 },
        { subject: 'Economy', score: 70, fullMark: 100 },
        { subject: 'CSAT', score: 55, fullMark: 100 },
      ];
    }
    setReadiness(newReadiness);
  }, [user?.studyMode]);

  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [language, setLanguage] = useState<Language>('EN');
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [examDates, setExamDates] = useState<{ prelims: string; mains: string } | null>(null);

  /* ================= INIT ================= */
  useEffect(() => {
    const init = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('padhoyaar_user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          const safeUser = ensureDefaults(parsed);
          setUser(safeUser);
          setLanguage(safeUser.language || 'EN');
          setStatus(UserStatus.ACTIVE);

          // Load tasks from AsyncStorage, fallback to API if not found
          const tasksJson = await AsyncStorage.getItem('padhoyaar_tasks');
          if (tasksJson) {
            setTasks(JSON.parse(tasksJson));
          } else if (safeUser.id) {
            await fetchTasks(safeUser.id);
          }
        }
      } catch (e) {
        console.error('Init error:', e);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  /* ================= DEFAULTS HELPER ================= */
  const ensureDefaults = (u: any): UserProfile => ({
    ...u,
    id: u._id || u.id,
    preferences: u.preferences || {},
    subscription: u.subscription || { tier: 'FREE_TRIAL', trialStartedAt: Date.now() }
  });

  /* ================= HELPERS ================= */
  useEffect(() => {
    if (user) {
      const year = user.attemptYear || new Date().getFullYear();
      setExamDates({
        prelims: `${year}-05-26`,
        mains: `${year}-09-20`
      });
    }
  }, [user?.attemptYear]);

  /* ================= HELPERS ================= */
  const normalizeTasks = (data: any[]): Task[] =>
    data.map(t => ({
      ...t,
      id: t._id,
    }));

  const t = (key: TranslationKey) => {
    const lang = language as keyof typeof TRANSLATIONS;
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.EN[key] || key;
  };

  /* ================= API ================= */
  /* ================= API ================= */
  const fetchStreak = async (userId: string) => {
    try {
      const res = await fetch(`${API_BASE}/streak/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setStreak(data.currentStreak);
      }
    } catch (e) {
      console.error('Streak fetch failed:', e);
    }
  };

  const fetchTasks = async (userId: string) => {
    try {
      setIsSyncing(true);
      const res = await fetch(`${API_BASE}/tasks/${userId}`);
      const data = await res.json();
      const normalized = normalizeTasks(data);
      setTasks(normalized);
      await AsyncStorage.setItem('padhoyaar_tasks', JSON.stringify(normalized));
    } catch (e) {
      console.error('Fetch tasks failed:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const loginWithEmail = async (email: string, name: string, isLoginMode: boolean) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/sync-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          ...(name ? { name } : {}),
          mode: isLoginMode ? 'login' : 'signup'
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Authentication failed');
      }

      const dbUser = await res.json();
      const profile = ensureDefaults(dbUser);

      setUser(profile);
      setLanguage(profile.language || 'EN');

      // If new user or incomplete profile, go to onboarding
      if (!profile.attemptYear || !profile.studyMode) {
        setStatus(UserStatus.ONBOARDING);
      } else {
        setStatus(UserStatus.ACTIVE);
        await fetchTasks(profile.id);
        fetchStreak(profile.id);
      }

      await AsyncStorage.setItem('padhoyaar_user', JSON.stringify(profile));
    } catch (e: any) {
      console.error('Login failed:', e);
      // Re-throw to let Component handle UI feedback
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async (data: Partial<UserProfile>) => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const res = await fetch(`${API_BASE}/sync-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, ...data }),
      });

      const updated = await res.json();
      const merged = ensureDefaults({ ...user, ...updated });
      setUser(merged);
      setStatus(UserStatus.ACTIVE);
      await AsyncStorage.setItem('padhoyaar_user', JSON.stringify(merged));
      await refreshDailyTasks();
    } catch (e) {
      console.error('Onboarding failed:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const refreshDailyTasks = async (force?: boolean) => {
    if (!user) return;

    // Check if we already have tasks for TODAY
    const todayStr = new Date().toISOString().split('T')[0];
    const hasTodayTasks = tasks.some(t => t.date === todayStr);

    // If we have tasks and not forcing refresh, STOP. This fixes the "refresh on tab change" bug.
    if (hasTodayTasks && !force) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // 1. Call Backend Planner API
      const res = await fetch(`${API_BASE}/planner/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });

      if (!res.ok) throw new Error('Planner API failed');

      const data = await res.json();
      const newTasks = normalizeTasks(data);

      setTasks(prev => {
        // 1. Get current tasks for today to preserve status if possible
        const currentToday = prev.filter(t => t.date === todayStr);

        // 2. Map status from old to new (greedy match by topicId if possible)
        const newWithStatus = newTasks.map((nt) => {
          const match = currentToday.find(ct => ct.topicId && ct.topicId === nt.topicId);
          return match ? { ...nt, status: match.status, completedAt: match.completedAt } : nt;
        });

        // 3. Remove old tasks for TODAY
        const others = prev.filter(t => t.date !== todayStr);

        const combined = [...newWithStatus, ...others];
        // Persist
        AsyncStorage.setItem('padhoyaar_tasks', JSON.stringify(combined));
        return combined;
      });

    } catch (e) {
      console.error('❌ Plan generation failed:', e);
    } finally {
      setIsLoading(false);
    }
  };


  const markTaskComplete = async (taskId: string) => {
    if (!user) return;

    // Optimistic Update
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, status: TaskStatus.COMPLETED } : t))
    );

    try {
      const taskInfo = tasks.find(t => t.id === taskId);
      // If it's a syllabus task, use the special endpoint
      if (taskInfo && (taskInfo.type === TaskType.SYLLABUS_STUDY || taskInfo.type === TaskType.SYLLABUS_REVISION || taskInfo.topicId)) {
        await fetch(`${API_BASE}/planner/complete-block`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, taskId }),
        });
      } else {
        // Legacy or Custom task
        await fetch(`${API_BASE}/tasks/${taskId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: TaskStatus.COMPLETED }),
        });
      }

      // Refresh streak
      fetchStreak(user.id);
    } catch (e) {
      console.error('Task update failed:', e);
    }

    setActiveSession(null);
  };

  const skipTask = async (taskId: string, daysToSkip: number = 0) => {
    if (!user) return;

    // Optimistic Update
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, status: TaskStatus.SKIPPED } : t))
    );

    try {
      const taskInfo = tasks.find(t => t.id === taskId);
      // Call skip API
      await fetch(`${API_BASE}/planner/skip-block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, taskId, daysToSkip }),
      });

      // Refresh streak
      fetchStreak(user.id);
    } catch (e) {
      console.error('Task skip failed:', e);
    }
  };



  /* ================= STUBS (SAFE) ================= */
  const addCustomTask = (task: Partial<Task>, recurrence: RecurrenceType) => {
    if (!user) return;
    const newTask: Task = {
      id: `custom-${Date.now()}`,
      userId: user.id,
      title: task.title || 'Custom Task',
      description: task.description || 'Custom study goal',
      type: task.type || TaskType.STUDY,
      status: TaskStatus.PENDING,
      date: new Date().toISOString().split('T')[0],
      duration: task.duration || 60,
      priority: 'HIGH',
      lastUpdated: Date.now(),
      ...task,
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const completeRevision = () => { };
  const updateStudyPreferences = () => { };
  const updateSubscription = async (tier: SubscriptionTier) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      subscription: {
        tier,
        trialStartedAt: user.subscription?.trialStartedAt || Date.now()
      }
    };
    // Update State
    setUser(updatedUser);

    // Persist to Storage
    await AsyncStorage.setItem('padhoyaar_user', JSON.stringify(updatedUser));

    // Persist to Backend (Optional but recommended)
    try {
      await fetch(`${API_BASE}/sync-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, subscription: updatedUser.subscription }),
      });
    } catch (e) {
      console.error('Failed to sync subscription to backend', e);
    }
  };

  const startSession = (taskId: string, duration: number) =>
    setActiveSession({ taskId, startTime: Date.now(), duration });

  const endSession = () => setActiveSession(null);

  const getRealtimeExamDates = async () => {
    const year = user?.attemptYear || new Date().getFullYear();
    setExamDates({
      prelims: `${year}-05-26`,
      mains: `${year}-09-20`
    });
  };

  const logout = async () => {
    setUser(null);
    setStatus(UserStatus.GUEST);
    await AsyncStorage.multiRemove(['padhoyaar_user', 'padhoyaar_tasks']);
  };

  const [unreadNewsCount, setUnreadNewsCount] = useState(0);

  // Check for new news periodically
  useEffect(() => {
    const checkNews = async () => {
      try {
        const lastRead = await AsyncStorage.getItem('last_read_news_id');
        const res = await fetch(`${API_BASE}/current-affairs/today`);
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          const latestId = data.items[0].id || data.items[0].title; // Fallback if no ID
          if (latestId !== lastRead) {
            setUnreadNewsCount(data.items.length); // Or basic 1/true
          }
        }
      } catch (e) {
        console.error('News check failed', e);
      }
    };
    checkNews();
    // Poll every 5 minutes
    const interval = setInterval(checkNews, 300000);
    return () => clearInterval(interval);
  }, []);

  const markNewsRead = async () => {
    setUnreadNewsCount(0);
    try {
      const res = await fetch(`${API_BASE}/current-affairs/today`);
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        const latestId = data.items[0].id || data.items[0].title;
        await AsyncStorage.setItem('last_read_news_id', latestId);
      }
    } catch (e) {
      console.error('Failed to mark news read', e);
    }
  };

  const toggleBookmark = async (taskId: string) => {
    if (!user) return;

    // Optimistic Update
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, isBookmarked: !t.isBookmarked } : t))
    );

    try {
      const task = tasks.find(t => t.id === taskId);
      // Call backend (Note: endpoint path should match server)
      await fetch(`${API_BASE}/tasks/bookmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, isBookmarked: !task?.isBookmarked }),
      });
    } catch (e) {
      console.error('Bookmark failed:', e);
    }
  };

  /* ================= PROVIDER ================= */
  return (
    <StoreContext.Provider
      value={{
        user,
        status,
        tasks,
        revisions,
        readiness,
        streak,
        isLoading,
        isOnline,
        isSyncing,
        language,
        activeSession,
        examDates,
        loginWithEmail,
        logout,
        completeOnboarding,
        updateLanguage: setLanguage,
        markTaskComplete,
        skipTask,
        addCustomTask,
        refreshDailyTasks,
        startSession,
        endSession,
        getRealtimeExamDates,
        completeRevision,
        updateStudyPreferences,
        updateSubscription,
        t,
        toggleBookmark,
        unreadNewsCount,
        markNewsRead,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

/* ================= HOOK ================= */
export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};
