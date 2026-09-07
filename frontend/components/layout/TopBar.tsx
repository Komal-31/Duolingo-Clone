'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Flame, Gem, Heart, ChevronDown, Zap } from 'lucide-react';
import { UserStats } from '@/types/gamification';
import { User } from '@/types/user';

interface TopBarProps {
  stats: UserStats | null;
  user: User | null;
  loading?: boolean;
  onOpenHeartsModal: () => void;
  courseTitle?: string;
  flagEmoji?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  stats,
  user,
  loading = false,
  onOpenHeartsModal,
  courseTitle = 'English',
  flagEmoji = '🇬🇧',
}) => {
  const [imgError, setImgError] = useState(false);

  const streak = stats?.streak_count ?? 0;
  const xp = stats?.total_xp ?? 0;
  const gems = stats?.gems ?? 0;
  const hearts = stats?.current_hearts ?? 5;
  const maxHearts = stats?.max_hearts ?? 5;

  const username = user?.username || 'Learner';
  const initial = username.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b-2 border-[#e5e5e5] bg-white/95 px-3 backdrop-blur-md sm:px-6 md:px-8">
      {/* Course Indicator */}
      <div className="flex items-center">
        {loading ? (
          <div className="h-9 w-28 animate-pulse rounded-xl bg-gray-100" />
        ) : (
          <button
            className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 font-extrabold text-[#4b4b4b] hover:bg-gray-100 transition"
            title={`Course: ${courseTitle}`}
          >
            <span className="text-2xl">{flagEmoji}</span>
            <span className="hidden sm:inline text-sm font-black tracking-wide">{courseTitle}</span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Gamification Counters & Avatar */}
      <div className="flex items-center gap-3 sm:gap-5 md:gap-6">
        {loading ? (
          <div className="flex items-center gap-3">
            <div className="h-8 w-14 animate-pulse rounded-full bg-gray-100" />
            <div className="h-8 w-16 animate-pulse rounded-full bg-gray-100" />
            <div className="h-8 w-14 animate-pulse rounded-full bg-gray-100" />
            <div className="h-8 w-14 animate-pulse rounded-full bg-gray-100" />
            <div className="h-9 w-9 animate-pulse rounded-full bg-gray-100" />
          </div>
        ) : (
          <>
            {/* 1. Streak */}
            <div
              id="topbar-streak"
              className="flex items-center gap-1 font-black text-[#ff9600]"
              title={`${streak} Day Streak`}
            >
              <Flame className="h-5 w-5 sm:h-6 sm:w-6 fill-[#ff9600] animate-pulse" />
              <span className="text-xs sm:text-sm md:text-base">{streak}</span>
            </div>

            {/* 2. XP */}
            <div
              id="topbar-xp"
              className="flex items-center gap-1 font-black text-[#ffc800]"
              title={`${xp} Total Experience Points`}
            >
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 fill-[#ffc800]" />
              <span className="text-xs sm:text-sm md:text-base">{xp} <span className="hidden xs:inline text-[11px] font-extrabold text-amber-500">XP</span></span>
            </div>

            {/* 3. Gems */}
            <div
              id="topbar-gems"
              className="flex items-center gap-1 font-black text-[#1cb0f6]"
              title={`${gems} Gems`}
            >
              <Gem className="h-4 w-4 sm:h-5 sm:w-5 fill-[#1cb0f6]" />
              <span className="text-xs sm:text-sm md:text-base">{gems}</span>
            </div>

            {/* 4. Hearts */}
            <button
              id="topbar-hearts"
              onClick={onOpenHeartsModal}
              className="group flex items-center gap-1 rounded-xl px-1.5 py-1 font-black text-[#ff4b4b] hover:bg-red-50 transition"
              title={`${hearts}/${maxHearts} Hearts - Click to refill`}
            >
              <Heart className="h-5 w-5 sm:h-6 sm:w-6 fill-[#ff4b4b] group-hover:scale-110 transition-transform" />
              <span className="text-xs sm:text-sm md:text-base">{hearts}</span>
            </button>

            {/* 5. Profile Avatar */}
            <Link
              id="topbar-avatar"
              href="/profile"
              className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center overflow-hidden rounded-full border-2 border-[#e5e5e5] bg-gradient-to-br from-[#58cc02] to-[#2b9900] shadow-xs hover:border-[#58cc02] transition"
              title={`Logged in as ${username}`}
            >
              {user?.avatar_url && !imgError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar_url}
                  alt={username}
                  onError={() => setImgError(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs sm:text-sm font-black text-white">{initial}</span>
              )}
            </Link>
          </>
        )}
      </div>
    </header>
  );
};
