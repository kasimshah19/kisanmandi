import React from 'react';

/**
 * ServerSleeping illustration: Free-tier spin-up or server waking up gracefully.
 */
export default function ServerSleeping({ className = 'w-36 h-36' }) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="80" cy="80" r="70" fill="#f0fdf4" />
      <ellipse cx="80" cy="126" rx="46" ry="8" fill="#dcfce7" />

      {/* Cloud & Moon / Night rest */}
      <circle cx="112" cy="48" r="14" fill="#fef08a" opacity="0.8" />
      <circle cx="108" cy="44" r="12" fill="#f0fdf4" />

      {/* Sleeping Cloud */}
      <path
        d="M50 85 C42 85 36 78 36 70 C36 63 41 57 48 56 C51 45 61 38 72 38 C84 38 93 46 95 56 C102 57 108 63 108 71 C108 79 101 85 93 85 Z"
        fill="white"
        stroke="#15803d"
        strokeWidth="2.5"
      />

      {/* Sleeping face on cloud */}
      {/* Eyes closed */}
      <path d="M56 68 Q61 72 66 68" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
      <path d="M78 68 Q83 72 88 68" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
      {/* Cute smile */}
      <path d="M70 76 Q72 79 74 76" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />

      {/* Zzz floating up */}
      <text x="100" y="38" fontSize="16" fontWeight="bold" fill="#0284c7" fontFamily="sans-serif">
        Z
      </text>
      <text x="114" y="26" fontSize="12" fontWeight="bold" fill="#38bdf8" fontFamily="sans-serif">
        z
      </text>
      <text x="124" y="16" fontSize="10" fontWeight="bold" fill="#7dd3fc" fontFamily="sans-serif">
        z
      </text>

      {/* Sprout below */}
      <path d="M80 118 V104" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
      <path d="M80 108 Q86 102 90 106 Q88 112 80 110" fill="#22c55e" />
      <path d="M80 112 Q74 106 70 110 Q72 116 80 114" fill="#86efac" />
    </svg>
  );
}
