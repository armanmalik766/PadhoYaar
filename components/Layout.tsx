import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {
  Home,
  Repeat,
  BarChart2,
  Settings,
  WifiOff,
  RefreshCw,
  HelpCircle,
  Newspaper,
} from 'lucide-react-native';
import { useStore } from '../store/MockSupabaseStore';

/**
 * 🔒 Single navigation source of truth
 */
export type ScreenName =
  | 'today'
  | 'revision'
  | 'quiz'
  | 'progress'
  | 'settings'
  | 'customize'
  | 'subscription'
  | 'news';

interface LayoutProps {
  children: React.ReactNode;
  activeScreen: ScreenName;
  onNavigate: (screen: ScreenName) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeScreen,
  onNavigate,
}) => {
  const { t, isOnline, isSyncing, unreadNewsCount } = useStore();

  const navItems: {
    id: ScreenName;
    label: string;
    icon: any;
  }[] = [
      { id: 'today', icon: Home, label: t('nav_today') },
      { id: 'news', icon: Newspaper, label: 'News' },
      { id: 'revision', icon: Repeat, label: t('nav_revision') },
      { id: 'quiz', icon: HelpCircle, label: 'Quiz' },
      { id: 'progress', icon: BarChart2, label: t('nav_progress') },
      { id: 'settings', icon: Settings, label: t('nav_profile') },
    ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Offline / Sync Banner */}
      {!isOnline && (
        <View style={[styles.banner, { backgroundColor: '#0f172a' }]}>
          <WifiOff size={12} color="#fbbf24" />
          <Text style={styles.bannerText}>Offline Mode • Sync later</Text>
        </View>
      )}

      {isOnline && isSyncing && (
        <View style={[styles.banner, { backgroundColor: '#4f46e5' }]}>
          <RefreshCw size={12} color="#fff" />
          <Text style={styles.bannerText}>Syncing…</Text>
        </View>
      )}

      {/* Conditional Scrolling: 'news' handles its own scrolling via FlatList */}
      {activeScreen === 'news' ? (
        <View style={[styles.content, { flex: 1, paddingBottom: 120 }]}>
          {children}
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {children}
        </ScrollView>
      )}

      {/* Bottom Navigation */}
      <View style={styles.navContainer}>
        <View style={styles.navInner}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.navItem, isActive && styles.navItemActive]}
                onPress={() => onNavigate(item.id)}
              >
                <View>
                  <Icon
                    size={20}
                    color={isActive ? '#fff' : '#94a3b8'}
                  />
                  {/* NOTIFICATION BADGE FOR NEWS */}
                  {item.id === 'news' && unreadNewsCount > 0 && (
                    <View style={{
                      position: 'absolute',
                      top: -5,
                      right: -5,
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: '#ef4444',
                      borderWidth: 1.5,
                      borderColor: isActive ? '#0f172a' : '#fff'
                    }} />
                  )}
                </View>
                {isActive && (
                  <Text style={styles.navText}>{item.label}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { paddingBottom: 120, paddingHorizontal: 16 },
  banner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 6,
  },
  bannerText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
    textTransform: 'uppercase',
  },
  navContainer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  navInner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 50,
    padding: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  navItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemActive: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 20,
  },
  navText: {
    marginLeft: 8,
    fontSize: 10,
    fontWeight: '900',
    color: '#fff',
    textTransform: 'uppercase',
  },
});
