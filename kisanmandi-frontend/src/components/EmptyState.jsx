import React from 'react';
import { PackageOpen } from 'lucide-react';

/**
 * EmptyState
 * Displays a friendly empty state with an optional custom SVG illustration or Lucide icon.
 *
 * @param {React.ComponentType} [illustration] - Custom SVG illustration component
 * @param {React.ComponentType} [icon] - Fallback icon component (defaults to PackageOpen)
 * @param {string} title - Heading text
 * @param {string} [message] - Supportive explanatory message
 * @param {React.ReactNode} [action] - Call to action button or link
 * @param {string} [className] - Optional custom container classes
 */
export default function EmptyState({
  illustration: Illustration,
  icon: Icon = PackageOpen,
  title,
  message,
  action,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center max-w-md mx-auto ${className}`}
    >
      {/* Visual illustration or icon container */}
      {Illustration ? (
        <div className="mb-5 animate-fade-in">
          <Illustration className="w-32 h-32 sm:w-36 sm:h-36 mx-auto" />
        </div>
      ) : (
        <div className="w-16 h-16 rounded-2xl bg-green-50 text-brand-700 flex items-center justify-center mb-4 shadow-2xs border border-green-100">
          <Icon size={32} className="shrink-0" />
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-1.5 tracking-tight">
        {title}
      </h3>

      {/* Description */}
      {message && (
        <p className="text-sm text-neutral-600 mb-5 leading-relaxed max-w-sm">
          {message}
        </p>
      )}

      {/* Action button */}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
