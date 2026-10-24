import React from 'react';

/**
 * Base Skeleton with gentle shimmer and reduced-motion safety.
 */
export function Skeleton({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`bg-stone-200/80 rounded-xl motion-safe:animate-pulse motion-reduce:opacity-60 ${className}`}
    />
  );
}

// Simple line skeleton placeholder
export function SkeletonLine({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`bg-stone-200/80 rounded-lg motion-safe:animate-pulse motion-reduce:opacity-60 ${className}`}
    />
  );
}

// Card-shaped skeleton
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs">
      <div className="aspect-square bg-stone-200/80 motion-safe:animate-pulse motion-reduce:opacity-60" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-stone-200/80 rounded-lg motion-safe:animate-pulse w-3/4" />
        <div className="h-6 bg-stone-200/80 rounded-lg motion-safe:animate-pulse w-1/2" />
        <div className="h-4 bg-stone-200/80 rounded-lg motion-safe:animate-pulse w-2/3" />
      </div>
    </div>
  );
}

// Row skeleton for lists
export function SkeletonRow() {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-4 flex items-center gap-4 shadow-xs">
      <div className="w-16 h-16 bg-stone-200/80 rounded-xl shrink-0 motion-safe:animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-stone-200/80 rounded-lg motion-safe:animate-pulse w-1/2" />
        <div className="h-3 bg-stone-200/80 rounded-lg motion-safe:animate-pulse w-1/3" />
      </div>
      <div className="h-5 bg-stone-200/80 rounded-lg motion-safe:animate-pulse w-16" />
    </div>
  );
}

export default Skeleton;
