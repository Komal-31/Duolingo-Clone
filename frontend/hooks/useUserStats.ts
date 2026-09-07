'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserStats } from '@/types/gamification';
import { User } from '@/types/user';
import { api } from '@/lib/api';

export function useUserStats(userId: number = 1) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatsAndUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, userData] = await Promise.all([
        api.getMyStats(userId),
        api.getMe(userId),
      ]);
      setStats(statsData);
      setUser(userData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch user data';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStatsAndUser();
  }, [fetchStatsAndUser]);

  const refillHearts = async (method: 'gems' | 'practice' = 'gems') => {
    try {
      const res = await api.refillHearts(userId, method);
      setStats((prev) =>
        prev
          ? {
              ...prev,
              current_hearts: res.current_hearts,
              gems: res.gems,
            }
          : null
      );
      return res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to refill hearts';
      throw new Error(msg);
    }
  };

  return {
    stats,
    user,
    loading,
    error,
    refillHearts,
    refreshStats: fetchStatsAndUser,
  };
}
