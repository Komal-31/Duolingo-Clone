'use client';

import { useState, useEffect, useCallback } from 'react';
import { Exercise, SubmitAnswerResponse, CompleteLessonResponse } from '@/types/lesson';
import { api } from '@/lib/api';
import { sound } from '@/lib/audio';

export function useLesson(lessonId: number, userId: number = 1) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [lessonTitle, setLessonTitle] = useState<string>('');
  const [xpReward, setXpReward] = useState<number>(15);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [heartsRemaining, setHeartsRemaining] = useState<number>(5);

  const [isOutOfHearts, setIsOutOfHearts] = useState<boolean>(false);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);
  const [isLessonComplete, setIsLessonComplete] = useState<boolean>(false);
  const [completionData, setCompletionData] = useState<CompleteLessonResponse | null>(null);

  // Initialize Lesson by starting a new attempt
  const start = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setIsOutOfHearts(false);
      setIsLessonComplete(false);
      setCompletionData(null);
      setCurrentIndex(0);

      const startData = await api.startLesson(lessonId, userId);
      setAttemptId(startData.attempt_id);
      setLessonTitle(startData.lesson_title);
      setXpReward(startData.xp_reward);
      setExercises(startData.exercises);
      setHeartsRemaining(startData.hearts_remaining);

      if (startData.hearts_remaining <= 0) {
        setIsOutOfHearts(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to start lesson';
      setError(msg);
      if (msg.toLowerCase().includes('hearts')) {
        setIsOutOfHearts(true);
      }
    } finally {
      setLoading(false);
    }
  }, [lessonId, userId]);

  useEffect(() => {
    start();
  }, [start]);

  const currentExercise = exercises[currentIndex] || null;
  const progressPercent = exercises.length > 0
    ? Math.round(((currentIndex) / exercises.length) * 100)
    : 0;

  // Submit Answer to current exercise
  const submitAnswer = useCallback(
    async (userAnswer: unknown): Promise<SubmitAnswerResponse> => {
      if (!currentExercise || !attemptId) {
        throw new Error('No active exercise or attempt found.');
      }

      const response = await api.answerExercise(
        currentExercise.id,
        userAnswer,
        attemptId,
        userId
      );

      // Update hearts directly from live backend response
      setHeartsRemaining(response.hearts_remaining);

      // Play authentic sound effects
      if (response.is_correct) {
        sound.playCorrectSound();
      } else {
        sound.playIncorrectSound();
      }

      return response;
    },
    [currentExercise, attemptId, userId]
  );

  // Complete lesson on final exercise
  const completeLesson = useCallback(async () => {
    if (!attemptId) return;

    try {
      setIsCompleting(true);
      const res = await api.completeLesson(lessonId, attemptId, userId);
      setCompletionData(res);
      setIsLessonComplete(true);
      sound.playVictoryFanfare();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to finalize lesson';
      setError(msg);
    } finally {
      setIsCompleting(false);
    }
  }, [lessonId, attemptId, userId]);

  // Advance to next exercise
  const nextExercise = useCallback(() => {
    if (heartsRemaining <= 0) {
      setIsOutOfHearts(true);
      return;
    }

    if (currentIndex + 1 < exercises.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      completeLesson();
    }
  }, [heartsRemaining, currentIndex, exercises.length, completeLesson]);

  // Refill hearts handlers
  const refillHearts = useCallback(async (method: 'gems' | 'practice' = 'gems') => {
    try {
      const res = await api.refillHearts(userId, method);
      setHeartsRemaining(res.current_hearts);
      setIsOutOfHearts(false);
      return res;
    } catch (err) {
      console.error('Failed to refill hearts:', err);
      throw err;
    }
  }, [userId]);

  const doPracticeRefill = useCallback(async () => {
    try {
      const res = await api.practiceSession(userId);
      setHeartsRemaining(res.current_hearts);
      setIsOutOfHearts(false);
      return res;
    } catch (err) {
      console.error('Failed to complete practice session:', err);
      throw err;
    }
  }, [userId]);

  return {
    loading,
    error,
    lessonTitle,
    xpReward,
    exercises,
    currentIndex,
    currentExercise,
    totalExercises: exercises.length,
    progressPercent,
    heartsRemaining,
    isOutOfHearts,
    isCompleting,
    isLessonComplete,
    completionData,
    submitAnswer,
    nextExercise,
    refillHearts,
    doPracticeRefill,
    restartLesson: start,
    closeOutOfHearts: () => setIsOutOfHearts(false),
  };
}
