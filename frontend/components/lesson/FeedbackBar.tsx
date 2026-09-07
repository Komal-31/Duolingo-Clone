'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

interface FeedbackBarProps {
  isSubmitted: boolean;
  isCorrect: boolean | null;
  correctAnswer: unknown;
  explanation?: string | null;
  canSubmit: boolean;
  isChecking: boolean;
  onCheck: () => void;
  onContinue: () => void;
}

function formatCorrectAnswer(ans: unknown): string {
  if (typeof ans === 'string') return ans;
  if (Array.isArray(ans)) return ans.join(' ');
  if (ans && typeof ans === 'object') {
    return Object.entries(ans)
      .map(([k, v]) => `${k} ➔ ${v}`)
      .join(', ');
  }
  return String(ans || '');
}

export const FeedbackBar: React.FC<FeedbackBarProps> = ({
  isSubmitted,
  isCorrect,
  correctAnswer,
  explanation,
  canSubmit,
  isChecking,
  onCheck,
  onContinue,
}) => {
  // Global Enter key handler for checking or continuing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!isSubmitted && canSubmit && !isChecking) {
          onCheck();
        } else if (isSubmitted) {
          onContinue();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitted, canSubmit, isChecking, onCheck, onContinue]);

  return (
    <div
      id="lesson-feedback-bar"
      className={`fixed bottom-0 left-0 right-0 z-40 border-t-2 p-4 sm:p-6 transition-all duration-200 ${
        !isSubmitted
          ? 'border-[#e5e5e5] bg-white'
          : isCorrect
          ? 'border-[#58cc02] bg-[#d7ffb8]'
          : 'border-[#ff4b4b] bg-[#ffdfe0]'
      }`}
    >
      <div className="mx-auto flex max-w-2xl flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left Side: Empty in idle, or Correct/Incorrect details when submitted */}
        <div className="flex-1 w-full sm:w-auto">
          {isSubmitted && (
            <div className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150">
              {isCorrect ? (
                <>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#58cc02]">
                    <CheckCircle2 className="h-8 w-8 fill-[#58cc02] text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#58cc02]">
                      Nicely done!
                    </h3>
                    <p className="text-xs font-bold text-green-800">
                      Great job! Press Continue to advance.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#ea2b2b]">
                    <XCircle className="h-8 w-8 fill-[#ea2b2b] text-white" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-[#ea2b2b]">
                      Correct solution:
                    </h3>
                    <p className="text-sm sm:text-base font-extrabold text-[#ea2b2b]">
                      {formatCorrectAnswer(correctAnswer)}
                    </p>
                    {explanation && (
                      <p className="text-xs font-semibold text-red-900/80">
                        {explanation}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Action Button */}
        <div className="w-full sm:w-auto">
          {!isSubmitted ? (
            <button
              id="check-answer-button"
              type="button"
              disabled={!canSubmit || isChecking}
              onClick={onCheck}
              className={`flex w-full sm:w-40 items-center justify-center rounded-2xl py-3.5 text-base font-black uppercase tracking-wider text-white transition ${
                canSubmit
                  ? 'btn-duo-green cursor-pointer'
                  : 'bg-[#e5e5e5] border-b-[4px] border-[#d4d4d8] text-gray-400 cursor-not-allowed opacity-60'
              }`}
            >
              {isChecking ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                'Check'
              )}
            </button>
          ) : (
            <button
              id="continue-button"
              type="button"
              onClick={onContinue}
              className={`flex w-full sm:w-44 items-center justify-center rounded-2xl py-3.5 text-base font-black uppercase tracking-wider text-white ${
                isCorrect ? 'btn-duo-green' : 'btn-duo-red'
              }`}
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
