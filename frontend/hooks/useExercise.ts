'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Exercise, SubmitAnswerResponse } from '@/types/lesson';

interface UseExerciseProps {
  exercise: Exercise | null;
  onSubmit: (answer: unknown) => Promise<SubmitAnswerResponse>;
}

export function useExercise({ exercise, onSubmit }: UseExerciseProps) {
  const [userAnswer, setUserAnswer] = useState<unknown>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmitAnswerResponse | null>(null);

  // Reset answer and submission state when the active exercise changes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserAnswer(null);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSubmitted(false);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsChecking(false);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSubmissionResult(null);
  }, [exercise?.id]);

  const canSubmit = useMemo(() => {
    if (!exercise || isSubmitted || isChecking) return false;

    switch (exercise.type) {
      case 'multiple_choice':
        return typeof userAnswer === 'string' && userAnswer.trim().length > 0;

      case 'translate_to_target':
      case 'translate_to_source':
        return Array.isArray(userAnswer) && userAnswer.length > 0;

      case 'match_pairs': {
        if (!userAnswer || typeof userAnswer !== 'object') return false;
        const targetPairsCount = exercise.content.pairs?.length || 0;
        return Object.keys(userAnswer as Record<string, string>).length >= targetPairsCount && targetPairsCount > 0;
      }

      case 'fill_in_blank':
      case 'type_answer':
        return typeof userAnswer === 'string' && userAnswer.trim().length > 0;

      default:
        return userAnswer !== null && userAnswer !== undefined;
    }
  }, [exercise, userAnswer, isSubmitted, isChecking]);

  const submit = useCallback(async () => {
    if (!canSubmit || isChecking) return null;

    try {
      setIsChecking(true);
      const result = await onSubmit(userAnswer);
      setSubmissionResult(result);
      setIsSubmitted(true);
      return result;
    } catch (err) {
      console.error('Failed to submit exercise answer:', err);
      throw err;
    } finally {
      setIsChecking(false);
    }
  }, [canSubmit, isChecking, onSubmit, userAnswer]);

  return {
    userAnswer,
    setAnswer: setUserAnswer,
    canSubmit,
    isSubmitted,
    isChecking,
    submissionResult,
    submit,
  };
}
