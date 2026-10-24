import React from 'react';

/**
 * HeroFarmScene - Warm rural farm landscape illustration
 * Features morning sun, green terrace hills, agricultural field rows, crop basket, and farm hut.
 * Original inline vector artwork (< 5 KB, scalable, accessible).
 */
export default function HeroFarmScene({ className = 'w-full h-auto', ...props }) {
  return (
    <svg
      viewBox="0 0 600 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <defs>
        {/* Sky gradient */}
        <linearGradient id="skyGrad" x1="300" y1="0" x2="300" y2="240" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fef3c7" stopOpacity="0.8" />
          <stop offset="0.4" stopColor="#e0f2fe" stopOpacity="0.9" />
          <stop offset="1" stopColor="#f0fdf4" />
        </linearGradient>

        {/* Golden morning sun gradient */}
        <radialGradient id="sunGrad" cx="0.5" cy="0.5" r="0.5">
          <stop stopColor="#fde047" />
          <stop offset="0.7" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>

        {/* Distant rolling hills */}
        <linearGradient id="distantHillGrad" x1="0" y1="120" x2="600" y2="240" gradientUnits="userSpaceOnUse">
          <stop stopColor="#bbf7d0" />
          <stop offset="1" stopColor="#86efac" />
        </linearGradient>

        {/* Foreground lush agricultural hills */}
        <linearGradient id="foreHillGrad" x1="0" y1="180" x2="600" y2="360" gradientUnits="userSpaceOnUse">
          <stop stopColor="#15803d" />
          <stop offset="0.5" stopColor="#166534" />
          <stop offset="1" stopColor="#14532d" />
        </linearGradient>

        {/* Field furrow pattern */}
        <linearGradient id="fieldRowGrad" x1="180" y1="240" x2="420" y2="360" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4ade80" stopOpacity="0.4" />
          <stop offset="1" stopColor="#15803d" stopOpacity="0.1" />
        </linearGradient>

        {/* Hut roof terracotta gradient */}
        <linearGradient id="roofGrad" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ea580c" />
          <stop offset="1" stopColor="#c2410c" />
        </linearGradient>
      </defs>

      {/* Sky backdrop */}
      <rect width="600" height="360" rx="24" fill="url(#skyGrad)" />

      {/* Rising morning sun */}
      <circle cx="480" cy="90" r="50" fill="url(#sunGrad)" />
      <circle cx="480" cy="90" r="28" fill="#fef08a" />

      {/* Distant misty hills */}
      <path
        d="M-40 220 Q 120 130 280 180 T 640 160 L 640 360 L -40 360 Z"
        fill="url(#distantHillGrad)"
        opacity="0.85"
      />

      {/* Midground agricultural terraces */}
      <path
        d="M-20 250 Q 150 190 320 230 T 620 210 L 620 360 L -20 360 Z"
        fill="#22c55e"
        opacity="0.6"
      />

      {/* Main fertile field contours */}
      <path
        d="M-10 270 Q 180 230 380 270 T 620 260 L 620 360 L -10 360 Z"
        fill="url(#foreHillGrad)"
      />

      {/* Field furrow rows indicating cultivation */}
      <path d="M120 360 L240 250" stroke="#86efac" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.6" />
      <path d="M190 360 L290 255" stroke="#86efac" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.6" />
      <path d="M270 360 L345 260" stroke="#86efac" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.6" />
      <path d="M350 360 L400 265" stroke="#86efac" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.6" />

      {/* Farmer's Country Hut */}
      <g transform="translate(430, 200)">
        {/* Hut Walls */}
        <rect x="15" y="32" width="60" height="38" rx="3" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
        {/* Doorway */}
        <rect x="36" y="44" width="18" height="26" rx="2" fill="#78350f" />
        {/* Thatched/Tile Roof */}
        <polygon points="45,8 5,34 85,34" fill="url(#roofGrad)" />
        {/* Small window */}
        <rect x="20" y="40" width="10" height="10" rx="1.5" fill="#fde68a" stroke="#d97706" strokeWidth="1" />
      </g>

      {/* Coconut / Palm trees on field edge */}
      <g transform="translate(100, 160)">
        {/* Trunk */}
        <path d="M25 90 Q 30 45 20 15" stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" />
        {/* Fronds */}
        <path d="M20 15 Q -5 5 -15 25" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M20 15 Q 15 -10 10 -20" stroke="#15803d" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M20 15 Q 40 -5 55 10" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M20 15 Q 45 25 50 38" stroke="#15803d" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>

      {/* Fresh harvest wicker basket in foreground */}
      <g transform="translate(60, 260)">
        {/* Wicker basket body */}
        <path
          d="M10 32 L16 68 Q 45 74 74 68 L80 32 Z"
          fill="#d97706"
          stroke="#92400e"
          strokeWidth="2"
        />
        {/* Basket rim */}
        <ellipse cx="45" cy="32" rx="36" ry="7" fill="#b45309" stroke="#78350f" strokeWidth="2" />
        {/* Fresh harvest produce spilling over */}
        {/* Ripe tomato */}
        <circle cx="34" cy="24" r="12" fill="#ef4444" />
        <path d="M34 12 Q 35 15 37 17 M34 12 Q 32 15 30 17" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
        {/* Golden wheat/grain stalks */}
        <path d="M48 28 Q 58 10 65 -5" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="63" cy="2" rx="3.5" ry="5" fill="#fbbf24" transform="rotate(25 63 2)" />
        <ellipse cx="58" cy="10" rx="3.5" ry="5" fill="#fcd34d" transform="rotate(20 58 10)" />
        {/* Green bell pepper / gourd */}
        <circle cx="52" cy="26" r="11" fill="#16a34a" />
      </g>
    </svg>
  );
}
