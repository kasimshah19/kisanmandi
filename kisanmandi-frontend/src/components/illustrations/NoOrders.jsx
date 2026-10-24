import React from 'react';

export default function NoOrders({ className = 'w-36 h-36' }) {
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
      {/* Shopping bag / receipt */}
      <rect x="48" y="52" width="64" height="74" rx="10" fill="white" stroke="#15803d" strokeWidth="3" />
      <path d="M64 52V42C64 33 71 28 80 28C89 28 96 33 96 42V52" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />
      {/* Receipt dashed lines */}
      <path d="M62 70H98" stroke="#86efac" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M62 82H88" stroke="#86efac" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M62 94H94" stroke="#86efac" strokeWidth="2.5" strokeLinecap="round" />
      {/* Badge / Sparkle */}
      <circle cx="106" cy="112" r="16" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2.5" />
      <path d="M106 104V120M98 112H114" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
