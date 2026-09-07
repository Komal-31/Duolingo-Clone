'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Flame, ChevronDown, Medal, Star, Crown } from 'lucide-react';
import { api } from '@/lib/api';
import { LeaderboardResponse, LeaderboardUserItem } from '@/types/gamification';

const LEAGUES = ['Bronze', 'Silver', 'Gold', 'Sapphire', 'Ruby', 'Diamond'] as const;

const LEAGUE_STYLES: Record<string, { color: string; bg: string; icon: React.ReactNode; medal: string }> = {
  Bronze:   { color: 'text-amber-700',  bg: 'bg-amber-50  border-amber-200',  icon: <Medal className="h-5 w-5 text-amber-700" />,  medal: '🥉' },
  Silver:   { color: 'text-gray-500',   bg: 'bg-gray-50   border-gray-200',   icon: <Medal className="h-5 w-5 text-gray-400" />,   medal: '🥈' },
  Gold:     { color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200', icon: <Trophy className="h-5 w-5 text-yellow-500" />, medal: '🥇' },
  Sapphire: { color: 'text-blue-600',   bg: 'bg-blue-50   border-blue-200',   icon: <Star className="h-5 w-5 text-blue-500" />,    medal: '💎' },
  Ruby:     { color: 'text-rose-600',   bg: 'bg-rose-50   border-rose-200',   icon: <Star className="h-5 w-5 text-rose-500" />,    medal: '❤️' },
  Diamond:  { color: 'text-cyan-600',   bg: 'bg-cyan-50   border-cyan-200',   icon: <Crown className="h-5 w-5 text-cyan-500" />,   medal: '💠' },
};

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-xl">🥇</span>;
  if (rank === 2) return <span className="text-xl">🥈</span>;
  if (rank === 3) return <span className="text-xl">🥉</span>;
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-black text-gray-500">
      {rank}
    </span>
  );
}

