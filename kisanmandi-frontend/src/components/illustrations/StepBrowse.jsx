import React from 'react';

/**
 * StepBrowse illustration: Browsing fresh farm harvest / Mandi produce.
 */
export default function StepBrowse({ className = 'w-24 h-24' }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="54" fill="#f0fdf4" />
      <ellipse cx="60" cy="98" rx="36" ry="6" fill="#dcfce7" />

      {/* Produce basket */}
      <path
        d="M32 64 L40 88 H80 L88 64 Z"
        fill="#bbf7d0"
        stroke="#15803d"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M38 72 H82" stroke="#16a34a" strokeWidth="1.5" />
      <path d="M42 80 H78" stroke="#16a34a" strokeWidth="1.5" />

      {/* Fresh crops in basket */}
      {/* Tomato */}
      <circle cx="48" cy="60" r="10" fill="#ef4444" stroke="#b91c1c" strokeWidth="1.5" />
      <path d="M48 50 V47 M46 48 H50" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
      {/* Corn/Grain */}
      <path d="M60 48 Q64 54 60 62 Q56 54 60 48 Z" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" />
      {/* Cabbage/Greens */}
      <circle cx="72" cy="61" r="9" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />

      {/* Search / discovery magnifying glass */}
      <circle cx="78" cy="42" r="16" fill="white" stroke="#0284c7" strokeWidth="2.5" />
      <path d="M89 53 L102 66" stroke="#0369a1" strokeWidth="4" strokeLinecap="round" />
      <path d="M72 38 Q78 34 82 38" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
