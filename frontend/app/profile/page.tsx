'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Zap, Heart, Trophy, Target, Star, Check, Lock, Gem, TrendingUp, BookOpen, Calendar } from 'lucide-react';
import { useAppShell } from '@/components/layout/AppShell';
import { api } from '@/lib/api';
import { DailyActivity, AchievementItem, AchievementsListResponse } from '@/types/gamification';

/* ── Radial progress ring ── */
function ProgressRing({
  value, max, size = 80, strokeWidth = 8, color = '#58cc02',
}: { value: number; max: number; size?: number; strokeWidth?: number; color?: string }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, max > 0 ? value / max : 0);
  const dash = pct * circ;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e5e5" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        className="transition-all duration-1000"
      />
    </svg>
  );
}

/* ── Streak Heatmap (last 7 days) ── */
function StreakHeatmap({ activities }: { activities: DailyActivity[] }) {
  const today = new Date();
  const days: { date: string; xp: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const act = activities.find(a => a.activity_date === dateStr);
    days.push({ date: dateStr, xp: act?.xp_earned ?? 0 });
  }

  return (
    <div className="flex items-end gap-1.5">
      {days.map(({ date, xp }) => {
        const maxXp = 50;
        const heightPct = xp > 0 ? Math.max(20, (xp / maxXp) * 100) : 8;
        const dayLabel = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
        return (
          <div key={date} className="flex flex-col items-center gap-1 flex-1">
            <div
              className={`w-full rounded-t-sm transition-all duration-700 ${xp > 0 ? 'bg-[#58cc02]' : 'bg-gray-200'}`}
              style={{ height: `${heightPct}%`, minHeight: 4, maxHeight: 40 }}
              title={`${xp} XP`}
            />
            <span className="text-[9px] font-bold text-gray-400">{dayLabel}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Achievement Badge ── */
function AchievementBadge({ ach }: { ach: AchievementItem }) {
  const iconMap: Record<string, React.ReactNode> = {
    flame: <Flame className="h-5 w-5" />,
    book: <BookOpen className="h-5 w-5" />,
    crown: <Trophy className="h-5 w-5" />,
    target: <Target className="h-5 w-5" />,
    gem: <Gem className="h-5 w-5" />,
    zap: <Zap className="h-5 w-5" />,
  };
  const pct = Math.min(100, ach.target_value > 0 ? (ach.current_progress / ach.target_value) * 100 : 0);

  return (
    <div className={`relative flex items-center gap-3 rounded-2xl border-2 p-3 transition-all ${ach.is_unlocked
        ? 'border-[#58cc02] bg-green-50'
        : 'border-[#e5e5e5] bg-gray-50 opacity-75'
      }`}>
      <div className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${ach.is_unlocked ? 'bg-[#58cc02] text-white shadow-[0_3px_0_#46a302]' : 'bg-gray-200 text-gray-400'
        }`}>
        {iconMap[ach.badge_icon] ?? <Star className="h-5 w-5" />}
        {ach.is_unlocked && (
          <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow">
            <Check className="h-2.5 w-2.5 text-[#58cc02] stroke-[3]" />
          </div>
        )}
        {!ach.is_unlocked && (
          <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-300">
            <Lock className="h-2.5 w-2.5 text-gray-500" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-black text-[#4b4b4b] truncate">{ach.title}</p>
        <p className="text-[10px] text-gray-500 truncate">{ach.description}</p>
        {!ach.is_unlocked && (
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-[#58cc02] transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </div>

      <div className="shrink-0 text-right">
        {ach.is_unlocked ? (
          <span className="text-xs font-black text-[#58cc02]">+{ach.xp_reward} XP</span>
        ) : (
          <span className="text-[10px] font-bold text-gray-400">{ach.current_progress}/{ach.target_value}</span>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { stats, user } = useAppShell();
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [achievements, setAchievements] = useState<AchievementsListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [acts, achs] = await Promise.all([
          api.getDailyActivity(1, 7),
          api.getAchievements(1),
        ]);
        setActivities(acts);
        setAchievements(achs);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const todayXp = activities.find(a => a.activity_date === new Date().toISOString().split('T')[0])?.xp_earned ?? 0;
  const dailyGoal = activities[activities.length - 1]?.daily_goal_xp ?? 50;

  /* Derived stats */
  const completedLessons = Math.floor((stats?.total_xp ?? 0) / 15);
  const completedSkills = Math.floor(completedLessons / 2);

  const initials = (user?.username ?? 'K').substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-10">
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-5">

        {/* Profile Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#58cc02] via-[#46a302] to-[#2d6b00] p-6 text-white shadow-[0_6px_0_#2d6b00]">
          {/* Background decoration */}
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/10 -translate-y-8 translate-x-8" />
          <div className="absolute right-8 bottom-0 h-20 w-20 rounded-full bg-white/10 translate-y-6" />

          <div className="relative flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white/50 bg-white/20 text-2xl font-black shadow-lg">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">{user?.username ?? 'Karan'}</h1>
              <p className="text-sm font-semibold text-green-100">English Learner</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-black">
                  <Flame className="h-3.5 w-3.5 fill-orange-300 text-orange-300" />
                  {stats?.streak_count ?? 0} day streak
                </div>
                <div className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-black">
                  <Zap className="h-3.5 w-3.5 fill-yellow-300 text-yellow-300" />
                  {stats?.total_xp?.toLocaleString() ?? 0} XP
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total XP', value: stats?.total_xp?.toLocaleString() ?? '0', icon: <Zap className="h-5 w-5 text-yellow-500 fill-yellow-400" />, color: 'bg-yellow-50 border-yellow-200' },
            { label: 'Streak', value: `${stats?.streak_count ?? 0}d`, icon: <Flame className="h-5 w-5 text-orange-500 fill-orange-400" />, color: 'bg-orange-50 border-orange-200' },
            { label: 'Hearts', value: `${stats?.current_hearts ?? 5}/${stats?.max_hearts ?? 5}`, icon: <Heart className="h-5 w-5 text-red-500 fill-red-400" />, color: 'bg-red-50 border-red-200' },
            { label: 'Gems', value: stats?.gems?.toLocaleString() ?? '500', icon: <Gem className="h-5 w-5 text-cyan-500 fill-cyan-400" />, color: 'bg-cyan-50 border-cyan-200' },
          ].map(stat => (
            <div key={stat.label} className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 ${stat.color}`}>
              {stat.icon}
              <span className="text-lg font-black text-[#4b4b4b]">{stat.value}</span>
              <span className="text-xs font-bold text-gray-500">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Progress Stats */}
        <div className="rounded-3xl border-2 border-[#e5e5e5] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#58cc02]" />
            <h2 className="text-base font-black text-[#4b4b4b]">Learning Progress</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Lessons Done', value: completedLessons, max: 10, color: '#58cc02' },
              { label: 'Skills Done', value: completedSkills, max: 5, color: '#1cb0f6' },
              { label: 'Best Streak', value: stats?.highest_streak ?? 0, max: 7, color: '#ff9600' },
            ].map(item => (
              <div key={item.label} className="flex flex-col items-center gap-1">
                <div className="relative">
                  <ProgressRing value={item.value} max={item.max} size={72} strokeWidth={7} color={item.color} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-black text-[#4b4b4b]">{item.value}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-500">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Goal + Activity Heatmap */}
        <div className="rounded-3xl border-2 border-[#e5e5e5] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-[#ff9600]" />
              <h2 className="text-base font-black text-[#4b4b4b]">Daily Goal</h2>
            </div>
            <span className="text-xs font-black text-[#ff9600]">{todayXp} / {dailyGoal} XP</span>
          </div>

          {/* Goal progress bar */}
          <div className="mb-5 h-4 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#ffc800] to-[#ff9600] transition-all duration-700"
              style={{ width: `${Math.min(100, (todayXp / dailyGoal) * 100)}%` }}
            />
          </div>
          {todayXp >= dailyGoal && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-green-50 p-2.5 border border-green-200">
              <span className="text-lg">🎉</span>
              <p className="text-xs font-black text-green-700">Daily goal complete! Amazing work today!</p>
            </div>
          )}

          {/* Weekly activity bars */}
          <div className="mb-2">
            <div className="mb-2 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-xs font-bold text-gray-500">7-day activity</span>
            </div>
            <div className="h-12">
              <StreakHeatmap activities={activities} />
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="rounded-3xl border-2 border-[#e5e5e5] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500 fill-yellow-400" />
              <h2 className="text-base font-black text-[#4b4b4b]">Achievements</h2>
            </div>
            {achievements && (
              <span className="rounded-full bg-[#58cc02] px-2.5 py-1 text-xs font-black text-white">
                {achievements.unlocked_count}/{achievements.total_count}
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-14 animate-pulse rounded-2xl bg-gray-100" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {achievements?.achievements.map(ach => (
                <AchievementBadge key={ach.id} ach={ach} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
