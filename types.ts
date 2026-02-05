
export enum UserStatus {
  GUEST = 'GUEST',
  ONBOARDING = 'ONBOARDING',
  ACTIVE = 'ACTIVE'
}

export type Language = 'HINGLISH' | 'HI' | 'EN' | 'UR' | 'PA' | 'BN' | 'KN' | 'TE' | 'TA' | 'ML';

export type SyncStatus = 'SYNCED' | 'PENDING' | 'ERROR';

export type StudyMode = 'PRELIMS' | 'MAINS' | 'FINAL' | 'INTERVIEW';

export type SyllabusYield = 'HIGH' | 'MEDIUM' | 'LOW';

export enum TaskType {
  STUDY = 'STUDY',
  REVISION = 'REVISION',
  ANSWER_WRITING = 'ANSWER_WRITING',
  SYLLABUS_STUDY = 'SYLLABUS_STUDY',
  SYLLABUS_REVISION = 'SYLLABUS_REVISION'
}

export enum TaskStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED'
}

export type PlanType = 'GUIDED' | 'CUSTOM';
export type StudyStructure = 'STATIC_ROTATION' | 'MIXED_DAILY' | 'SINGLE_SUBJECT';
export type RevisionStyle = 'DAILY_LIGHT' | 'ALTERNATE_DAYS' | 'LIGHT_DAYS_ALLOWED';
export type AnswerWritingFreq = 'DAILY' | 'ALTERNATE' | 'WEEKENDS';

export type SubscriptionTier = 'FREE_TRIAL' | 'MONTHLY' | 'ANNUAL' | 'LIFETIME' | 'EXPIRED';

export type RecurrenceType = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface StudyPreferences {
  planType: PlanType;
  dailyTaskLimit: number;
  structure: StudyStructure;
  revisionStyle: RevisionStyle;
  answerWritingFreq: AnswerWritingFreq;
  lastModified: number;
  lockedUntil: number;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  photoUrl?: string;
  attemptYear: number;
  optionalSubject: string;
  dailyHoursGoal: number;
  mode: 'COACHING' | 'SELF_STUDY';
  studyMode: StudyMode;

  language: Language;
  preferences?: StudyPreferences;
  subscription: {
    tier: SubscriptionTier;
    trialStartedAt: number;
    expiresAt?: number;
  };
  createdAt: string;
  lastUpdated: number;
  syncStatus?: SyncStatus;
}

export interface Task {
  id: string;
  userId: string;
  date: string;
  title: string;
  type: TaskType;
  status: TaskStatus;
  topicId?: string;
  description?: string;
  subtasks?: string[];
  duration: number;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  yield?: SyllabusYield;
  recurrenceId?: string;
  completedAt?: number;
  lastUpdated: number;
  syncStatus?: SyncStatus;
  isBookmarked?: boolean;
}

export interface RecurringTaskTemplate {
  id: string;
  userId: string;
  title: string;
  type: TaskType;
  description?: string;
  duration: number;
  recurrence: RecurrenceType;
  createdAt: number;
}

export interface RevisionItem {
  id: string;
  userId: string;
  topic: string;
  sourceTaskId: string;
  stage: number;
  lastReviewedDate: string | null;
  nextRevisionDate: string;
  status: 'DUE' | 'UPCOMING' | 'COMPLETED_FOR_CYCLE';
  lastUpdated: number;
  syncStatus?: SyncStatus;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index
  explanation: string;
  category: 'CURRENT_AFFAIRS' | 'GS' | 'OPTIONAL' | 'GK' | 'SYLLABUS' | 'REVISION' | 'CSAT' | 'PRELIMS' | 'MAINS' | 'INTERVIEW';
  subject?: string;
}

export interface DailyProgress {
  date: string;
  tasksCompleted: number;
  tasksTotal: number;
  revisionCompliance: boolean;
  lastUpdated: number;
}

export interface ActiveSession {
  taskId: string;
  startTime: number;
  duration: number;
}

export interface ReadinessScore {
  subject: string;
  score: number;
  fullMark: number;
}
