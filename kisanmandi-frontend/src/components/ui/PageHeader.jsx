import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * PageHeader
 * Accessible page title banner with structured breadcrumbs and optional action buttons.
 *
 * @param {Array<{ label: string, to?: string }>} breadcrumbs - List of breadcrumb links
 * @param {string} title - Page title (rendered as h1)
 * @param {string} [subtitle] - Optional descriptive subtitle
 * @param {React.ReactNode} [actions] - Optional action buttons (aligned right on desktop)
 * @param {string} [className] - Optional extra class names
 */
export default function PageHeader({
  breadcrumbs = [],
  title,
  subtitle,
  actions,
  className = '',
}) {
  return (
    <div className={`mb-6 sm:mb-8 ${className}`}>
      {/* Breadcrumb Navigation */}
      {breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2 sm:mb-3">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-neutral-500">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <li key={idx} className="inline-flex items-center gap-1.5">
                  {idx > 0 && (
                    <ChevronRight size={13} className="text-neutral-400 shrink-0" aria-hidden="true" />
                  )}
                  {crumb.to && !isLast ? (
                    <Link
                      to={crumb.to}
                      className="hover:text-brand-700 transition-colors font-medium rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className={`font-semibold ${isLast ? 'text-neutral-900' : 'text-neutral-600'}`}
                      aria-current={isLast ? 'page' : undefined}
                    >
                      {crumb.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {/* Title & Right Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm sm:text-base text-neutral-600 leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-start sm:self-center">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
