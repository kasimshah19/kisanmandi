import React from 'react';

/**
 * StepRate illustration: Transparent rating, building trust between farmer and buyer.
 */
export default function StepRate({ className = 'w-24 h-24' }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="54" fill="#fefce8" />
      <ellipse cx="60" cy="98" rx="36" ry="6" fill="#fef08a" opacity="0.6" />

      {/* Review speech bubble */}
      <path
        d="M32 36 C32 30 37 26 44 26 H76 C83 26 88 30 88 36 V62 C88 68 83 72 76 72 H56 L42 82 V72 H44 C37 72 32 68 32 62 Z"
        fill="white"
        stroke="#15803d"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* 5-Star Row */}
      {/* Center big star */}
      <path
        d="M60 38 L62.5 44.5 H69 L64 48.5 L66 55 L60 51 L54 55 L56 48.5 L51 44.5 H57.5 Z"
        fill="#f59e0b"
        stroke="#d97706"
        strokeWidth="1"
      />
      {/* Left star */}
      <path
        d="M45 42 L46.8 46.5 H51 L47.5 49.5 L49 54 L45 51 L41 54 L42.5 49.5 L39 46.5 H43.2 Z"
        fill="#f59e0b"
        stroke="#d97706"
        strokeWidth="0.8"
      />
      {/* Right star */}
      <path
        d="M75 42 L76.8 46.5 H81 L77.5 49.5 L79 54 L75 51 L71 54 L72.5 49.5 L69 46.5 H73.2 Z"
        fill="#f59e0b"
        stroke="#d97706"
        strokeWidth="0.8"
      />

      {/* Friendly smile line inside bubble */}
      <path d="M52 64 Q60 70 68 64" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
