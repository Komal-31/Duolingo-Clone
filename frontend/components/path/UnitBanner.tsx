'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';

interface UnitBannerProps {
  unitIndex: number;
  title: string;
  description: string | null;
}

export const UnitBanner: React.FC<UnitBannerProps> = ({
  unitIndex,
  title,
  description,
}) => {
  // Duo alternating unit themes
  const colorThemes = [
    { bg: 'bg-[#58cc02]', shadow: 'shadow-[0_4px_0_#46a302]', sub: 'text-green-100', p: 'text-green-50' },
    { bg: 'bg-[#1cb0f6]', shadow: 'shadow-[0_4px_0_#1899d6]', sub: 'text-cyan-100', p: 'text-cyan-50' },
    { bg: 'bg-[#ce82ff]', shadow: 'shadow-[0_4px_0_#a855f7]', sub: 'text-purple-100', p: 'text-purple-50' },
  ];

  const theme = colorThemes[(unitIndex - 1) % colorThemes.length];

  return (
    <div
      className={`relative mb-8 overflow-hidden rounded-2xl ${theme.bg} ${theme.shadow} p-5 text-white transition-all`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className={`text-xs font-black uppercase tracking-wider ${theme.sub}`}>
            Unit {unitIndex}
          </span>
          <h2 className="text-xl sm:text-2xl font-black leading-tight">{title}</h2>
          {description && (
            <p className={`mt-1 text-xs sm:text-sm font-semibold ${theme.p} max-w-md`}>
              {description}
            </p>
          )}
        </div>

        <button
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-white/40 bg-white/20 hover:bg-white/30 transition active:scale-95"
          title="Guidebook"
        >
          <BookOpen className="h-6 w-6 text-white" />
        </button>
      </div>
    </div>
  );
};
