'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CompleteLessonResponse } from '@/types/lesson';
import { Zap, Flame, Target, Trophy, Heart } from 'lucide-react';

interface LessonCompleteModalProps {
  isOpen: boolean;
  completionData: CompleteLessonResponse | null;
  onContinue: () => void;
}

export const LessonCompleteModal: React.FC<LessonCompleteModalProps> = ({
  isOpen,
  completionData,
  onContinue,
}) => {
  // Fire celebratory confetti on mount
  useEffect(() => {
    if (!isOpen || !completionData) return;

    // Burst 1
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Burst 2
    const timer = setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [isOpen, completionData]);

  if (!isOpen || !completionData) return null;

  const dailyGoalPercent = Math.min(
    100,
    Math.round((completionData.today_xp / (completionData.daily_goal_xp || 50)) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border-2 border-[#e5e5e5] bg-white p-6 sm:p-8 text-center shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Celebration Trophy */}
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-amber-100 text-amber-500 shadow-inner">
          <Trophy className="h-14 w-14 fill-amber-500 text-amber-500 animate-bounce" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-[#4b4b4b]">
          Lesson Complete!
        </h2>
        <p className="mt-1 text-sm font-bold text-gray-400">
          You made great progress today!
        </p>

        {/* Real Backend Stats Grid */}
        <div className="my-6 grid grid-cols-2 gap-3 sm:gap-4">
          {/* 1. XP Earned */}
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/70 p-3.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-600">
              XP Earned
            </span>
            <div className="mt-1 flex items-center justify-center gap-1.5 text-2xl font-black text-[#ffc800]">
              <Zap className="h-6 w-6 fill-[#ffc800]" />
              +{completionData.xp_earned}
            </div>
            <p className="text-[10px] font-bold text-amber-800/70 mt-0.5">
              Total: {completionData.total_xp} XP
            </p>
          </div>

          {/* 2. Streak */}
          <div className="rounded-2xl border-2 border-orange-200 bg-orange-50/70 p-3.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-orange-600">
              Daily Streak
            </span>
            <div className="mt-1 flex items-center justify-center gap-1.5 text-2xl font-black text-[#ff9600]">
              <Flame className="h-6 w-6 fill-[#ff9600]" />
              {completionData.streak_count}
            </div>
            <p className="text-[10px] font-bold text-orange-800/70 mt-0.5">
              Day Streak
            </p>
          </div>
        </div>

        {/* Daily Goal Progress Bar */}
        <div className="mb-6 rounded-2xl border-2 border-[#e5e5e5] bg-gray-50/70 p-4 text-left">
          <div className="flex items-center justify-between text-xs font-black text-gray-500 mb-2">
            <span className="flex items-center gap-1">
              <Target className="h-4 w-4 text-[#ff9600]" />
              Daily XP Goal
            </span>
            <span className="text-[#ff9600]">
              {completionData.today_xp} / {completionData.daily_goal_xp} XP
            </span>
          </div>

          <div className="h-3.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#ffc800] to-[#ff9600] transition-all duration-700 ease-out"
              style={{ width: `${dailyGoalPercent}%` }}
            />
          </div>

          {/* Hearts Status */}
          <div className="mt-3 flex items-center justify-between text-xs font-bold text-gray-500 border-t border-gray-200/60 pt-2">
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5 fill-[#ff4b4b] text-[#ff4b4b]" />
              Hearts Remaining
            </span>
            <span className="font-extrabold text-[#ff4b4b]">
              {completionData.current_hearts} / 5
            </span>
          </div>
        </div>

        {/* Continue Button */}
        <button
          id="lesson-complete-continue-button"
          type="button"
          onClick={onContinue}
          className="btn-duo-green flex w-full items-center justify-center rounded-2xl py-3.5 text-base font-black uppercase tracking-wider text-white"
        >
          Continue
        </button>
      </div>
    </div>
  );
};
