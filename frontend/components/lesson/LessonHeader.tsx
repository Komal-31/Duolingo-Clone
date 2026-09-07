'use client';

import React from 'react';
import { X, Heart } from 'lucide-react';

interface LessonHeaderProps {
  progressPercent: number;
  heartsRemaining: number;
  maxHearts?: number;
  onExit: () => void;
}

export const LessonHeader: React.FC<LessonHeaderProps> = ({
  progressPercent,
  heartsRemaining,
  maxHearts = 5,
  onExit,
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-100 bg-white/95 px-4 sm:px-8 backdrop-blur-xs">
      {/* Exit Button */}
      <button
        type="button"
        onClick={onExit}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
        title="Quit Lesson"
        aria-label="Quit Lesson"
      >
        <X className="h-6 w-6 stroke-[2.5]" />
      </button>

      {/* Lesson Progress Bar */}
      <div className="mx-4 sm:mx-8 flex-1 max-w-xl">
        <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-[#58cc02] transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Hearts Counter */}
      <div
        id="lesson-hearts-counter"
        className="flex items-center gap-1.5 font-black text-[#ff4b4b]"
        title={`${heartsRemaining}/${maxHearts} Hearts`}
      >
        <Heart className="h-6 w-6 fill-[#ff4b4b] animate-pulse" />
        <span className="text-base sm:text-lg">{heartsRemaining}</span>
      </div>
    </header>
  );
};
