import { Platform } from 'react-native';
import { QuizQuestion } from '../types';

import { API_BASE } from './config';

export const generateQuizQuestions = async (
  category: string,
  context: string,
  count: number = 20
): Promise<QuizQuestion[]> => {
  try {
    // Map context to subject if possible, or pass as subject
    // The API expects 'category', 'subject', 'limit'
    const queryParams = new URLSearchParams({
      category,
      limit: count.toString()
    });

    // If context appears to be a valid subject (e.g. "History"), pass it.
    // If it's a long string (revision topics), maybe we can't easily map it to a 'subject' file 
    // without more logic, but for now passing it as subject is the best bet 
    // if the backend handles filtering by checking if subject exists in the map.
    if (context && context !== 'UPSC') {
      queryParams.append('subject', context);
    }

    const response = await fetch(`${API_BASE}/quiz?${queryParams.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.success && Array.isArray(data.questions)) {
      return data.questions;
    }

    return [];

  } catch (error) {
    console.error('API Error (getQuiz):', error);
    return [];
  }
};

export const submitQuizResult = async (data: any) => {
  try {
    const response = await fetch(`${API_BASE}/quiz/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await response.json();
  } catch (error) {
    console.error('API Error (submitQuiz):', error);
    return { success: false };
  }
};

export const fetchQuizHistory = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE}/quiz/results/${userId}`);
    return await response.json();
  } catch (error) {
    console.error('API Error (history):', error);
    return { success: false, results: [] };
  }
};

export const fetchUserProgress = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE}/progress/${userId}`);
    // If response is not ok, return default structure or null
    if (!response.ok) throw new Error('Failed to fetch progress');
    return await response.json();
  } catch (error) {
    console.error('API Error (progress):', error);
    // Return safe default
    return {
      totalAttempts: 0,
      averageScore: 0,
      subjectWiseAccuracy: {},
      last7DaysTrend: [],
      bestSubject: 'N/A',
      weakestSubject: 'N/A'
    };
  }
};

export const fetchPlannerStats = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE}/planner/stats/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch planner stats');
    const data = await response.json();
    if (data.success && data.stats) return data.stats;
    return null;
  } catch (error) {
    console.error('API Error (planner stats):', error);
    return null;
  }
};

export const fetchLeaderboard = async (period: 'weekly' | 'allTime' = 'allTime') => {
  try {
    const response = await fetch(`${API_BASE}/leaderboard?period=${period}`);
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    return await response.json();
  } catch (error) {
    console.error('API Error (leaderboard):', error);
    return [];
  }
};

export const fetchSyllabusStatus = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE}/planner/syllabus-status/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch syllabus status');
    const data = await response.json();
    if (data.success && data.tree) return data.tree;
    return [];
  } catch (error) {
    console.error('API Error (syllabus status):', error);
    return [];
  }
};

export const toggleTopicStatus = async (userId: string, topicPath: string, status: 'COMPLETED' | 'PENDING') => {
  try {
    const response = await fetch(`${API_BASE}/planner/toggle-topic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, topicPath, status })
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('API Error (toggle topic):', error);
    return false;
  }
};
