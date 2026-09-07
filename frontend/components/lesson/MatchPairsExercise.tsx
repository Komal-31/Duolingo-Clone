'use client';

import React, { useState, useMemo } from 'react';
import { Exercise, SubmitAnswerResponse, MatchPair } from '@/types/lesson';
import { Check } from 'lucide-react';
import { sound } from '@/lib/audio';

interface MatchPairsExerciseProps {
  exercise: Exercise;
  userAnswer: unknown;
  onAnswerChange: (answer: Record<string, string>) => void;
  isSubmitted: boolean;
  submissionResult: SubmitAnswerResponse | null;
  disabled?: boolean;
}

export const MatchPairsExercise: React.FC<MatchPairsExerciseProps> = ({
  exercise,
  userAnswer,
  onAnswerChange,
  isSubmitted,
  disabled = false,
}) => {
  const pairs: MatchPair[] = exercise.content.pairs || [];

  // Stable shuffled words for left and right columns
  const leftWords = useMemo(() => pairs.map((p) => p.left), [pairs]);
  const rightWords = useMemo(() => {
    const list = pairs.map((p) => p.right);
    // Deterministic pseudo-shuffle based on string lengths
    return [...list].sort((a, b) => b.localeCompare(a));
  }, [pairs]);

  const matchedPairs: Record<string, string> =
    userAnswer && typeof userAnswer === 'object' ? (userAnswer as Record<string, string>) : {};

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);

  const handleLeftClick = (word: string) => {
    if (isSubmitted || disabled) return;
    sound.playClickSound();

    // If already paired, unpair it
    if (matchedPairs[word]) {
      const updated = { ...matchedPairs };
      delete updated[word];
      onAnswerChange(updated);
      return;
    }

    const newLeft = selectedLeft === word ? null : word;
    // If a right word is already selected, complete the match immediately
    if (newLeft && selectedRight) {
      const updated = { ...matchedPairs, [newLeft]: selectedRight };
      onAnswerChange(updated);
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      setSelectedLeft(newLeft);
    }
  };

  const handleRightClick = (word: string) => {
    if (isSubmitted || disabled) return;
    sound.playClickSound();

    // Find if this right word is already paired with some left word
    const existingLeft = Object.keys(matchedPairs).find(
      (k) => matchedPairs[k] === word
    );
    if (existingLeft) {
      const updated = { ...matchedPairs };
      delete updated[existingLeft];
      onAnswerChange(updated);
      return;
    }

    const newRight = selectedRight === word ? null : word;
    // If a left word is already selected, complete the match immediately
    if (newRight && selectedLeft) {
      const updated = { ...matchedPairs, [selectedLeft]: newRight };
      onAnswerChange(updated);
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      setSelectedRight(newRight);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6">
      {/* Exercise Prompt */}
      <h2 className="text-xl sm:text-2xl font-black text-[#4b4b4b] leading-tight mb-2">
        {exercise.prompt}
      </h2>
      <p className="text-xs font-semibold text-gray-400 mb-8">
        Tap a word in each column to match them up.
      </p>

      {/* Two Columns Grid */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        {/* Left Column */}
        <div className="flex flex-col gap-3">
          {leftWords.map((word) => {
            const isPaired = Boolean(matchedPairs[word]);
            const isSelected = selectedLeft === word;

            return (
              <button
                key={word}
                type="button"
                disabled={isSubmitted || disabled}
                onClick={() => handleLeftClick(word)}
                className={`relative flex min-h-[56px] items-center justify-between rounded-2xl border-2 px-4 py-3 text-sm sm:text-base font-extrabold transition select-none ${
                  isPaired
                    ? 'border-[#58cc02] bg-[#d7ffb8] text-[#58cc02] shadow-[0_3px_0_#46a302]'
                    : isSelected
                    ? 'border-[#84d8ff] bg-[#ddf4ff] text-[#1cb0f6] shadow-[0_3px_0_#1899d6] translate-y-0.5'
                    : 'border-[#e5e5e5] bg-white text-[#4b4b4b] shadow-[0_3px_0_#e5e5e5] hover:bg-gray-50 active:translate-y-0.5 active:shadow-none'
                }`}
              >
                <span>{word}</span>
                {isPaired && <Check className="h-4 w-4 stroke-[3]" />}
              </button>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-3">
          {rightWords.map((word) => {
            const pairedLeft = Object.keys(matchedPairs).find(
              (k) => matchedPairs[k] === word
            );
            const isPaired = Boolean(pairedLeft);
            const isSelected = selectedRight === word;

            return (
              <button
                key={word}
                type="button"
                disabled={isSubmitted || disabled}
                onClick={() => handleRightClick(word)}
                className={`relative flex min-h-[56px] items-center justify-between rounded-2xl border-2 px-4 py-3 text-sm sm:text-base font-extrabold transition select-none ${
                  isPaired
                    ? 'border-[#58cc02] bg-[#d7ffb8] text-[#58cc02] shadow-[0_3px_0_#46a302]'
                    : isSelected
                    ? 'border-[#84d8ff] bg-[#ddf4ff] text-[#1cb0f6] shadow-[0_3px_0_#1899d6] translate-y-0.5'
                    : 'border-[#e5e5e5] bg-white text-[#4b4b4b] shadow-[0_3px_0_#e5e5e5] hover:bg-gray-50 active:translate-y-0.5 active:shadow-none'
                }`}
              >
                <span>{word}</span>
                {isPaired && <Check className="h-4 w-4 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
