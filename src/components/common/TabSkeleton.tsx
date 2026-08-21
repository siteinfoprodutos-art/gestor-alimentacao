import React from 'react';

export const TabSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse max-w-7xl mx-auto w-full">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 bg-stone-800 rounded-xl w-64"></div>
          <div className="h-4 bg-stone-800/60 rounded-lg w-80"></div>
        </div>
        <div className="h-10 bg-stone-800 rounded-xl w-36"></div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-stone-800 rounded w-24"></div>
              <div className="w-8 h-8 rounded-xl bg-stone-800"></div>
            </div>
            <div className="h-7 bg-stone-800 rounded w-32"></div>
            <div className="h-3 bg-stone-800/50 rounded w-20"></div>
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-stone-900 border border-stone-800 h-80"></div>
        <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 h-80"></div>
      </div>
    </div>
  );
};