function UserAvatar({ username, avatarUrl }: { username: string; avatarUrl: string | null }) {
  const colors = ['bg-violet-100 text-violet-700', 'bg-green-100 text-green-700', 'bg-blue-100 text-blue-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700', 'bg-cyan-100 text-cyan-700'];
  const colorIdx = username.charCodeAt(0) % colors.length;
  if (avatarUrl) {
    return <img src={avatarUrl} alt={username} className="h-10 w-10 rounded-full object-cover border-2 border-gray-200" />;
  }
  return (
    <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black ${colors[colorIdx]}`}>
      {username.charAt(0).toUpperCase()}
    </div>
  );
}

function LeaderboardRow({ entry, animate }: { entry: LeaderboardUserItem; animate: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl p-3 transition-all duration-500 ${
        entry.is_current_user
          ? 'border-2 border-[#1cb0f6] bg-[#ddf4ff] shadow-sm'
          : 'border-2 border-transparent hover:border-gray-200 hover:bg-gray-50'
      } ${animate ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}
    >
      <div className="flex w-8 items-center justify-center shrink-0">
        <RankBadge rank={entry.rank} />
      </div>

      <UserAvatar username={entry.username} avatarUrl={entry.avatar_url} />

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-black truncate ${entry.is_current_user ? 'text-[#1cb0f6]' : 'text-[#4b4b4b]'}`}>
          {entry.username}
          {entry.is_current_user && (
            <span className="ml-1.5 text-xs font-bold bg-[#1cb0f6] text-white px-1.5 py-0.5 rounded-full">YOU</span>
          )}
        </p>
        <div className="mt-1 flex items-center gap-1">
          <div className="h-1.5 max-w-24 rounded-full bg-gray-200 overflow-hidden flex-1">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#58cc02] to-[#46a302] transition-all duration-1000"
              style={{ width: `${Math.min(100, (entry.weekly_xp / 150) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Flame className="h-4 w-4 text-[#ff9600] fill-[#ff9600]" />
        <span className={`text-sm font-black ${entry.is_current_user ? 'text-[#1cb0f6]' : 'text-[#4b4b4b]'}`}>
          {entry.weekly_xp.toLocaleString()}
        </span>
        <span className="text-xs text-gray-400 font-semibold">XP</span>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const [selectedLeague, setSelectedLeague] = useState<string>('Bronze');
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animateRows, setAnimateRows] = useState(false);
  const [showLeagueDropdown, setShowLeagueDropdown] = useState(false);

  const fetchLeaderboard = useCallback(async (league: string) => {
    try {
      setLoading(true);
      setAnimateRows(false);
      setError(null);
      const data = await api.getLeaderboard(league, 1);
      setLeaderboard(data);
      setTimeout(() => setAnimateRows(true), 50);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    fetchLeaderboard(selectedLeague);
  }, [selectedLeague, fetchLeaderboard]);

  const leagueStyle = LEAGUE_STYLES[selectedLeague] ?? LEAGUE_STYLES['Bronze'];
  const currentUserEntry = leaderboard?.entries.find(e => e.is_current_user);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-10">
      <div className="mx-auto max-w-2xl px-4 py-6">

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-100 shadow-[0_4px_0_#e5b400]">
            <Trophy className="h-9 w-9 text-yellow-500 fill-yellow-400" />
          </div>
          <h1 className="text-2xl font-black text-[#4b4b4b]">Leaderboard</h1>
          <p className="text-sm font-semibold text-gray-500">Compete against learners this week!</p>
        </div>

        {/* League Selector */}
        <div className="mb-5 relative">
          <button
            onClick={() => setShowLeagueDropdown(v => !v)}
            className={`flex w-full items-center justify-between rounded-2xl border-2 p-4 font-black transition ${leagueStyle.bg} ${leagueStyle.color}`}
          >
            <div className="flex items-center gap-2">
              {leagueStyle.icon}
              <span>{selectedLeague} League</span>
            </div>
            <ChevronDown className={`h-5 w-5 transition-transform ${showLeagueDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showLeagueDropdown && (
            <div className="absolute z-20 mt-2 w-full rounded-2xl border-2 border-gray-200 bg-white shadow-xl overflow-hidden">
              {LEAGUES.map(league => {
                const ls = LEAGUE_STYLES[league];
                return (
                  <button
                    key={league}
                    onClick={() => { setSelectedLeague(league); setShowLeagueDropdown(false); }}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-bold transition hover:bg-gray-50 ${selectedLeague === league ? 'bg-gray-100' : ''}`}
                  >
                    <span className="text-lg">{ls.medal}</span>
                    <span className={ls.color}>{league} League</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Current user sticky banner */}
        {currentUserEntry && (
          <div className="mb-4 flex items-center justify-between rounded-2xl border-2 border-[#1cb0f6]/40 bg-[#ddf4ff] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-[#1cb0f6]">Your Position</span>
            </div>
            <div className="flex items-center gap-2">
              <RankBadge rank={currentUserEntry.rank} />
              <span className="text-sm font-black text-[#4b4b4b]">#{currentUserEntry.rank}</span>
              <span className="text-xs text-gray-500 font-semibold">— {currentUserEntry.weekly_xp} XP this week</span>
            </div>
          </div>
        )}

        {/* Leaderboard list */}
        <div className="rounded-3xl border-2 border-[#e5e5e5] bg-white overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#58cc02] border-t-transparent" />
              <p className="mt-3 text-sm font-semibold text-gray-500">Loading rankings...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              <p className="font-bold">{error}</p>
              <button onClick={() => fetchLeaderboard(selectedLeague)} className="mt-3 text-sm font-bold text-[#58cc02] hover:underline">
                Retry
              </button>
            </div>
          ) : leaderboard?.entries.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="font-bold">No rankings yet for this league.</p>
              <p className="text-sm mt-1">Complete lessons to appear on the board!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 p-2">
              {leaderboard?.entries.map((entry) => (
                <LeaderboardRow
                  key={entry.user_id}
                  entry={entry}
                  animate={animateRows}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        {leaderboard && (
          <p className="mt-4 text-center text-xs font-semibold text-gray-400">
            Week starting {new Date(leaderboard.week_start_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {leaderboard.entries.length} competitors
          </p>
        )}
      </div>
    </div>
  );
}
