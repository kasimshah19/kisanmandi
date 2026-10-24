import React from 'react';

/**
 * Handcrafted inline SVG agricultural illustrations for KisanMandi UI v2.
 * Zero external dependencies, pure vector art that renders instantly on low-end devices.
 */

export function FarmerDirectIllustration({ className = 'w-full h-auto max-w-[280px]' }) {
  return (
    <svg
      viewBox="0 0 320 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="160" cy="110" r="100" fill="#F0FDF4" />
      <ellipse cx="160" cy="190" rx="120" ry="20" fill="#DCFCE7" />

      {/* Sun / Warm dawn */}
      <circle cx="65" cy="55" r="28" fill="#FEF3C7" opacity="0.8" />
      <circle cx="65" cy="55" r="18" fill="#FDE68A" />

      {/* Farmer Figure */}
      <rect x="75" y="105" width="45" height="75" rx="12" fill="#15803D" />
      {/* Farmer head & turban */}
      <circle cx="97" cy="80" r="16" fill="#FCD34D" />
      <path d="M82 78 C82 66 112 66 112 78 Z" fill="#D97706" />
      {/* Farmer arms holding produce crate */}
      <path d="M78 120 L60 145 L135 145 L118 120" stroke="#166534" strokeWidth="6" strokeLinecap="round" />

      {/* Produce Crate */}
      <rect x="110" y="130" width="85" height="50" rx="8" fill="#B45309" />
      <rect x="115" y="135" width="75" height="8" rx="2" fill="#D97706" />
      <rect x="115" y="150" width="75" height="8" rx="2" fill="#D97706" />
      <rect x="115" y="165" width="75" height="8" rx="2" fill="#D97706" />

      {/* Fresh Vegetables inside Crate */}
      {/* Tomato */}
      <circle cx="130" cy="122" r="12" fill="#EF4444" />
      <path d="M130 110 L130 106 M127 108 L133 108" stroke="#15803D" strokeWidth="2.5" />
      {/* Carrot */}
      <path d="M148 112 L162 128 L152 130 Z" fill="#F97316" />
      <path d="M148 112 L144 106" stroke="#15803D" strokeWidth="2.5" />
      {/* Greens */}
      <circle cx="170" cy="120" r="13" fill="#22C55E" />
      <circle cx="180" cy="122" r="10" fill="#16A34A" />

      {/* Consumer Figure */}
      <rect x="200" y="110" width="42" height="70" rx="10" fill="#0284C7" />
      <circle cx="221" cy="82" r="15" fill="#FED7AA" />
      <path d="M210 70 C210 64 232 64 232 70" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
      {/* Reaching hands */}
      <path d="M205 130 L185 140" stroke="#0369A1" strokeWidth="5" strokeLinecap="round" />

      {/* Badge: 100% Direct */}
      <g transform="translate(130, 20)">
        <rect width="60" height="24" rx="12" fill="#16A34A" />
        <text x="30" y="16" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle">
          DIRECT
        </text>
      </g>
    </svg>
  );
}

