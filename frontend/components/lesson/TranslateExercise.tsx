'use client';

import React, { useEffect } from 'react';
import { Exercise, SubmitAnswerResponse } from '@/types/lesson';
import { Volume2, Sparkles } from 'lucide-react';
import { sound } from '@/lib/audio';

interface TranslateExerciseProps {
  exercise: Exercise;
  userAnswer: unknown;
  onAnswerChange: (answer: string[]) => void;
  isSubmitted: boolean;
  submissionResult: SubmitAnswerResponse | null;
  disabled?: boolean;
}

export const TranslateExercise: React.FC<TranslateExerciseProps> = ({
  exercise,
  userAnswer,
  onAnswerChange,
  isSubmitted,
  disabled = false,
}) => {
  const sentence = exercise.content.source_sentence || exercise.content.target_sentence || '';
  const wordBank = exercise.content.word_bank || [];

  const selectedTokens: string[] = Array.isArray(userAnswer) ? userAnswer : [];

  // Count available instances of each word in the word bank vs how many are currently selected
  const availableIndices = React.useMemo(() => {
    const selectedCopy = [...selectedTokens];
    return wordBank.map((word) => {
      const idx = selectedCopy.indexOf(word);
      if (idx !== -1) {
        selectedCopy.splice(idx, 1);
        return false; // Used in answer
      }
      return true; // Available in bank
    });
  }, [wordBank, selectedTokens]);

  const addToken = (word: string) => {
    if (isSubmitted || disabled) return;
    sound.playClickSound();
    onAnswerChange([...selectedTokens, word]);
  };

  const removeToken = (indexToRemove: number) => {
    if (isSubmitted || disabled) return;
    sound.playClickSound();
    const updated = selectedTokens.filter((_, idx) => idx !== indexToRemove);
    onAnswerChange(updated);
  };

  // Keyboard shortcut: Backspace removes last token
  useEffect(() => {
    if (isSubmitted || disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' && selectedTokens.length > 0) {
        e.preventDefault();
        sound.playClickSound();
        onAnswerChange(selectedTokens.slice(0, -1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTokens, isSubmitted, disabled, onAnswerChange]);

  const handleSpeak = () => {
    sound.speakText(sentence, exercise.type === 'translate_to_target' ? 'en-US' : 'es-ES');
  };

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6">
      {/* Exercise Prompt */}
      <h2 className="text-xl sm:text-2xl font-black text-[#4b4b4b] leading-tight mb-6">
        {exercise.prompt}
      </h2>

      {/* Speech Bubble / Sentence Prompt */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#58cc02] text-white shadow-[0_4px_0_#46a302]">
          <Sparkles className="h-8 w-8 fill-white" />
        </div>

        <div className="relative flex items-center gap-3 rounded-2xl border-2 border-[#e5e5e5] bg-white p-4 shadow-xs">
          <button
            type="button"
            onClick={handleSpeak}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1cb0f6] text-white shadow-[0_3px_0_#1899d6] hover:brightness-105 active:translate-y-0.5 active:shadow-none transition"
            title="Listen pronunciation"
          >
            <Volume2 className="h-5 w-5" />
          </button>

          <span className="text-lg font-bold text-[#4b4b4b]">
            {sentence}
          </span>
        </div>
      </div>

      {/* Answer Slots Area */}
      <div className="min-h-[72px] mb-8 rounded-2xl border-b-2 border-[#e5e5e5] bg-gray-50/70 p-3 flex flex-wrap items-center gap-2">
        {selectedTokens.length === 0 ? (
          <span className="text-sm font-semibold text-gray-400 italic px-2">
            Tap the words below to build your translation...
          </span>
        ) : (
          selectedTokens.map((word, idx) => (
            <button
              key={`${word}-${idx}`}
              type="button"
              disabled={isSubmitted || disabled}
              onClick={() => removeToken(idx)}
              className="group flex items-center rounded-xl border-2 border-[#e5e5e5] bg-white px-3.5 py-2 text-sm sm:text-base font-extrabold text-[#4b4b4b] shadow-[0_3px_0_#e5e5e5] hover:border-red-300 hover:text-red-500 active:translate-y-0.5 active:shadow-none transition animate-in zoom-in-95 duration-100"
            >
              {word}
            </button>
          ))
        )}
      </div>

      <div className="border-t border-gray-100 pt-6">
        {/* Word Bank Chips */}
        <div className="flex flex-wrap justify-center gap-2.5">
          {wordBank.map((word, idx) => {
            const isAvailable = availableIndices[idx];

            return (
              <button
                key={`${word}-${idx}`}
                type="button"
                disabled={!isAvailable || isSubmitted || disabled}
                onClick={() => addToken(word)}
                className={`rounded-xl border-2 px-4 py-2.5 text-sm sm:text-base font-extrabold transition select-none ${
                  isAvailable
                    ? 'border-[#e5e5e5] bg-white text-[#4b4b4b] shadow-[0_3px_0_#e5e5e5] hover:bg-gray-50 active:translate-y-0.5 active:shadow-none cursor-pointer'
                    : 'border-transparent bg-gray-200/70 text-transparent shadow-none cursor-default pointer-events-none'
                }`}
              >
                {word}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
