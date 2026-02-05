import React, { useEffect, useState } from 'react';
import { StoreProvider, useStore } from './store/MockSupabaseStore';
import { Layout } from './components/Layout';
import { UserStatus } from './types';

// Screens
import AuthScreen from './screens/AuthScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import TodayScreen from './screens/TodayScreen';
import RevisionScreen from './screens/RevisionScreen';
import ProgressScreen from './screens/ProgressScreen';
import SettingsScreen from './screens/SettingsScreen';
import CustomizePlanScreen from './screens/CustomizePlanScreen';
import SubscriptionScreen from './screens/SubscriptionScreen';
import QuizScreen from './screens/QuizScreen';
import QuizHistoryScreen from './screens/QuizHistoryScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import CurrentAffairsScreen from './screens/CurrentAffairsScreen';
import SyllabusTrackerScreen from './screens/SyllabusTrackerScreen';

/**
 * ✅ Single source of truth for navigation
 */
type ScreenName =
  | 'today'
  | 'revision'
  | 'quiz'
  | 'progress'
  | 'settings'
  | 'customize'
  | 'subscription'
  | 'quiz-history'
  | 'leaderboard'
  | 'news'
  | 'tracker';

const Main = () => {
  const { status } = useStore();
  const [activeScreen, setActiveScreen] = useState<ScreenName>('today');

  /**
   * Allow deep navigation from anywhere (used in TodayScreen → Quiz Hub)
   */
  useEffect(() => {
    (window as any).onQuizNavigate = () => {
      setActiveScreen('quiz');
    };

    return () => {
      delete (window as any).onQuizNavigate;
    };
  }, []);

  // -------- AUTH FLOW --------
  if (status === UserStatus.GUEST) {
    return <AuthScreen />;
  }

  if (status === UserStatus.ONBOARDING) {
    return <OnboardingScreen />;
  }

  // -------- FULL SCREEN FLOWS (NO BOTTOM NAV) --------
  if (activeScreen === 'customize') {
    return <CustomizePlanScreen onBack={() => setActiveScreen('settings')} />;
  }

  if (activeScreen === 'subscription') {
    return <SubscriptionScreen onBack={() => setActiveScreen('settings')} />;
  }

  if (activeScreen === 'quiz-history') {
    return <QuizHistoryScreen onBack={() => setActiveScreen('quiz')} />;
  }

  if (activeScreen === 'leaderboard') {
    return <LeaderboardScreen onBack={() => setActiveScreen('quiz')} />;
  }

  if (activeScreen === 'tracker') {
    return <SyllabusTrackerScreen onBack={() => setActiveScreen('progress')} />;
  }

  // -------- MAIN APP WITH LAYOUT --------
  return (
    <Layout
      activeScreen={activeScreen}
      onNavigate={(screen: ScreenName) => setActiveScreen(screen)}
    >
      {activeScreen === 'today' && <TodayScreen />}
      {activeScreen === 'news' && <CurrentAffairsScreen />}
      {activeScreen === 'revision' && <RevisionScreen />}
      {activeScreen === 'quiz' && (
        <QuizScreen
          onNavigate={(screen: ScreenName) => setActiveScreen(screen)}
        />
      )}
      {activeScreen === 'progress' && (
        <ProgressScreen
          onBack={() => setActiveScreen('today')}
          onNavigate={(screen: ScreenName) => setActiveScreen(screen)}
        />
      )}
      {activeScreen === 'settings' && (
        <SettingsScreen
          onNavigate={(screen: ScreenName) => setActiveScreen(screen)}
        />
      )}
    </Layout>
  );
};

const App = () => {
  return (
    <StoreProvider>
      <Main />
    </StoreProvider>
  );
};

export default App;
