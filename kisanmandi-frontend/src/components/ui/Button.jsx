import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  fullWidth = false,
  className = '',
  children,
  to,
  href,
  type = 'button',
  ...props
}) {
  // If `to` is passed, automatically render as React Router Link
  const RenderComponent = to ? Link : (href ? 'a' : Component);

  // Variant styling
  const variantStyles = {
    primary:
      'bg-green-700 hover:bg-green-800 active:bg-green-900 text-white shadow-xs focus-visible:ring-green-600',
    secondary:
      'bg-green-50 hover:bg-green-100 active:bg-green-200 text-green-900 border border-green-200 focus-visible:ring-green-600',
    outline:
      'bg-white hover:bg-green-50 active:bg-green-100 text-gray-800 border border-gray-300 hover:border-green-300 focus-visible:ring-green-600',
    ghost:
      'bg-transparent hover:bg-gray-100 active:bg-gray-200 text-gray-700 hover:text-gray-900 focus-visible:ring-gray-400',
    danger:
      'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-xs focus-visible:ring-red-600',
    harvest:
      'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-gray-950 font-semibold shadow-xs focus-visible:ring-amber-500',
  };

  // Size styling (md and lg ensure minimum 44px tap targets)
  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-lg min-h-[36px] gap-1.5',
    md: 'text-sm px-4 py-2.5 rounded-xl min-h-[44px] gap-2',
    lg: 'text-base px-6 py-3.5 rounded-xl min-h-[48px] gap-2.5 font-semibold',
  };

  const isDisabled = disabled || loading;

  const combinedClasses = `
    inline-flex items-center justify-center font-medium transition-all duration-150
    select-none outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
    ${fullWidth ? 'w-full' : ''}
    ${variantStyles[variant] || variantStyles.primary}
    ${sizeStyles[size] || sizeStyles.md}
    ${className}
  `.trim();

  const buttonProps = RenderComponent === 'button' ? { type, disabled: isDisabled } : {};

  return (
    <RenderComponent
      className={combinedClasses}
      to={to}
      href={href}
      aria-busy={loading ? 'true' : undefined}
      aria-disabled={isDisabled ? 'true' : undefined}
      {...buttonProps}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </RenderComponent>
  );
}
