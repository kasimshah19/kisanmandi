import React from 'react';
import { Check } from 'lucide-react';

/**
 * BigChoice: Large selectable card for high-confidence decisions (role choice, payment method, delivery mode).
 * Features radio semantics, keyboard navigation (Space/Enter), and large tap targets.
 */
export default function BigChoice({
  selected = false,
  onSelect,
  icon = null,
  title,
  description = null,
  badge = null,
  disabled = false,
  className = '',
  id,
  name,
}) {
  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onSelect?.();
    }
  };

  return (
    <div
      role="radio"
      aria-checked={selected}
      aria-disabled={disabled ? 'true' : undefined}
      tabIndex={disabled ? -1 : 0}
      id={id}
      data-name={name}
      onClick={() => !disabled && onSelect?.()}
      onKeyDown={handleKeyDown}
      className={`
        relative flex items-center justify-between p-4 sm:p-5 rounded-2xl cursor-pointer select-none
        border-2 transition-all duration-200 outline-none
        focus-visible:ring-3 focus-visible:ring-green-600 focus-visible:ring-offset-2
        ${disabled ? 'opacity-50 cursor-not-allowed bg-stone-50 border-stone-200' : ''}
        ${
          selected
            ? 'bg-emerald-50/70 border-green-600 shadow-sm'
            : 'bg-white border-stone-200 hover:border-green-300 hover:bg-stone-50/50'
        }
        ${className}
      `.trim()}
    >
      <div className="flex items-center gap-4 min-w-0 pr-3">
        {icon && (
          <div
            className={`
              w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-2xl
              ${selected ? 'bg-green-600 text-white' : 'bg-stone-100 text-stone-700'}
            `}
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-snug">
              {title}
            </h3>
            {badge && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-stone-600 font-normal mt-0.5 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Large checkmark radio indicator */}
      <div
        className={`
          w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
          ${
            selected
              ? 'bg-green-600 border-green-600 text-white'
              : 'border-stone-300 bg-white'
          }
        `}
        aria-hidden="true"
      >
        {selected && <Check className="w-4 h-4 stroke-[3]" />}
      </div>
    </div>
  );
}
