'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  Trophy,
  Target,
  User,
  Sparkles,
  Settings,
} from 'lucide-react';
import { useAppShell } from '@/components/layout/AppShell';

interface SidebarProps {
  onOpenHeartsModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const pathname = usePathname();
  const { user } = useAppShell();

  const navItems = [
    { label: 'LEARN',        href: '/learn',       icon: Compass },
    { label: 'LEADERBOARDS', href: '/leaderboard', icon: Trophy },
    { label: 'QUESTS',       href: '/quests',      icon: Target },
    { label: 'PROFILE',      href: '/profile',     icon: User },
  ];

  const initials = (user?.username ?? 'U').substring(0, 2).toUpperCase();

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r-2 border-[#e5e5e5] bg-white px-4 py-6 md:flex z-30">
        {/* Brand Logo */}
        <Link href="/learn" className="mb-8 px-4 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#58cc02] shadow-[0_3px_0_#46a302]">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-wider text-[#58cc02]">
            duolingo
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/learn'
                ? pathname === '/' || pathname.startsWith('/learn')
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 rounded-2xl px-4 py-3 text-sm font-black tracking-wider transition-all ${
                  isActive
                    ? 'border-2 border-[#84d8ff] bg-[#ddf4ff] text-[#1cb0f6]'
                    : 'text-[#777777] hover:bg-gray-100 hover:text-[#4b4b4b]'
                }`}
              >
                <Icon
                  className={`h-6 w-6 ${
                    isActive ? 'text-[#1cb0f6]' : 'text-[#777777]'
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Settings Link + User Profile Footer */}
        <div className="mt-auto space-y-2 border-t border-[#e5e5e5] pt-4">
          <Link
            href="/settings"
            className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-black tracking-wider transition-all ${
              pathname.startsWith('/settings')
                ? 'border-2 border-[#84d8ff] bg-[#ddf4ff] text-[#1cb0f6]'
                : 'text-[#777777] hover:bg-gray-100 hover:text-[#4b4b4b]'
            }`}
          >
            <Settings className={`h-5 w-5 ${pathname.startsWith('/settings') ? 'text-[#1cb0f6]' : 'text-[#777777]'}`} />
            SETTINGS
          </Link>

          <Link href="/profile" className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-xl transition">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#58cc02] to-[#2b9900] text-sm font-black text-white border-2 border-[#e5e5e5]">
              {initials}
            </div>
            <div>
              <p className="text-sm font-black text-[#4b4b4b]">{user?.username ?? 'Learner'}</p>
              <p className="text-xs font-semibold text-gray-400">Spanish Learner</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 z-40 flex h-16 w-full items-center justify-around border-t-2 border-[#e5e5e5] bg-white px-2 md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/learn'
              ? pathname === '/' || pathname.startsWith('/learn')
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center rounded-xl p-2 transition ${
                isActive ? 'text-[#1cb0f6]' : 'text-gray-400'
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-[10px] font-bold mt-1">{item.label}</span>
            </Link>
          );
        })}
        <Link
          href="/settings"
          className={`flex flex-col items-center justify-center rounded-xl p-2 transition ${
            pathname.startsWith('/settings') ? 'text-[#1cb0f6]' : 'text-gray-400'
          }`}
        >
          <Settings className="h-6 w-6" />
          <span className="text-[10px] font-bold mt-1">MORE</span>
        </Link>
      </nav>
    </>
  );
};
