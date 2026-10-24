import React, { useId } from 'react';

export function FormField({
  label,
  required = false,
  hint = null,
  error = null,
  id: customId,
  children,
  className = '',
}) {
  const generatedId = useId();
  const fieldId = customId || generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500" aria-hidden="true">*</span>}
        </label>
      )}

      {/* Clone child to attach id and aria-describedby automatically if valid element */}
      {React.isValidElement(children)
        ? React.cloneElement(children, {
            id: children.props.id || fieldId,
            'aria-describedby': children.props['aria-describedby'] || describedBy,
            'aria-invalid': error ? 'true' : undefined,
          })
        : children}

      {hint && !error && (
        <p id={hintId} className="text-xs text-gray-500">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export const Input = React.forwardRef(function Input(
  { className = '', type = 'text', hasError = false, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      type={type}
      className={`
        w-full px-3.5 py-3 rounded-xl border bg-white text-gray-900 text-base sm:text-sm
        placeholder:text-gray-400 outline-none transition-colors duration-150 min-h-[48px]
        ${
          hasError
            ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-100'
            : 'border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-100'
        }
        disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
        ${className}
      `.trim()}
      {...props}
    />
  );
});

export const Select = React.forwardRef(function Select(
  { className = '', hasError = false, children, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      className={`
        w-full px-3.5 py-3 rounded-xl border bg-white text-gray-900 text-base sm:text-sm
        outline-none transition-colors duration-150 min-h-[48px]
        ${
          hasError
            ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-100'
            : 'border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-100'
        }
        disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </select>
  );
});

export const Textarea = React.forwardRef(function Textarea(
  { className = '', hasError = false, rows = 3, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={`
        w-full px-3.5 py-2.5 rounded-xl border bg-white text-gray-900 text-sm
        placeholder:text-gray-400 outline-none transition-colors duration-150
        ${
          hasError
            ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-100'
            : 'border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-100'
        }
        disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
        ${className}
      `.trim()}
      {...props}
    />
  );
});

export default FormField;

