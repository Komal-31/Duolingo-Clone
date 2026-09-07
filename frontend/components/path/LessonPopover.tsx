'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, X, Play, Crown, CheckCircle2, RefreshCw } from 'lucide-react';
import { SkillSummaryResponse } from '@/types/course';
import { api } from '@/lib/api';

interface SkillPopoverProps {
  skill: SkillSummaryResponse | null;
  onClose: () => void;
}

export const LessonPopover: React.FC<SkillPopoverProps> = ({
  skill,
  onClose,
}) => {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState(false);

  if (!skill) return null;

  const isCompleted =
    skill.status === 'completed' ||
    (skill.total_lessons > 0 && skill.completed_lessons >= skill.total_lessons);
  const isInProgress = !isCompleted && skill.completed_lessons > 0;

  const handleAction = async () => {
    try {
      setLoadingAction(true);
      // Fetch skill detail to find the specific active lesson ID
      const detail = await api.getSkill(skill.id);
      const targetLesson =
        detail.lessons.find((l) => l.status === 'active') ||
        detail.lessons.find((l) => l.status !== 'completed') ||
        detail.lessons[0];

      const lessonId = targetLesson ? targetLesson.id : skill.id;
      router.push(`/lesson/${lessonId}`);
    } catch {
      router.push(`/lesson/${skill.id}`);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm rounded-3xl border-2 border-[#e5e5e5] bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <div
            className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl ${
              isCompleted
                ? 'bg-amber-100 text-amber-500 shadow-[0_3px_0_#e5b400]'
                : 'bg-green-100 text-[#58cc02] shadow-[0_3px_0_#46a302]'
            }`}
          >
            {isCompleted ? (
              <Crown className="h-8 w-8 fill-amber-500 text-amber-500" />
            ) : (
              <Sparkles className="h-8 w-8 fill-[#58cc02]" />
            )}
          </div>

          <span className="text-xs font-black uppercase tracking-wider text-gray-400">
            Skill {skill.order_index}
          </span>
          <h3 className="mt-1 text-2xl font-black text-[#4b4b4b]">
            {skill.title}
          </h3>

          {skill.description && (
            <p className="mt-1 text-xs text-gray-500 font-semibold px-2">
              {skill.description}
            </p>
          )}

          {/* Lessons Progress / Status */}
          <div className="my-4 flex items-center justify-center gap-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-700 border border-green-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {skill.completed_lessons} / {skill.total_lessons} Lessons
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-600 border border-amber-200">
              <span>+15 XP</span>
            </span>
          </div>

          <p className="text-xs text-gray-500 mb-6 font-semibold">
            {isCompleted
              ? 'You have mastered this skill! Practice now to earn bonus XP and sharpen your skills.'
              : isInProgress
              ? `Keep going! You are on lesson ${skill.completed_lessons + 1} of ${skill.total_lessons}.`
              : 'Begin this skill to unlock new English vocabulary and sentence patterns!'}
          </p>

          <button
            disabled={loadingAction}
            onClick={handleAction}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-black text-white uppercase tracking-wider ${
              isCompleted ? 'btn-duo-blue' : 'btn-duo-green'
            }`}
          >
            {loadingAction ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Play className="h-5 w-5 fill-white" />
                {isCompleted ? 'Practice (+10 XP)' : isInProgress ? 'Continue Lesson' : 'Start Lesson'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
