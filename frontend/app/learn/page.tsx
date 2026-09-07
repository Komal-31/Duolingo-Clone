'use client';

import React from 'react';
import { LearningPath } from '@/components/path/LearningPath';
import { PathSkeleton } from '@/components/path/PathSkeleton';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { useLearningPath } from '@/hooks/useLearningPath';
import { useAppShell } from '@/components/layout/AppShell';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';

export default function LearnPage() {
  const { units, loading, error, refreshPath } = useLearningPath();
  const { stats, openHeartsModal, refreshStats } = useAppShell();

  const handleRetry = () => {
    refreshPath();
    refreshStats();
  };

  return (
    <div className="flex justify-center px-2 sm:px-4 md:px-8">
      {/* Main Learning Stream */}
      <main className="w-full max-w-2xl flex-1 py-4">
        {loading ? (
          <PathSkeleton />
        ) : error ? (
          <div
            id="learning-path-error"
            className="mx-auto my-12 max-w-lg rounded-3xl border-2 border-red-200 bg-red-50/70 p-6 sm:p-8 text-center shadow-lg"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-500 shadow-sm">
              <WifiOff className="h-8 w-8 text-red-500" />
            </div>

            <h3 className="text-xl font-black text-red-700">
              Connection to Backend Failed
            </h3>

            <p className="mt-2 text-xs sm:text-sm font-semibold text-red-600 leading-relaxed">
              We couldn&apos;t connect to the learning curriculum server. Make sure the backend dev server is running on port 8000.
            </p>

            <div className="mt-3 rounded-xl bg-red-100/80 p-2.5 text-left text-xs font-mono text-red-800">
              <span className="font-bold">Error: </span>{error}
            </div>

            <button
              id="retry-connection-button"
              onClick={handleRetry}
              className="btn-duo-green mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black text-white uppercase tracking-wider"
            >
              <RefreshCw className="h-4 w-4" />
              Retry Connection
            </button>
          </div>
        ) : units.length > 0 ? (
          <LearningPath units={units} />
        ) : (
          <div className="mx-auto my-12 max-w-md rounded-2xl border-2 border-[#e5e5e5] bg-gray-50 p-6 text-center">
            <AlertCircle className="mx-auto mb-2 h-10 w-10 text-gray-400" />
            <h3 className="text-lg font-bold text-gray-700">No Curriculum Available</h3>
            <p className="mt-1 text-sm text-gray-500">No units or skills were found for this course.</p>
          </div>
        )}
      </main>

      {/* Right Sidebar Widgets on Desktop */}
      <RightSidebar
        stats={stats}
        onOpenHeartsModal={openHeartsModal}
      />
    </div>
  );
}
