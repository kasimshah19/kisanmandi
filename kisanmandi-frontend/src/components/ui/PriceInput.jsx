import React from 'react';

/**
 * PriceInput: Farmer-friendly currency and price input.
 * Large touch target, clear Rupee symbol, decimal inputMode, plain-language validation and hints.
 */
export default function PriceInput({
  value,
  onChange,
  unit = 'kg',
  label = null,
  hint = null,
  error = null,
  placeholder = '0',
  id,
  name,
  disabled = false,
  className = '',
  required = false,
  ...props
}) {
  const handleChange = (e) => {
    const val = e.target.value;
    // Allow digits and up to one decimal point
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      onChange?.(val);
    }
  };

  const generatedId = React.useId();
  const inputId = id || (name ? `price-input-${name}` : `price-input-${generatedId}`);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-stone-800 mb-1.5"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        className={`
          relative flex items-center rounded-2xl border-2 bg-white transition-all
          ${
            error
              ? 'border-red-400 focus-within:border-red-600 focus-within:ring-2 focus-within:ring-red-100'
              : 'border-stone-200 focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-100'
          }
          ${disabled ? 'opacity-50 bg-stone-50 cursor-not-allowed' : ''}
        `}
      >
        {/* Rupee Prefix Badge */}
        <span
          className="pl-4 pr-2 text-2xl font-bold text-stone-800 select-none flex items-center"
          aria-hidden="true"
        >
          ₹
        </span>

        {/* Big Input */}
        <input
          id={inputId}
          name={name}
          type="text"
          inputMode="decimal"
          value={value ?? ''}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="w-full min-h-[56px] py-3 pr-3 text-2xl font-extrabold text-stone-900 bg-transparent tabular-nums outline-none placeholder:text-stone-300"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error
              ? `${inputId}-error`
              : hint
              ? `${inputId}-hint`
              : undefined
          }
          {...props}
        />

        {/* Per-unit badge */}
        {unit && (
          <span className="pr-4 text-stone-500 font-medium text-sm select-none shrink-0">
            / {unit}
          </span>
        )}
      </div>

      {/* Validation message or hint */}
      {error ? (
        <p
          id={`${inputId}-error`}
          className="mt-1.5 text-sm text-red-600 font-medium flex items-center gap-1"
          role="alert"
        >
          {error}
        </p>
      ) : hint ? (
        <p
          id={`${inputId}-hint`}
          className="mt-1.5 text-xs sm:text-sm text-stone-500 leading-normal"
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}
