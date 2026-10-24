import React from 'react';
import { Check } from 'lucide-react';

/**
 * Stepper: Clear multi-step progress indicator for stepped workflows (Checkout, Onboarding, Listing produce).
 * Compact "Step X of Y" header on mobile with progress bar; expanded labeled indicators on tablet/desktop.
 */
export default function Stepper({
  steps = [],
  currentStep = 0, // 0-indexed
  className = '',
  stepLabel = 'Step',
  ofLabel = 'of',
}) {
  const total = steps.length;
  const activeIndex = Math.min(Math.max(currentStep, 0), total - 1);
  const currentStepObj = steps[activeIndex] || {};
  const currentTitle = typeof currentStepObj === 'string' ? currentStepObj : currentStepObj.label;

  return (
    <div className={`w-full ${className}`}>
      {/* Mobile view (< sm) */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between text-sm font-semibold text-stone-700 mb-2">
          <span>
            {stepLabel} {activeIndex + 1} {ofLabel} {total}
          </span>
          {currentTitle && (
            <span className="text-stone-900 font-bold truncate max-w-[180px]">
              {currentTitle}
            </span>
          )}
        </div>
        {/* Progress bar line */}
        <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-green-600 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${((activeIndex + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Tablet & Desktop view (sm+) */}
      <div className="hidden sm:flex items-center justify-between relative">
        {/* Connecting background line */}
        <div
          className="absolute top-5 left-6 right-6 h-1 bg-stone-200 -z-0"
          aria-hidden="true"
        >
          <div
            className="bg-green-600 h-full transition-all duration-300 ease-out"
            style={{
              width: total > 1 ? `${(activeIndex / (total - 1)) * 100}%` : '100%',
            }}
          />
        </div>

        {steps.map((step, idx) => {
          const isDone = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const label = typeof step === 'string' ? step : step.label;
          const Icon = typeof step === 'object' ? step.icon : null;

          return (
            <div
              key={idx}
              className="relative z-10 flex flex-col items-center flex-1 text-center"
            >
              {/* Step circle indicator */}
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all
                  ${
                    isDone
                      ? 'bg-green-700 text-white shadow-xs'
                      : isCurrent
                      ? 'bg-white border-3 border-green-600 text-green-700 shadow-sm ring-4 ring-green-100'
                      : 'bg-white border-2 border-stone-300 text-stone-500'
                  }
                `}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isDone ? (
                  <Check className="w-5 h-5 stroke-[3]" />
                ) : Icon ? (
                  Icon
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              {/* Step label */}
              {label && (
                <span
                  className={`mt-2 text-xs font-semibold max-w-[120px] truncate ${
                    isCurrent
                      ? 'text-stone-900 font-bold'
                      : isDone
                      ? 'text-green-800'
                      : 'text-stone-500'
                  }`}
                >
                  {label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
