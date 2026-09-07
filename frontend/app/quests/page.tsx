'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Target, Zap, Check, Trophy, BookOpen, Star, Calendar } from 'lucide-react';
import { useAppShell } from '@/components/layout/AppShell';
import { api } from '@/lib/api';
import { DailyActivity } from '@/types/gamification';

interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly';
  icon: React.ReactNode;
  target: number;
  current: number;
  xpReward: number;
  color: string;
}

function QuestCard({ quest }: { quest: Quest }) {
  const pct = Math.min(100, quest.target > 0 ? (quest.current / quest.target) * 100 : 0);
  const isComplete = quest.current >= quest.target;

  return (
    <div className={`relative overflow-hidden rounded-2xl border-2 p-4 transition-all ${
      isComplete ? 'border-[#58cc02] bg-green-50' : 'border-[#e5e5e5] bg-white hover:border-gray-300'
    }`}>
      {isComplete && (
        <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#58cc02]">
          <Check className="h-4 w-4 text-white stroke-[3]" />
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${quest.color} shadow-sm`}>
          {quest.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-[#4b4b4b]">{quest.title}</h3>
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
              quest.type === 'daily' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
            }`}>
              {quest.type.toUpperCase()}
            </span>
          </div>
          <p className="mt-0.5 text-xs font-semibold text-gray-500">{quest.description}</p>

          {/* Progress Bar */}
          <div className="mt-2.5 space-y-1">
            <div className="flex items-center justify-between">
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100 mr-3">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isComplete
                      ? 'bg-gradient-to-r from-[#58cc02] to-[#46a302]'
                      : 'bg-gradient-to-r from-[#ffc800] to-[#ff9600]'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-[10px] font-black text-gray-500 shrink-0">
                {quest.current}/{quest.target}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* XP Reward */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-400 font-semibold">Reward</span>
        <div className="flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-1 border border-yellow-200">
          <Zap className="h-3 w-3 text-yellow-500 fill-yellow-400" />
          <span className="text-xs font-black text-yellow-700">+{quest.xpReward} XP</span>
        </div>
      </div>
    </div>
  );
}

export default function QuestsPage() {
  const { stats } = useAppShell();
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDailyActivity(1, 7)
      .then(setActivities)
      .finally(() => setLoading(false));
  }, []);

  const todayActivity = activities.find(a =>
    a.activity_date === new Date().toISOString().split('T')[0]
  );
  const todayXp = todayActivity?.xp_earned ?? 0;
  const todayLessons = todayActivity?.lessons_completed ?? 0;
  const dailyGoal = todayActivity?.daily_goal_xp ?? 50;
  const goalReached = todayActivity?.goal_reached ?? false;

  const streak = stats?.streak_count ?? 0;
  const totalXp = stats?.total_xp ?? 0;

  const dailyQuests: Quest[] = [
    {
      id: 'earn_xp',
      title: 'Earn 50 XP',
      description: 'Complete lessons to earn 50 XP today.',
      type: 'daily',
      icon: <Zap className="h-6 w-6 text-yellow-600 fill-yellow-400" />,
      target: dailyGoal,
      current: todayXp,
      xpReward: 10,
      color: 'bg-yellow-50',
    },
    {
      id: 'complete_lessons',
      title: 'Complete 2 Lessons',
      description: 'Finish 2 lessons today to sharpen your skills.',
      type: 'daily',
      icon: <BookOpen className="h-6 w-6 text-blue-600" />,
      target: 2,
      current: todayLessons,
      xpReward: 15,
      color: 'bg-blue-50',
    },
    {
      id: 'maintain_streak',
      title: 'Keep Your Streak',
      description: 'Learn at least once today to maintain your streak.',
      type: 'daily',
      icon: <Flame className="h-6 w-6 text-orange-600 fill-orange-400" />,
      target: 1,
      current: todayLessons >= 1 ? 1 : 0,
      xpReward: 5,
      color: 'bg-orange-50',
    },
  ];

  const weeklyQuests: Quest[] = [
    {
      id: '7_day_streak',
      title: '7-Day Streak',
      description: 'Maintain a 7-day learning streak this week.',
      type: 'weekly',
      icon: <Flame className="h-6 w-6 text-red-500 fill-red-400" />,
      target: 7,
      current: Math.min(7, streak),
      xpReward: 100,
      color: 'bg-red-50',
    },
    {
      id: 'earn_200_xp',
      title: 'Earn 200 XP',
      description: 'Accumulate 200 total XP across all lessons.',
      type: 'weekly',
      icon: <Star className="h-6 w-6 text-purple-600 fill-purple-400" />,
      target: 200,
      current: Math.min(200, totalXp),
      xpReward: 50,
      color: 'bg-purple-50',
    },
    {
      id: 'master_skill',
      title: 'Master a Skill',
      description: 'Complete all lessons in any one skill.',
      type: 'weekly',
      icon: <Trophy className="h-6 w-6 text-yellow-600 fill-yellow-400" />,
      target: 2,
      current: Math.floor(totalXp / 30),
      xpReward: 30,
      color: 'bg-yellow-50',
    },
  ];

  const completedDaily = dailyQuests.filter(q => q.current >= q.target).length;
  const completedWeekly = weeklyQuests.filter(q => q.current >= q.target).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-10">
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 shadow-[0_4px_0_#e5850a]">
            <Target className="h-9 w-9 text-orange-500 fill-orange-400" />
          </div>
          <h1 className="text-2xl font-black text-[#4b4b4b]">Daily Quests</h1>
          <p className="text-sm font-semibold text-gray-500">Complete quests to earn bonus XP!</p>
        </div>

        {/* Daily Goal Banner */}
        <div className={`rounded-3xl border-2 p-5 ${
          goalReached ? 'border-[#58cc02] bg-green-50' : 'border-[#e5e5e5] bg-white'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500 fill-orange-400" />
              <h2 className="text-base font-black text-[#4b4b4b]">Today&apos;s Goal</h2>
            </div>
            <span className={`text-sm font-black ${goalReached ? 'text-[#58cc02]' : 'text-[#ff9600]'}`}>
              {todayXp} / {dailyGoal} XP
            </span>
          </div>

          <div className="h-5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                goalReached
                  ? 'bg-gradient-to-r from-[#58cc02] to-[#46a302]'
                  : 'bg-gradient-to-r from-[#ffc800] to-[#ff9600]'
              }`}
              style={{ width: `${Math.min(100, (todayXp / dailyGoal) * 100)}%` }}
            />
          </div>

          {goalReached ? (
            <div className="mt-3 flex items-center gap-2 text-sm font-black text-[#58cc02]">
              <Check className="h-4 w-4 stroke-[3]" />
              Daily goal achieved! You&apos;re on fire! 🔥
            </div>
          ) : (
            <p className="mt-2 text-xs text-gray-500 font-semibold">
              {dailyGoal - todayXp} XP to go &mdash; you&apos;ve got this!
            </p>
          )}
        </div>

        {/* Daily Quests */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-black text-[#4b4b4b] flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              Daily
            </h2>
            <span className="text-xs font-black text-gray-400">
              {completedDaily}/{dailyQuests.length} complete
            </span>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {dailyQuests.map(q => <QuestCard key={q.id} quest={q} />)}
            </div>
          )}
        </section>

        {/* Weekly Quests */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-black text-[#4b4b4b] flex items-center gap-2">
              <Star className="h-4 w-4 text-purple-500 fill-purple-400" />
              Weekly Challenges
            </h2>
            <span className="text-xs font-black text-gray-400">
              {completedWeekly}/{weeklyQuests.length} complete
            </span>
          </div>
          <div className="space-y-3">
            {weeklyQuests.map(q => <QuestCard key={q.id} quest={q} />)}
          </div>
        </section>

      </div>
    </div>
  );
}
