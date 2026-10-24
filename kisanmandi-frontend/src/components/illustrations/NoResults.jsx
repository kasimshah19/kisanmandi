import React from 'react';

export default function NoResults({ className = 'w-36 h-36' }) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="80" cy="80" r="70" fill="#f0fdf4" />
      <ellipse cx="80" cy="126" rx="42" ry="8" fill="#dcfce7" />
      {/* Soil furrow lines */}
      <path d="M42 118C58 114 78 114 118 118" stroke="#86efac" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M48 126C65 123 90 123 112 126" stroke="#86efac" strokeWidth="2" strokeLinecap="round" />
      {/* Sprout */}
      <path d="M68 110C68 96 66 84 64 80" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />
      <path d="M64 86C56 82 54 74 60 70C66 66 70 76 64 86Z" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
      {/* Magnifying Glass */}
      <circle cx="94" cy="68" r="30" fill="white" stroke="#15803d" strokeWidth="4" />
      <circle cx="94" cy="68" r="24" fill="#f0fdf4" />
      <path d="M86 64C86 58 91 54 98 54" stroke="#86efac" strokeWidth="2.5" strokeLinecap="round" />
      {/* Handle */}
      <path d="M115 89L135 109" stroke="#14532d" strokeWidth="7" strokeLinecap="round" />
      <path d="M115 89L135 109" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
