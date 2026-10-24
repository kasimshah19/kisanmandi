import React from 'react';

export default function NoReviews({ className = 'w-36 h-36' }) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="80" cy="80" r="70" fill="#fefce8" />
      <ellipse cx="80" cy="126" rx="42" ry="8" fill="#fef08a" opacity="0.6" />
      {/* Speech bubble */}
      <path
        d="M42 46C42 38.268 48.268 32 56 32H104C111.732 32 118 38.268 118 46V84C118 91.732 111.732 98 104 98H78L56 112V98H56C48.268 98 42 91.732 42 84V46Z"
        fill="white"
        stroke="#15803d"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Star */}
      <path
        d="M80 50L84 60H94L86 66L89 76L80 70L71 76L74 66L66 60H76L80 50Z"
        fill="#f59e0b"
        stroke="#d97706"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
