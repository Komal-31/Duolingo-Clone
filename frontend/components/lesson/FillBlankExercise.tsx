'use client';

import React from 'react';
import { Exercise, SubmitAnswerResponse } from '@/types/lesson';
import { sound } from '@/lib/audio';

interface FillBlankExerciseProps {
  exercise: Exercise;
  userAnswer: unknown;
  onAnswerChange: (answer: string) => void;
  isSubmitted: boolean;
  submissionResult: SubmitAnswerResponse | null;
  disabled?: boolean;
}

export const FillBlankExercise: React.FC<FillBlankExerciseProps> = ({
  exercise,
  userAnswer,
  onAnswerChange,
  isSubmitted,
  submissionResult,
  disabled = false,
}) => {
  const sentenceParts = exercise.content.sentence_parts || ['', ''];
  const blankOptions = exercise.content.blank_options || [];

  const selectedOption = typeof userAnswer === 'string' ? userAnswer : '';

  const handleSelect = (option: string) => {
    if (isSubmitted || disabled) return;
    sound.playClickSound();
    onAnswerChange(option);
  };

  const handleClear = () => {
    if (isSubmitted || disabled) return;
    sound.playClickSound();
    onAnswerChange('');
  };

  const isCorrect = isSubmitted && submissionResult?.is_correct;
  const isWrong = isSubmitted && !submissionResult?.is_correct;

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6">
      {/* Exercise Prompt */}
      <h2 className="text-xl sm:text-2xl font-black text-[#4b4b4b] leading-tight mb-8">
        {exercise.prompt}
      </h2>

      {/* Sentence with Blank Slot */}
      <div className="min-h-[100px] mb-10 flex flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-[#e5e5e5] bg-gray-50/60 p-6 text-xl sm:text-2xl font-black text-[#4b4b4b]">
        <span>{sentenceParts[0]}</span>

        {/* Blank slot button */}
        <button
          type="button"
          disabled={!selectedOption || isSubmitted || disabled}
          onClick={handleClear}
          className={`inline-flex min-w-[120px] items-center justify-center rounded-xl border-2 px-4 py-2 transition ${
            isCorrect
              ? 'border-[#58cc02] bg-[#d7ffb8] text-[#58cc02]'
              : isWrong
              ? 'border-[#ff4b4b] bg-[#ffdfe0] text-[#ea2b2b]'
              : selectedOption
              ? 'border-[#84d8ff] bg-[#ddf4ff] text-[#1cb0f6] shadow-xs'
              : 'border-dashed border-gray-300 bg-white text-transparent'
          }`}
        >
          {selectedOption || '______'}
        </button>

        <span>{sentenceParts[1] || ''}</span>
      </div>

      {/* Blank Option Chips */}
      <div className="border-t border-gray-100 pt-6">
        <p className="text-xs font-bold text-gray-400 text-center mb-4 uppercase tracking-wider">
          Choose the missing word
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          {blankOptions.map((option) => {
            const isSelected = selectedOption === option;

            return (
              <button
                key={option}
                type="button"
                disabled={isSubmitted || disabled}
                onClick={() => handleSelect(option)}
                className={`rounded-2xl border-2 px-5 py-3 text-base font-extrabold transition select-none ${
                  isSelected
                    ? 'border-[#84d8ff] bg-[#ddf4ff] text-[#1cb0f6] shadow-[0_3px_0_#1899d6] translate-y-0.5'
                    : 'border-[#e5e5e5] bg-white text-[#4b4b4b] shadow-[0_3px_0_#e5e5e5] hover:bg-gray-50 active:translate-y-0.5 active:shadow-none'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
