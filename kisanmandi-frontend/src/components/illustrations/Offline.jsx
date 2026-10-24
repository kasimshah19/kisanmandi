import React from 'react';

/**
 * Offline illustration: Low-connectivity or offline state, reassuring the farmer.
 */
export default function Offline({ className = 'w-36 h-36' }) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="80" cy="80" r="70" fill="#fef2f2" />
      <ellipse cx="80" cy="126" rx="46" ry="8" fill="#fee2e2" />

      {/* Cloud with slash / disconnected Wi-Fi waves */}
      <path
        d="M50 82 C42 82 36 75 36 67 C36 60 41 54 48 53 C51 42 61 35 72 35 C84 35 93 43 95 53 C102 54 108 60 108 68 C108 76 101 82 93 82 Z"
        fill="white"
        stroke="#dc2626"
        strokeWidth="2.5"
      />

      {/* Disconnect indicator */}
      <circle cx="72" cy="62" r="4" fill="#dc2626" />
      <path d="M60 52 Q72 44 84 52" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />

      {/* Red diagonal strike */}
      <line x1="42" y1="92" x2="102" y2="38" stroke="#b91c1c" strokeWidth="3" strokeLinecap="round" />

      {/* Ground sprout waiting for rain/signal */}
      <path d="M80 120 V110" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />
      <path d="M80 112 Q86 106 90 110 Q88 116 80 114" fill="#22c55e" />
    </svg>
  );
}
