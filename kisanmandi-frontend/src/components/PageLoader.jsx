import React from 'react';
import { Loader2, Sprout } from 'lucide-react';

export default function PageLoader() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="flex flex-col items-center justify-center min-h-[60vh] py-16 gap-4"
    >
      <div className="relative flex items-center justify-center">
        {/* Subtle pulsating brand circle */}
        <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200/80 flex items-center justify-center shadow-xs">
          <Sprout className="w-8 h-8 text-brand-700" />
        </div>
        {/* Outer spinner ring */}
        <Loader2 className="absolute -inset-1.5 w-[76px] h-[76px] text-brand-600/30 animate-spin" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-bold text-neutral-800 tracking-tight">KisanMandi</p>
        <p className="text-xs text-neutral-500 font-medium animate-pulse">Loading fresh harvest...</p>
      </div>
    </div>
  );
}
