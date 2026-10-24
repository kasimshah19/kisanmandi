import React from 'react';

/**
 * StepDeliver illustration: Fast and safe direct delivery.
 */
export default function StepDeliver({ className = 'w-24 h-24' }) {
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

      {/* Speed lines */}
      <path d="M14 62 H26 M18 72 H28 M16 80 H24" stroke="#86efac" strokeWidth="2" strokeLinecap="round" />

      {/* Delivery Van Body */}
      {/* Cargo box */}
      <rect x="28" y="44" width="46" height="36" rx="4" fill="#15803d" />
      {/* Leaf icon on side */}
      <circle cx="51" cy="62" r="10" fill="#22c55e" />
      <path d="M51 56 Q57 60 55 68 Q47 68 47 62 Z" fill="#bbf7d0" />

      {/* Cabin */}
      <path
        d="M74 54 H86 L94 66 V80 H74 V54 Z"
        fill="#16a34a"
      />
      {/* Window */}
      <path
        d="M77 58 H84 L89 67 H77 V58 Z"
        fill="#e0f2fe"
      />

      {/* Bumper */}
      <rect x="94" y="73" width="6" height="7" rx="2" fill="#d97706" />

      {/* Wheels */}
      <circle cx="44" cy="80" r="10" fill="#334155" />
      <circle cx="44" cy="80" r="4" fill="#cbd5e1" />
      <circle cx="82" cy="80" r="10" fill="#334155" />
      <circle cx="82" cy="80" r="4" fill="#cbd5e1" />
    </svg>
  );
}
