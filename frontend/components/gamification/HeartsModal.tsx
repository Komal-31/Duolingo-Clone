'use client';

import React, { useState } from 'react';
import { Heart, Gem, X, Zap } from 'lucide-react';
import { UserStats } from '@/types/gamification';

interface HeartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats | null;
  onRefill: (method: 'gems' | 'practice') => Promise<unknown>;
}

export const HeartsModal: React.FC<HeartsModalProps> = ({
  isOpen,
  onClose,
  stats,
  onRefill,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRefill = async (method: 'gems' | 'practice') => {
    try {
      setLoading(true);
      setError(null);
      await onRefill(method);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Refill failed');
    } finally {
      setLoading(false);
    }
  };

  const hearts = stats?.current_hearts ?? 5;
  const maxHearts = stats?.max_hearts ?? 5;
  const gems = stats?.gems ?? 500;
  const gemCost = 100;
  const canAfford = gems >= gemCost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl border-2 border-[#e5e5e5] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <Heart className="h-10 w-10 fill-[#ff4b4b] text-[#ff4b4b] animate-bounce" />
          </div>

          <h2 className="text-2xl font-black text-[#4b4b4b]">Hearts Refill</h2>
          <p className="mt-1 text-sm font-semibold text-gray-500">
            You currently have <span className="font-bold text-[#ff4b4b]">{hearts}/{maxHearts}</span> hearts.
          </p>

          <div className="my-5 flex items-center justify-center gap-2">
            {Array.from({ length: maxHearts }).map((_, i) => (
              <Heart
                key={i}
                className={`h-7 w-7 transition-all ${
                  i < hearts
                    ? 'fill-[#ff4b4b] text-[#ff4b4b]'
                    : 'text-gray-300 fill-gray-200'
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-2 text-xs font-semibold text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {/* Gem refill */}
            <button
              disabled={loading || hearts >= maxHearts || !canAfford}
              onClick={() => handleRefill('gems')}
              className="btn-duo-blue flex w-full items-center justify-between rounded-xl px-4 py-3 font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center gap-2">
                <Zap className="h-5 w-5 fill-white" />
                Refill to Full (5 Hearts)
              </span>
              <span className="flex items-center gap-1 rounded-lg bg-black/20 px-2 py-1 text-sm">
                <Gem className="h-4 w-4 fill-cyan-300 text-cyan-300" />
                {gemCost}
              </span>
            </button>

            {/* Practice refill */}
            <button
              disabled={loading || hearts >= maxHearts}
              onClick={() => handleRefill('practice')}
              className="btn-duo-green flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Heart className="h-5 w-5 fill-white" />
              Free Practice Session (+Full Hearts)
            </button>

            {hearts >= maxHearts && (
              <p className="text-xs font-semibold text-green-600 mt-2">
                ✨ Your hearts are completely full! Keep up the great work!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
