'use client';

import React, { useState } from 'react';
import { HeartCrack, Zap, RefreshCw, Home, Heart } from 'lucide-react';

interface OutOfHeartsModalProps {
  isOpen: boolean;
  onPracticeRefill: () => Promise<unknown>;
  onInstantRefill: () => Promise<unknown>;
  onReturnHome: () => void;
}

export const OutOfHeartsModal: React.FC<OutOfHeartsModalProps> = ({
  isOpen,
  onPracticeRefill,
  onInstantRefill,
  onReturnHome,
}) => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePractice = async () => {
    try {
      setLoadingAction('practice');
      setErrorMessage(null);
      await onPracticeRefill();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Practice refill failed');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleInstantRefill = async () => {
    try {
      setLoadingAction('refill');
      setErrorMessage(null);
      await onInstantRefill();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Hearts refill failed');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border-2 border-[#e5e5e5] bg-white p-6 sm:p-8 text-center shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Broken Heart Icon */}
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-red-100/80 text-[#ff4b4b] shadow-inner">
          <HeartCrack className="h-14 w-14 fill-[#ff4b4b] text-[#ff4b4b] animate-bounce" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-[#4b4b4b]">
          You ran out of hearts!
        </h2>

        <p className="mt-2 text-sm font-semibold text-gray-500 leading-relaxed">
          Mistakes cost hearts. Practice previously learned skills to recover hearts, or refill them instantly to keep learning!
        </p>

        {errorMessage && (
          <div className="mt-3 rounded-xl bg-red-50 p-2.5 text-xs font-bold text-red-600 border border-red-200">
            {errorMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-3">
          {/* 1. Practice to Refill */}
          <button
            id="practice-refill-button"
            type="button"
            disabled={Boolean(loadingAction)}
            onClick={handlePractice}
            className="btn-duo-green flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black uppercase tracking-wider text-white"
          >
            {loadingAction === 'practice' ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Zap className="h-5 w-5 fill-white" />
                Practice to Refill (+1 Heart)
              </>
            )}
          </button>

          {/* 2. Instant Refill */}
          <button
            id="instant-refill-button"
            type="button"
            disabled={Boolean(loadingAction)}
            onClick={handleInstantRefill}
            className="btn-duo-blue flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black uppercase tracking-wider text-white"
          >
            {loadingAction === 'refill' ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Heart className="h-5 w-5 fill-white" />
                Refill Hearts to Full (5 Hearts)
              </>
            )}
          </button>

          {/* 3. Return Home */}
          <button
            id="return-home-button"
            type="button"
            disabled={Boolean(loadingAction)}
            onClick={onReturnHome}
            className="btn-duo-gray flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black uppercase tracking-wider text-gray-500 hover:text-gray-700"
          >
            <Home className="h-4 w-4" />
            Return Home
          </button>
        </div>
      </div>
    </div>
  );
};
