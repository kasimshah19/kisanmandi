import React from 'react';

/**
 * Card primitive v2
 * Variants: default, soft (tinted), elevated, outline, glass (hero)
 */
export default function Card({
  as: Component = 'div',
  variant = 'default',
  className = '',
  hover = true,
  children,
  ...props
}) {
  const variantStyles = {
    default: 'bg-white border border-gray-200/80 shadow-card',
    soft: 'bg-emerald-50/60 border border-emerald-200/70 shadow-xs text-stone-900',
    elevated: 'bg-white border border-gray-100 shadow-raised',
    outline: 'bg-white border-2 border-gray-200 shadow-none',
    glass: 'bg-white/85 backdrop-blur-xs border border-white/60 shadow-card',
  };

  return (
    <Component
      className={`
        rounded-2xl p-6 transition-all duration-200
        ${variantStyles[variant] || variantStyles.default}
        ${hover ? 'hover:shadow-card-hover hover:-translate-y-0.5' : ''}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </Component>
  );
}