export function MandiMarketIllustration({ className = 'w-full h-auto max-w-[280px]' }) {
  return (
    <svg
      viewBox="0 0 320 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="160" cy="110" r="95" fill="#FEF3C7" opacity="0.6" />
      <rect x="20" y="180" width="280" height="15" rx="7" fill="#E2E8F0" />

      {/* APMC Mandi Shed Structure */}
      <polygon points="40,90 160,35 280,90" fill="#15803D" />
      <rect x="55" y="90" width="12" height="90" fill="#CBD5E1" />
      <rect x="154" y="90" width="12" height="90" fill="#CBD5E1" />
      <rect x="253" y="90" width="12" height="90" fill="#CBD5E1" />

      {/* Official APMC Scale */}
      <g transform="translate(130, 100)">
        <rect x="27" y="10" width="6" height="60" fill="#64748B" />
        <line x1="5" y1="20" x2="55" y2="20" stroke="#334155" strokeWidth="4" />
        {/* Left pan */}
        <line x1="5" y1="20" x2="5" y2="45" stroke="#94A3B8" strokeWidth="2" />
        <ellipse cx="5" cy="45" rx="14" ry="4" fill="#64748B" />
        {/* Produce on scale */}
        <circle cx="5" cy="40" r="6" fill="#EF4444" />
        {/* Right pan with weights */}
        <line x1="55" y1="20" x2="55" y2="45" stroke="#94A3B8" strokeWidth="2" />
        <ellipse cx="55" cy="45" rx="14" ry="4" fill="#64748B" />
        <rect x="50" y="36" width="10" height="8" rx="1" fill="#475569" />
      </g>

      {/* Sacks of Grain (Wheat/Rice) */}
      <path d="M75 140 Q85 130 95 140 Q105 180 85 180 Q65 180 75 140 Z" fill="#D97706" />
      <path d="M90 145 Q100 135 110 145 Q120 180 100 180 Q80 180 90 145 Z" fill="#F59E0B" />
      <text x="85" y="165" fill="#78350F" fontSize="9" fontWeight="bold">
        100kg
      </text>

      {/* Fresh vegetable baskets */}
      <ellipse cx="230" cy="170" rx="24" ry="12" fill="#B45309" />
      <circle cx="225" cy="162" r="7" fill="#22C55E" />
      <circle cx="235" cy="160" r="8" fill="#EF4444" />
      <circle cx="242" cy="164" r="6" fill="#F97316" />

      {/* Verified Data Badge */}
      <g transform="translate(100, 192)">
        <rect width="120" height="20" rx="10" fill="#052E16" />
        <text x="60" y="14" fill="#86EFAC" fontSize="10" fontWeight="bold" textAnchor="middle">
          AGMARKNET LIVE
        </text>
      </g>
    </svg>
  );
}

export function CashOnDeliveryIllustration({ className = 'w-full h-auto max-w-[280px]' }) {
  return (
    <svg
      viewBox="0 0 320 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="160" cy="110" r="95" fill="#ECFDF5" />

      {/* Delivery Vehicle / Scooter */}
      <g transform="translate(60, 90)">
        <circle cx="35" cy="70" r="18" fill="#334155" />
        <circle cx="35" cy="70" r="8" fill="#E2E8F0" />
        <circle cx="120" cy="70" r="18" fill="#334155" />
        <circle cx="120" cy="70" r="8" fill="#E2E8F0" />

        <path d="M35 70 L65 50 L95 50 L120 70" stroke="#16A34A" strokeWidth="8" strokeLinecap="round" />
        <path d="M95 50 L105 25 L120 25" stroke="#166534" strokeWidth="5" strokeLinecap="round" />

        {/* Delivery Box */}
        <rect x="40" y="20" width="45" height="35" rx="6" fill="#D97706" />
        <path d="M40 32 L85 32" stroke="#B45309" strokeWidth="2.5" />
        <circle cx="62" cy="38" r="5" fill="#15803D" />
      </g>

      {/* Rupee Cash Note Handover */}
      <g transform="translate(190, 70)">
        <rect width="70" height="42" rx="6" fill="#22C55E" />
        <rect x="4" y="4" width="62" height="34" rx="4" fill="#16A34A" stroke="#86EFAC" strokeWidth="1.5" />
        <circle cx="35" cy="21" r="10" fill="#22C55E" />
        <text x="35" y="27" fill="#FFFFFF" fontSize="16" fontWeight="bold" textAnchor="middle">
          ₹
        </text>
      </g>

      {/* Label: 100% Cash on Delivery */}
      <g transform="translate(80, 185)">
        <rect width="160" height="26" rx="13" fill="#15803D" />
        <text x="80" y="17" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle">
          हाथ में सामान, तभी भुगतान
        </text>
      </g>
    </svg>
  );
}
