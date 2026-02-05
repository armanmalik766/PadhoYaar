
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, StatusBar, TouchableOpacity, UIManager, Animated, Easing, Platform, Vibration } from 'react-native';
import * as Speech from 'expo-speech';
import { Task } from '../types';
import { X, CheckCircle, Pause, Play } from 'lucide-react-native';
import { useStore } from '../store/MockSupabaseStore';
import Svg, { Circle, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

interface FocusTimerProps {
  task: Task;
  startTime: number;
  durationMinutes: number;
  onComplete: () => void;
  onCancel: () => void;
}

const { width, height } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.75;
const STROKE_WIDTH = 12;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const FocusTimer: React.FC<FocusTimerProps> = ({ task, startTime, durationMinutes, onComplete, onCancel }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { t } = useStore();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Immersive mode
    StatusBar.setHidden(true, 'fade');
    return () => StatusBar.setHidden(false, 'fade');
  }, []);

  useEffect(() => {
    // Pulse animation for the "Focus Mode" text
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.6, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true })
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    if (isPaused) return;

    const totalSeconds = durationMinutes * 60;

    // Initial sync
    const syncTime = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, totalSeconds - elapsed);
      setTimeLeft(remaining);

      const progress = Math.min(1, 1 - remaining / totalSeconds);
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();

      if (remaining === 0) {
        // Feedback
        Vibration.vibrate([500, 500, 500]);
        Speech.speak('Time is over. Great focus session, aspirant!', {
          language: 'en',
          pitch: 1.0,
          rate: 0.9,
        });
        onComplete();
      }
    };

    syncTime();
    const interval = setInterval(syncTime, 1000);
    return () => clearInterval(interval);
  }, [startTime, durationMinutes, onComplete, isPaused]);

  // Stroke Dashoffset Calculation
  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0]
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Dynamic Background */}
      <View style={StyleSheet.absoluteFill}>
        <Svg height="100%" width="100%">
          <Defs>
            <LinearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#0f172a" stopOpacity="1" />
              <Stop offset="1" stopColor="#1e1b4b" stopOpacity="1" />
            </LinearGradient>
            <LinearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#818cf8" stopOpacity="0.1" />
              <Stop offset="1" stopColor="#818cf8" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#bgGrad)" />
          <Circle cx={width / 2} cy={height * 0.4} r={CIRCLE_SIZE / 1.5} fill="url(#glowGrad)" />
        </Svg>
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>

          {/* Main Timer */}
          <View style={styles.timerWrapper}>
            <View style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}>
              <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
                {/* Track */}
                <Circle
                  cx={CIRCLE_SIZE / 2}
                  cy={CIRCLE_SIZE / 2}
                  r={RADIUS}
                  stroke="#1e293b"
                  strokeWidth={STROKE_WIDTH}
                  fill="none"
                />
                {/* Progress - Animated */}
                <AnimatedCircle
                  cx={CIRCLE_SIZE / 2}
                  cy={CIRCLE_SIZE / 2}
                  r={RADIUS}
                  stroke="#6366f1"
                  strokeWidth={STROKE_WIDTH}
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                  strokeDashoffset={strokeDashoffset}
                  rotation="-90"
                  origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}
                />
              </Svg>

              {/* Time Text Overlay */}
              <View style={styles.timerOverlay}>
                <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>
                <Animated.Text style={[styles.focusLabel, { opacity: pulseAnim }]}>
                  FOCUS MODE
                </Animated.Text>
              </View>
            </View>
          </View>

          {/* Task Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskDesc} numberOfLines={2}>
              {task.description}
            </Text>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity style={styles.btnSecondary} onPress={onCancel}>
              <X size={24} color="#94a3b8" />
              <Text style={styles.btnTextSecondary}>Give Up</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnPrimary} onPress={onComplete}>
              <CheckCircle size={24} color="#fff" />
              <Text style={styles.btnTextPrimary}>Finish Early</Text>
            </TouchableOpacity>
          </View>

        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  safeArea: { flex: 1 },
  content: { flex: 1, justifyContent: 'space-between', paddingVertical: 40, paddingHorizontal: 24 },

  timerWrapper: { flex: 2, alignItems: 'center', justifyContent: 'center' },
  timerOverlay: { position: 'absolute', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' },
  timeText: { fontSize: 68, fontWeight: '800', color: '#fff', fontVariant: ['tabular-nums'] },
  focusLabel: { fontSize: 14, color: '#818cf8', fontWeight: '600', letterSpacing: 3, marginTop: 8 },

  infoContainer: { alignItems: 'center', marginBottom: 40 },
  taskTitle: { fontSize: 24, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 12 },
  taskDesc: { fontSize: 16, color: '#94a3b8', textAlign: 'center', lineHeight: 24, maxWidth: '90%' },

  controls: { flexDirection: 'row', gap: 20, marginBottom: 20 },
  btnPrimary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#059669', paddingVertical: 18, borderRadius: 20, gap: 10, shadowColor: '#059669', shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 },
  btnSecondary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(30, 41, 59, 0.8)', paddingVertical: 18, borderRadius: 20, gap: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },

  btnTextPrimary: { color: '#fff', fontSize: 16, fontWeight: '700' },
  btnTextSecondary: { color: '#94a3b8', fontSize: 16, fontWeight: '600' }
});
