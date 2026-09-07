import {
  Course,
  LearningPathResponse,
  SkillSummaryResponse,
  SkillDetailResponse,
  UnitDetailResponse,
} from '@/types/course';
import { StartLessonResponse, SubmitAnswerResponse, CompleteLessonResponse } from '@/types/lesson';
import { UserStats, RefillHeartsResponse, DailyActivity, LeaderboardResponse, AchievementsListResponse } from '@/types/gamification';
import { User } from '@/types/user';

const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
// Normalize localhost to 127.0.0.1 to avoid Windows IPv6 [::1] connection timeouts
const API_BASE_URL = rawBaseUrl.replace('://localhost:', '://127.0.0.1:');

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!res.ok) {
      let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errorData = await res.json();
        if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' 
            ? errorData.detail 
            : JSON.stringify(errorData.detail);
        }
      } catch {
        // use fallback message
      }
      throw new Error(errorMessage);
    }

    return await res.json() as T;
  } catch (error) {
    // If direct connection failed (e.g. IPv6 mismatch or network hiccup), try relative /api proxy
    if (url.startsWith('http')) {
      try {
        const fallbackUrl = `/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
        const res = await fetch(fallbackUrl, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
          },
        });
        if (res.ok) {
          return await res.json() as T;
        }
      } catch {
        // Ignore fallback failure and throw primary error
      }
    }
    console.error(`API request failed: ${url}`, error);
    throw error;
  }
}

export const api = {
  // Curriculum & Learning Path
  getCourse: (courseId?: number) =>
    fetchJson<Course>(courseId ? `/course?course_id=${courseId}` : '/course'),
  getCourses: () => fetchJson<Course[]>('/courses'),
  getUnits: (courseId?: number, userId: number = 1) => {
    const params = new URLSearchParams();
    if (courseId) params.append('course_id', courseId.toString());
    params.append('user_id', userId.toString());
    return fetchJson<UnitDetailResponse[]>(`/units?${params.toString()}`);
  },
  getSkills: (unitId?: number, courseId?: number, userId: number = 1) => {
    const params = new URLSearchParams();
    if (unitId) params.append('unit_id', unitId.toString());
    if (courseId) params.append('course_id', courseId.toString());
    params.append('user_id', userId.toString());
    return fetchJson<SkillSummaryResponse[]>(`/skills?${params.toString()}`);
  },
  getSkill: (skillId: number, userId: number = 1) =>
    fetchJson<SkillDetailResponse>(`/skills/${skillId}?user_id=${userId}`),
  getCoursePath: (courseId: number = 1, userId: number = 1) =>
    fetchJson<LearningPathResponse>(`/courses/${courseId}/path?user_id=${userId}`),

  // Users & Stats
  getMe: (userId?: number) =>
    fetchJson<User>(userId ? `/users/me?user_id=${userId}` : '/users/me'),
  getMyStats: (userId?: number) =>
    fetchJson<UserStats>(userId ? `/users/me/stats?user_id=${userId}` : '/users/me/stats'),
  getCurrentUser: (userId: number = 1) =>
    fetchJson<User>(`/users/current?user_id=${userId}`),
  getUserStats: (userId: number = 1) =>
    fetchJson<UserStats>(`/users/${userId}/stats`),
  refillHearts: (userId: number = 1, method: 'gems' | 'practice' = 'gems') =>
    fetchJson<RefillHeartsResponse>(`/users/${userId}/refill-hearts?method=${method}`, {
      method: 'POST',
    }),
  getDailyActivity: (userId: number = 1, days: number = 7) =>
    fetchJson<DailyActivity[]>(`/users/${userId}/activity?days=${days}`),
  getAchievements: (userId: number = 1) =>
    fetchJson<AchievementsListResponse>(`/users/${userId}/achievements`),

  // Leaderboard
  getLeaderboard: (league: string = 'Bronze', userId: number = 1) =>
    fetchJson<LeaderboardResponse>(`/leaderboard?league=${league}&user_id=${userId}`),

  // Lesson Engine
  startLesson: (lessonId: number, userId: number = 1) =>
    fetchJson<StartLessonResponse>(`/lessons/${lessonId}/start?user_id=${userId}`, {
      method: 'POST',
    }),
  answerExercise: (
    exerciseId: number,
    userAnswer: unknown,
    attemptId?: number,
    userId: number = 1
  ) =>
    fetchJson<SubmitAnswerResponse>(`/exercises/${exerciseId}/answer?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify({
        user_answer: userAnswer,
        attempt_id: attemptId,
      }),
    }),
  completeLesson: (lessonId: number, attemptId?: number, userId: number = 1) =>
    fetchJson<CompleteLessonResponse>(
      `/lessons/${lessonId}/complete?user_id=${userId}`,
      {
        method: 'POST',
        body: JSON.stringify({
          attempt_id: attemptId,
        }),
      }
    ),
  practiceSession: (userId: number = 1) =>
    fetchJson<{ hearts_recovered: number; current_hearts: number; xp_earned: number; total_xp: number; message: string }>(
      `/users/me/practice?user_id=${userId}`,
      {
        method: 'POST',
      }
    ),
  submitAnswer: (
    lessonId: number,
    attemptId: number,
    exerciseId: number,
    userAnswer: unknown,
    userId: number = 1
  ) =>
    fetchJson<SubmitAnswerResponse>(
      `/lessons/${lessonId}/attempts/${attemptId}/submit?user_id=${userId}`,
      {
        method: 'POST',
        body: JSON.stringify({
          exercise_id: exerciseId,
          user_answer: userAnswer,
        }),
      }
    ),
};
