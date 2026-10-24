import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, Info } from 'lucide-react';

/**
 * StatusPill: Clear semantic status badges for low-literacy users.
 * Combines an explicit icon, high-contrast readable text, and standardized tone.
 * Tones: success (green), waiting (amber), problem (red), info (sky blue).
 */
export default function StatusPill({
  tone = 'info',
  label,
  icon = null,
  size = 'md',
  className = '',
}) {
  const toneConfigs = {
    success: {
      bg: 'bg-emerald-50 text-emerald-900 border-emerald-200/80',
      iconColor: 'text-emerald-700',
      DefaultIcon: CheckCircle2,
    },
    waiting: {
      bg: 'bg-amber-50 text-amber-950 border-amber-200/80',
      iconColor: 'text-amber-700',
      DefaultIcon: Clock,
    },
    problem: {
      bg: 'bg-rose-50 text-rose-950 border-rose-200/80',
      iconColor: 'text-rose-700',
      DefaultIcon: AlertTriangle,
    },
    info: {
      bg: 'bg-sky-50 text-sky-950 border-sky-200/80',
      iconColor: 'text-sky-700',
      DefaultIcon: Info,
    },
  };

  const config = toneConfigs[tone] || toneConfigs.info;
  const ActiveIcon = icon || <config.DefaultIcon className="shrink-0 stroke-[2.5]" />;

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5 [&_svg]:w-3.5 [&_svg]:h-3.5 font-semibold',
    md: 'text-sm px-3.5 py-1.5 gap-2 [&_svg]:w-4 [&_svg]:h-4 font-bold',
    lg: 'text-base px-4 py-2 gap-2.5 [&_svg]:w-5 [&_svg]:h-5 font-extrabold',
  }[size] || 'text-sm px-3.5 py-1.5 gap-2 [&_svg]:w-4 [&_svg]:h-4 font-bold';

  return (
    <span
      role="status"
      className={`
        inline-flex items-center rounded-full border shadow-2xs select-none
        ${config.bg} ${sizeClasses} ${className}
      `.trim()}
    >
      <span className={config.iconColor} aria-hidden="true">
        {ActiveIcon}
      </span>
      <span>{label}</span>
    </span>
  );
}
