import React from 'react';

export default function Badge({
  tone = 'green',
  size = 'md',
  className = '',
  icon = null,
  children,
  ...props
}) {
  const tones = {
    green: 'bg-green-100 text-green-800 border-green-200',
    yellow: 'bg-amber-100 text-amber-900 border-amber-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-medium',
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full border
        ${tones[tone] || tones.green}
        ${sizes[size] || sizes.md}
        ${className}
      `.trim()}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
