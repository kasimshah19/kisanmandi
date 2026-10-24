import React from 'react';

export default function EmptyBox({ className = 'w-36 h-36' }) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="80" cy="80" r="70" fill="#f0fdf4" />
      <ellipse cx="80" cy="125" rx="45" ry="10" fill="#dcfce7" />
      {/* Box base */}
      <path
        d="M36 68L80 92L124 68L80 44L36 68Z"
        fill="#bbf7d0"
        stroke="#15803d"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M36 68V106L80 130V92L36 68Z"
        fill="#86efac"
        stroke="#15803d"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M124 68V106L80 130V92L124 68Z"
        fill="#4ade80"
        stroke="#15803d"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Tape & Leaf accent */}
      <path
        d="M74 47L86 53V127L74 120V47Z"
        fill="#fef3c7"
        stroke="#f59e0b"
        strokeWidth="1.5"
      />
      <path
        d="M80 32C86 24 96 26 98 34C98 42 88 44 80 44C80 38 80 32 80 32Z"
        fill="#15803d"
      />
      <path
        d="M80 44C74 38 68 40 66 46C65 52 72 55 80 55"
        stroke="#15803d"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
