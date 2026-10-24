import React from 'react';

/**
 * StepOrder illustration: Order placed directly with farmer.
 */
export default function StepOrder({ className = 'w-24 h-24' }) {
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

      {/* Shopping bag */}
      <rect
        x="36"
        y="42"
        width="48"
        height="52"
        rx="8"
        fill="white"
        stroke="#15803d"
        strokeWidth="2.5"
      />
      <path
        d="M48 42 V34 C48 27.5 53.5 22 60 22 C66.5 22 72 27.5 72 34 V42"
        stroke="#15803d"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Bag details */}
      <circle cx="60" cy="64" r="14" fill="#dcfce7" />
      {/* Checkmark */}
      <path
        d="M54 64 L58 68 L67 59"
        stroke="#15803d"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Rupee coin badge */}
      <circle cx="86" cy="82" r="14" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
      <text
        x="86"
        y="87"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill="#b45309"
        fontFamily="sans-serif"
      >
        ₹
      </text>
    </svg>
  );
}
