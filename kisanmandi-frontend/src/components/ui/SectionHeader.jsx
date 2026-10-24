import React from 'react';

export default function SectionHeader({
  eyebrow = null,
  title,
  subtitle = null,
  action = null,
  align = 'left',
  className = '',
}) {
  const isCentered = align === 'center';

  return (
    <div
      className={`
        flex flex-col md:flex-row justify-between
        ${isCentered ? 'items-center text-center' : 'items-start md:items-end text-left'}
        gap-4 mb-8 md:mb-12
        ${className}
      `.trim()}
    >
      <div className={`space-y-2 ${isCentered ? 'max-w-2xl mx-auto' : 'max-w-2xl'}`}>
        {eyebrow && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold uppercase tracking-wider">
            {eyebrow}
          </div>
        )}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
