import React from 'react';

/**
 * StepSell illustration: Farmer listing produce and selling directly.
 */
export default function StepSell({ className = 'w-24 h-24' }) {
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

      {/* Sprout & sun background */}
      <circle cx="86" cy="34" r="10" fill="#fde047" opacity="0.8" />

      {/* Hand holding plant / crop */}
      {/* Wooden crate */}
      <rect x="34" y="58" width="52" height="32" rx="4" fill="#b45309" stroke="#78350f" strokeWidth="2" />
      <line x1="34" y1="68" x2="86" y2="68" stroke="#d97706" strokeWidth="2" />
      <line x1="34" y1="78" x2="86" y2="78" stroke="#d97706" strokeWidth="2" />

      {/* Fresh harvest inside crate */}
      <circle cx="46" cy="52" r="9" fill="#ef4444" stroke="#b91c1c" strokeWidth="1.5" />
      <circle cx="60" cy="50" r="10" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" />
      <circle cx="74" cy="52" r="9" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />

      {/* Price tag badge */}
      <g transform="translate(68, 26)">
        <rect width="32" height="18" rx="9" fill="#15803d" />
        <text
          x="16"
          y="13"
          textAnchor="middle"
          fontSize="10"
          fontWeight="bold"
          fill="#ffffff"
          fontFamily="sans-serif"
        >
          0% FEE
        </text>
      </g>
    </svg>
  );
}
