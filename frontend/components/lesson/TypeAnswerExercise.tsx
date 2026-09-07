'use client';

import React, { useRef, useEffect } from 'react';
import { Exercise, SubmitAnswerResponse } from '@/types/lesson';
import { HelpCircle } from 'lucide-react';
import { sound } from '@/lib/audio';

interface TypeAnswerExerciseProps {
  exercise: Exercise;
  userAnswer: unknown;
  onAnswerChange: (answer: string) => void;
  isSubmitted: boolean;
  submissionResult: SubmitAnswerResponse | null;
  disabled?: boolean;
}

export const TypeAnswerExercise: React.FC<TypeAnswerExerciseProps> = ({
  exercise,
  userAnswer,
  onAnswerChange,
  isSubmitted,
  submissionResult,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const textValue = typeof userAnswer === 'string' ? userAnswer : '';
  const hint = exercise.content.hint;

  const [showHint, setShowHint] = React.useState(false);

  // Common punctuation/special helper bar
  const specialChars = ["'", '"', '.', ',', '!', '?', '-', ':'];

  useEffect(() => {
    if (!isSubmitted && !disabled) {
      inputRef.current?.focus();
    }
  }, [exercise.id, isSubmitted, disabled]);

  const insertChar = (char: string) => {
    if (isSubmitted || disabled) return;
    sound.playClickSound();
    const updated = textValue + char;
    onAnswerChange(updated);
    inputRef.current?.focus();
  };

  const isCorrect = isSubmitted && submissionResult?.is_correct;
  const isWrong = isSubmitted && !submissionResult?.is_correct;

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6">
      {/* Exercise Prompt */}
      <h2 className="text-xl sm:text-2xl font-black text-[#4b4b4b] leading-tight mb-2">
        {exercise.prompt}
      </h2>

      {/* Optional Hint */}
      {hint && (
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1cb0f6] hover:underline"
          >
            <HelpCircle className="h-4 w-4" />
            {showHint ? 'Hide hint' : 'Show hint'}
          </button>
          {showHint && (
            <p className="mt-1 text-xs font-semibold text-gray-500 italic bg-cyan-50 border border-cyan-200 p-2.5 rounded-xl">
              💡 {hint}
            </p>
          )}
        </div>
      )}

      {/* Input Field */}
      <div className="my-6">
        <input
          ref={inputRef}
          type="text"
          value={textValue}
          disabled={isSubmitted || disabled}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Type your answer..."
          aria-label={exercise.prompt}
          className={`w-full rounded-2xl border-2 p-4 text-lg sm:text-xl font-extrabold outline-hidden transition ${
            isCorrect
              ? 'border-[#58cc02] bg-[#d7ffb8] text-[#58cc02]'
              : isWrong
              ? 'border-[#ff4b4b] bg-[#ffdfe0] text-[#ea2b2b]'
              : 'border-[#e5e5e5] bg-gray-50/60 text-[#4b4b4b] focus:border-[#1cb0f6] focus:bg-white focus:shadow-xs'
          }`}
        />
      </div>

      {/* Punctuation Helper Bar */}
      {!isSubmitted && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {specialChars.map((char) => (
            <button
              key={char}
              type="button"
              disabled={disabled}
              onClick={() => insertChar(char)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#e5e5e5] bg-white text-base font-extrabold text-[#4b4b4b] shadow-[0_2px_0_#e5e5e5] hover:bg-gray-50 active:translate-y-0.5 active:shadow-none transition select-none"
            >
              {char}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
