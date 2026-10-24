import React from 'react';
import { Minus, Plus } from 'lucide-react';

/**
 * NumberStepper: Farmer-friendly quantity selector with generous 56px touch buttons.
 * Supports direct typing, decimal/integer steps, min/max clamping, and aria-live announcements.
 */
export default function NumberStepper({
  value = 1,
  onChange,
  min = 1,
  max = 9999,
  step = 1,
  unit = 'kg',
  disabled = false,
  id,
  name,
  ariaLabel = 'Quantity',
  className = '',
}) {
  const currentVal = Number(value) || 0;

  const clamp = (val) => {
    let num = Number(val);
    if (isNaN(num)) num = min;
    if (num < min) num = min;
    if (num > max) num = max;
    // Round to avoid floating point precision issues
    const precision = step.toString().split('.')[1]?.length || 0;
    return Number(num.toFixed(precision));
  };

  const handleDecrement = () => {
    if (disabled || currentVal <= min) return;
    onChange?.(clamp(currentVal - step));
  };

  const handleIncrement = () => {
    if (disabled || currentVal >= max) return;
    onChange?.(clamp(currentVal + step));
  };

  const handleInputChange = (e) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange?.('');
      return;
    }
    const num = parseFloat(raw);
    if (!isNaN(num)) {
      onChange?.(num);
    }
  };

  const handleBlur = () => {
    onChange?.(clamp(currentVal));
  };

  const isMin = currentVal <= min;
  const isMax = currentVal >= max;

  return (
    <div
      className={`inline-flex items-center justify-between bg-stone-50 border-2 border-stone-200 rounded-2xl p-1 select-none ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      } ${className}`}
    >
      {/* Big Minus Button (56px) */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || isMin}
        aria-label={`Decrease ${ariaLabel}`}
        className="w-14 h-14 min-w-[56px] min-h-[56px] rounded-xl flex items-center justify-center bg-white border border-stone-200 text-stone-800 hover:bg-stone-100 active:bg-stone-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-green-600 outline-none"
      >
        <Minus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Middle value & unit display + typing */}
      <div className="flex-1 min-w-[90px] px-2 text-center">
        <div className="flex items-baseline justify-center gap-1">
          <input
            id={id}
            name={name}
            type="text"
            inputMode="decimal"
            value={value}
            onChange={handleInputChange}
            onBlur={handleBlur}
            disabled={disabled}
            aria-label={ariaLabel}
            className="w-20 text-center font-extrabold text-2xl text-stone-900 bg-transparent tabular-nums outline-none focus:border-b-2 focus:border-green-600"
          />
          {unit && (
            <span className="text-sm font-semibold text-stone-600 shrink-0">
              {unit}
            </span>
          )}
        </div>
        {/* Screen-reader announcement */}
        <span className="sr-only" aria-live="polite">
          {currentVal} {unit}
        </span>
      </div>

      {/* Big Plus Button (56px) */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || isMax}
        aria-label={`Increase ${ariaLabel}`}
        className="w-14 h-14 min-w-[56px] min-h-[56px] rounded-xl flex items-center justify-center bg-green-700 border border-green-800 text-white hover:bg-green-800 active:bg-green-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-green-600 outline-none shadow-xs"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>
    </div>
  );
}
