import React from 'react';

export default function Card({
  as: Component = 'div',
  className = '',
  hover = true,
  children,
  ...props
}) {
  return (
    <Component
      className={`
        bg-white rounded-2xl border border-gray-200/80 p-6
        shadow-card transition-all duration-200
        ${hover ? 'hover:shadow-card-hover hover:-translate-y-0.5' : ''}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </Component>
  );
}
