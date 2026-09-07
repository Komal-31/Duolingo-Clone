'use client';

import React from 'react';

export const PathSkeleton: React.FC = () => {
  const skeletonOffsets = [0, 45, 75, 45, 0, -45, -75, -45];

  return (
    <div className="mx-auto w-full max-w-xl pb-24 pt-4 px-4">
      {/* Unit 1 Skeleton Banner */}
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gray-200 p-5 shadow-[0_4px_0_#d4d4d8] animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2.5">
            <div className="h-3 w-16 rounded-md bg-gray-300" />
            <div className="h-6 w-48 sm:w-64 rounded-lg bg-gray-300" />
            <div className="h-3.5 w-40 sm:w-80 rounded-md bg-gray-300" />
          </div>
          <div className="h-12 w-12 rounded-xl bg-gray-300" />
        </div>
      </div>

      {/* Winding Circular Nodes Skeleton */}
      <div className="flex flex-col items-center">
        {skeletonOffsets.slice(0, 5).map((offset, idx) => (
          <div
            key={idx}
            className="my-5 flex flex-col items-center"
            style={{
              transform: `translateX(calc(${offset}px * var(--path-offset-scale, 1)))`,
            }}
          >
            {/* Circular node */}
            <div className="h-20 w-20 rounded-full border-b-[6px] border-gray-300 bg-gray-200 shadow-md animate-pulse" />
            {/* Label */}
            <div className="mt-2.5 h-3.5 w-20 rounded-full bg-gray-200 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
};
