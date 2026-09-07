'use client';

import React from 'react';
import {
  Star,
  Check,
  Lock,
  Sparkles,
  Crown,
  Coffee,
  Users,
  Utensils,
  BookOpen,
  MessageCircle,
  Hash,
  Compass,
} from 'lucide-react';
import { SkillSummaryResponse } from '@/types/course';

interface SkillNodeProps {
  skill: SkillSummaryResponse;
  horizontalOffset: number; // in pixels for the winding path
  isCurrentActive?: boolean;
  onClick: (skill: SkillSummaryResponse) => void;
}

export const SkillNode: React.FC<SkillNodeProps> = ({
  skill,
  horizontalOffset,
  isCurrentActive = false,
  onClick,
}) => {
  const isCompleted =
    skill.status === 'completed' ||
    (skill.total_lessons > 0 && skill.completed_lessons >= skill.total_lessons);
  const isLocked = skill.status === 'locked';
  const isInProgress = !isCompleted && !isLocked && skill.completed_lessons > 0;
  const isAvailable = !isCompleted && !isLocked && !isInProgress;

  // Calculate completion percentage for the circular progress ring
  const progressPercent = skill.total_lessons > 0
    ? Math.round((skill.completed_lessons / skill.total_lessons) * 100)
    : 0;
  // Radius = 44px -> circumference = 2 * PI * 44 = ~276.46
  const circumference = 276.46;
  const strokeDashoffset = circumference * (1 - progressPercent / 100);

  const renderSkillIcon = () => {
    // 1. Locked: distinct Lock icon
    if (isLocked) {
      return <Lock className="h-8 w-8 text-[#afafaf]" />;
    }

    // 2. Completed: distinct Crown icon (or golden checkmark)
    if (isCompleted) {
      return <Crown className="h-8 w-8 fill-white text-white drop-shadow-xs" />;
    }

    // 3. In-progress or Available: thematic icon or Star
    switch (skill.icon?.toLowerCase()) {
      case 'chat':
      case 'greetings':
        return <MessageCircle className="h-8 w-8 fill-white/30 text-white stroke-[2.5]" />;
      case 'food':
        return <Utensils className="h-8 w-8 text-white stroke-[2.5]" />;
      case 'coffee':
        return <Coffee className="h-8 w-8 text-white stroke-[2.5]" />;
      case 'numbers':
        return <Hash className="h-8 w-8 text-white stroke-[2.5]" />;
      case 'family':
        return <Users className="h-8 w-8 text-white stroke-[2.5]" />;
      case 'book':
      case 'words':
        return <BookOpen className="h-8 w-8 text-white stroke-[2.5]" />;
      case 'compass':
        return <Compass className="h-8 w-8 text-white stroke-[2.5]" />;
      default:
        return <Star className="h-8 w-8 fill-white text-white" />;
    }
  };

  const handleClick = () => {
    if (isLocked) return;
    onClick(skill);
  };

  return (
    <div
      className="relative my-5 flex flex-col items-center transition-transform duration-300"
      style={{
        transform: `translateX(calc(${horizontalOffset}px * var(--path-offset-scale, 1)))`,
      }}
    >
      {/* Floating "START" speech bubble for the currently active skill */}
      {(isCurrentActive || isAvailable) && !isLocked && (
        <div className="animate-float absolute -top-12 z-20">
          <div className="relative rounded-xl border-2 border-[#e5e5e5] bg-white px-3 py-1 text-xs font-black tracking-wider text-[#58cc02] shadow-md uppercase">
            Start
            {/* Speech bubble down arrow */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rotate-45 border-b-2 border-r-2 border-[#e5e5e5] bg-white" />
          </div>
        </div>
      )}

      {/* Floating progress pill for in-progress skill */}
      {isInProgress && !isLocked && (
        <div className="animate-float absolute -top-11 z-20">
          <div className="relative rounded-xl border-2 border-[#58cc02] bg-white px-2.5 py-0.5 text-[11px] font-black tracking-wide text-[#58cc02] shadow-md">
            {skill.completed_lessons} / {skill.total_lessons} Lessons
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 border-b-2 border-r-2 border-[#58cc02] bg-white" />
          </div>
        </div>
      )}

      {/* Button Wrapper with SVG Progress Ring for In-Progress */}
      <div className="relative flex items-center justify-center">
        {/* Distinct Visual: Progress Ring for in-progress node */}
        {isInProgress && (
          <svg
            className="absolute -inset-2.5 h-[100px] w-[100px] -rotate-90 pointer-events-none z-10"
            viewBox="0 0 100 100"
          >
            {/* Background ring track */}
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#e5e5e5"
              strokeWidth="6"
            />
            {/* Active progress stroke */}
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#58cc02"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>
        )}

        {/* Circular Node Button */}
        <button
          id={`skill-node-${skill.id}`}
          disabled={isLocked}
          aria-disabled={isLocked}
          onClick={handleClick}
          title={isLocked ? `${skill.title} (Locked)` : skill.title}
          className={`group relative flex h-20 w-20 items-center justify-center rounded-full transition-all duration-150 select-none ${
            isLocked
              ? 'bg-[#e5e5e5] border-b-[6px] border-[#afafaf] cursor-not-allowed pointer-events-none opacity-80'
              : isCompleted
              ? 'bg-[#ffc800] border-b-[6px] border-[#e5b400] hover:brightness-105 active:translate-y-1 active:border-b-2 shadow-lg shadow-amber-200/50 cursor-pointer'
              : isInProgress
              ? 'bg-[#58cc02] border-b-[6px] border-[#46a302] hover:brightness-105 active:translate-y-1 active:border-b-2 cursor-pointer'
              : 'animate-pulse-ring bg-[#58cc02] border-b-[6px] border-[#46a302] hover:brightness-105 active:translate-y-1 active:border-b-2 cursor-pointer'
          }`}
        >
          {renderSkillIcon()}

          {/* Sparkle badge for available/active */}
          {(isAvailable || isCurrentActive) && !isLocked && (
            <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-white shadow-xs">
              <Sparkles className="h-3.5 w-3.5 fill-white" />
            </div>
          )}

          {/* Checkmark badge for completed */}
          {isCompleted && (
            <div className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white border-2 border-white shadow-xs">
              <Check className="h-3.5 w-3.5 stroke-[3.5]" />
            </div>
          )}
        </button>
      </div>

      {/* Skill Title Label */}
      <span
        className={`mt-2.5 max-w-[140px] text-center text-xs font-black tracking-wide leading-tight ${
          isLocked
            ? 'text-gray-400'
            : isCompleted
            ? 'text-[#4b4b4b]'
            : 'text-[#58cc02]'
        }`}
      >
        {skill.title}
      </span>
    </div>
  );
};
