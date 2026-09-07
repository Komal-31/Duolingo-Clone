'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy, Target, Heart, ChevronRight, Zap, Check } from 'lucide-react';
import { UserStats, DailyActivity } from '@/types/gamification';
import { api } from '@/lib/api';

interface RightSidebarProps {
  stats: UserStats | null;
  onOpenHeartsModal: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  stats,
  onOpenHeartsModal,
}) => {
  const [todayActivity, setTodayActivity] = useState<DailyActivity | null>(null);

  useEffect(() => {
    api.getDailyActivity(1, 1).then(acts => {
      if (acts.length > 0) setTodayActivity(acts[0]);
    }).catch(() => null);
  }, [stats]); // refresh when stats change (lesson completed)

  const dailyGoal = todayActivity?.daily_goal_xp ?? 50;
  const todayXp = todayActivity?.xp_earned ?? 0;
  const goalReached = todayActivity?.goal_reached ?? false;
  const percent = Math.min(100, Math.round((todayXp / dailyGoal) * 100));

  return (
    <aside className="hidden w-80 shrink-0 flex-col gap-5 py-6 lg:flex pr-6">
      {/* Daily Quest Card */}
      <div className={`rounded-2xl border-2 bg-white p-5 shadow-sm transition-all ${
        goalReached ? 'border-[#58cc02]' : 'border-[#e5e5e5]'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className={`h-5 w-5 ${goalReached ? 'text-[#58cc02]' : 'text-[#ff9600]'}`} />
            <h3 className="font-extrabold text-[#4b4b4b] text-base">Daily Quest</h3>
          </div>
          <Link
            href="/quests"
            className="text-xs font-bold text-[#1cb0f6] hover:underline"
          >
            VIEW ALL
          </Link>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500">
            <span>Earn {dailyGoal} XP today</span>
            <span className={goalReached ? 'text-[#58cc02]' : 'text-[#ff9600]'}>
              {todayXp} / {dailyGoal} XP
            </span>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                goalReached
                  ? 'bg-gradient-to-r from-[#58cc02] to-[#46a302]'
                  : 'bg-gradient-to-r from-[#ffc800] to-[#ff9600]'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>

          {goalReached && (
            <div className="flex items-center gap-1.5 text-xs font-black text-[#58cc02] mt-1">
              <Check className="h-3.5 w-3.5 stroke-[3]" />
              Goal complete! Great work! 🎉
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard Teaser Card */}
      <div className="rounded-2xl border-2 border-[#e5e5e5] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[#ffc800] fill-[#ffc800]" />
            <h3 className="font-extrabold text-[#4b4b4b] text-base">Bronze League</h3>
          </div>
          <Link
            href="/leaderboard"
            className="flex items-center text-xs font-bold text-[#1cb0f6] hover:underline"
          >
            STANDINGS
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="text-xs font-medium text-gray-500 leading-relaxed mb-3">
          Compete against other language learners! Complete lessons to climb the weekly ranks.
        </p>

        <Link
          href="/leaderboard"
          className="btn-duo-gray flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black text-[#1cb0f6]"
        >
          <Zap className="h-4 w-4 fill-[#1cb0f6]" />
          CHECK YOUR RANK
        </Link>
      </div>

      {/* Hearts Card */}
      <div className={`rounded-2xl border-2 p-5 shadow-sm transition-all ${
        (stats?.current_hearts ?? 5) < 3
          ? 'border-red-300 bg-red-50'
          : 'border-red-100 bg-gradient-to-br from-red-50 to-white'
      }`}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
            <Heart className="h-6 w-6 fill-[#ff4b4b] text-[#ff4b4b]" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-[#4b4b4b]">
              {stats?.current_hearts ?? 5} / {stats?.max_hearts ?? 5} Hearts
            </h4>
            <p className="text-xs text-gray-500">
              {(stats?.current_hearts ?? 5) < 3
                ? '⚠️ Running low on hearts!'
                : 'Hearts regenerate over time.'}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenHeartsModal}
          className="btn-duo-red mt-3 w-full rounded-xl py-2 text-xs font-black text-white"
        >
          REFILL HEARTS
        </button>
      </div>
    </aside>
  );
};
