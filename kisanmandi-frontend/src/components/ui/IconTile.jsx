import React from 'react';

export default function IconTile({
  icon: Icon,
  tone = 'green',
  size = 'md',
  className = '',
}) {
  const tones = {
    green: 'bg-green-100/80 text-green-700 border-green-200/60',
    amber: 'bg-amber-100/80 text-amber-700 border-amber-200/60',
    blue: 'bg-blue-100/80 text-blue-700 border-blue-200/60',
    red: 'bg-red-100/80 text-red-700 border-red-200/60',
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const sizes = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-12 h-12 rounded-xl',
    lg: 'w-14 h-14 rounded-2xl',
  };

  const iconSizes = {
    sm: 16,
    md: 22,
    lg: 26,
  };

  return (
    <div
      className={`
        inline-flex items-center justify-center shrink-0 border
        ${tones[tone] || tones.green}
        ${sizes[size] || sizes.md}
        ${className}
      `.trim()}
      aria-hidden="true"
    >
      {Icon && (
        React.isValidElement(Icon) ? Icon : <Icon size={iconSizes[size] || 22} />
      )}
    </div>
  );
}
