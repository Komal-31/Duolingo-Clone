'use client';

import React, { useEffect } from 'react';
import { Exercise, SubmitAnswerResponse } from '@/types/lesson';
import { Check, X } from 'lucide-react';
import { sound } from '@/lib/audio';

interface MultipleChoiceExerciseProps {
  exercise: Exercise;
  userAnswer: unknown;
  onAnswerChange: (answer: string) => void;
  isSubmitted: boolean;
  submissionResult: SubmitAnswerResponse | null;
  disabled?: boolean;
}

export const MultipleChoiceExercise: React.FC<MultipleChoiceExerciseProps> = ({
  exercise,
  userAnswer,
  onAnswerChange,
  isSubmitted,
  submissionResult,
  disabled = false,
}) => {
  const options = exercise.content.options || [];

  // Keyboard shortcut listener (1, 2, 3, 4)
  useEffect(() => {
    if (isSubmitted || disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= options.length) {
        e.preventDefault();
        sound.playClickSound();
        onAnswerChange(options[num - 1].text);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options, isSubmitted, disabled, onAnswerChange]);

  const selectedText = typeof userAnswer === 'string' ? userAnswer : null;

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6">
      {/* Exercise Prompt */}
      <h2 className="text-xl sm:text-2xl font-black text-[#4b4b4b] leading-tight mb-8">
        {exercise.prompt}
      </h2>

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {options.map((option, idx) => {
          const isSelected = selectedText === option.text;
          const isCorrect = isSubmitted && submissionResult?.is_correct && isSelected;
          const isWrong = isSubmitted && !submissionResult?.is_correct && isSelected;

          return (
            <button
              key={option.id || idx}
              type="button"
              disabled={disabled || isSubmitted}
              onClick={() => {
                sound.playClickSound();
                onAnswerChange(option.text);
              }}
              className={`relative flex flex-col items-center justify-between rounded-2xl border-2 p-5 transition-all text-center select-none ${
                isCorrect
                  ? 'border-[#58cc02] bg-[#d7ffb8] text-[#58cc02] shadow-[0_4px_0_#46a302]'
                  : isWrong
                  ? 'border-[#ff4b4b] bg-[#ffdfe0] text-[#ea2b2b] shadow-[0_4px_0_#ea2b2b]'
                  : isSelected
                  ? 'border-[#84d8ff] bg-[#ddf4ff] text-[#1cb0f6] shadow-[0_4px_0_#1899d6] translate-y-0.5'
                  : 'border-[#e5e5e5] bg-white hover:bg-gray-50 text-[#4b4b4b] shadow-[0_4px_0_#e5e5e5] active:translate-y-1 active:shadow-none'
              }`}
            >
              {/* Keyboard Shortcut Badge */}
              <span className="absolute top-2.5 left-2.5 flex h-6 w-6 items-center justify-center rounded-lg border border-gray-200 text-xs font-bold text-gray-400">
                {idx + 1}
              </span>

              {/* Emoji or Image */}
              {option.image ? (
                <span className="my-3 text-5xl select-none">{option.image}</span>
              ) : (
                <div className="my-4 h-12 w-12 rounded-xl bg-gray-100" />
              )}

              {/* Option Text */}
              <span className="mt-2 text-base font-extrabold tracking-wide">
                {option.text}
              </span>

              {/* Status check/x icon */}
              {isCorrect && (
                <div className="absolute top-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#58cc02] text-white">
                  <Check className="h-4 w-4 stroke-[3]" />
                </div>
              )}
              {isWrong && (
                <div className="absolute top-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#ff4b4b] text-white">
                  <X className="h-4 w-4 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
