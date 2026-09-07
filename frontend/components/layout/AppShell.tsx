'use client';

import React, { useState, createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { HeartsModal } from '@/components/gamification/HeartsModal';
import { useUserStats } from '@/hooks/useUserStats';
import { UserStats } from '@/types/gamification';
import { User } from '@/types/user';

interface AppShellContextType {
  stats: UserStats | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  openHeartsModal: () => void;
  refreshStats: () => Promise<void>;
  refillHearts: (method?: 'gems' | 'practice') => Promise<unknown>;
}

const AppShellContext = createContext<AppShellContextType | undefined>(undefined);

export function useAppShell() {
  const context = useContext(AppShellContext);
  if (!context) {
    throw new Error('useAppShell must be used within an AppShell');
  }
  return context;
}

interface AppShellProps {
  children: React.ReactNode;
  courseTitle?: string;
  flagEmoji?: string;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  courseTitle = 'English',
  flagEmoji = '🇬🇧',
}) => {
  const pathname = usePathname();
  const isLessonPage = pathname.startsWith('/lesson');

  const [isHeartsModalOpen, setIsHeartsModalOpen] = useState(false);
  const { stats, user, loading, error, refillHearts, refreshStats } = useUserStats();

  const handleRefill = async (method: 'gems' | 'practice') => {
    await refillHearts(method);
    await refreshStats();
  };

  // Dedicated distraction-free full-screen layout for lesson player
  if (isLessonPage) {
    return (
      <AppShellContext.Provider
        value={{
          stats,
          user,
          loading,
          error,
          openHeartsModal: () => setIsHeartsModalOpen(true),
          refreshStats,
          refillHearts,
        }}
      >
        <div className="min-h-screen bg-white text-[#4b4b4b] antialiased">
          {children}
        </div>
      </AppShellContext.Provider>
    );
  }

  return (
    <AppShellContext.Provider
      value={{
        stats,
        user,
        loading,
        error,
        openHeartsModal: () => setIsHeartsModalOpen(true),
        refreshStats,
        refillHearts,
      }}
    >
      <div className="min-h-screen bg-white text-[#4b4b4b]">
        {/* Left Desktop Sidebar Navigation */}
        <Sidebar onOpenHeartsModal={() => setIsHeartsModalOpen(true)} />

        {/* Main Content Area with offset for Desktop Sidebar */}
        <div className="flex min-h-screen flex-col md:pl-64">
          {/* Global Sticky TopBar with Streak, XP, Gems, Hearts, and Profile Avatar */}
          <TopBar
            stats={stats}
            user={user}
            loading={loading}
            onOpenHeartsModal={() => setIsHeartsModalOpen(true)}
            courseTitle={courseTitle}
            flagEmoji={flagEmoji}
          />

          {/* Page Content */}
          <div className="flex-1 pb-20 md:pb-10">
            {children}
          </div>
        </div>

        {/* Global Hearts Refill Modal */}
        <HeartsModal
          isOpen={isHeartsModalOpen}
          onClose={() => setIsHeartsModalOpen(false)}
          stats={stats}
          onRefill={handleRefill}
        />
      </div>
    </AppShellContext.Provider>
  );
};
