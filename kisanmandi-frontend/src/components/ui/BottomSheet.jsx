import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * BottomSheet: Mobile-friendly bottom drawer with desktop modal fallback.
 * Features focus trapping, Escape handling, body scroll locking, and safe-area padding.
 */
export default function BottomSheet({
  isOpen = false,
  onClose,
  title = null,
  children,
  className = '',
  ariaLabel = 'Dialog',
}) {
  const sheetRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Lock body scroll & save active element
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      document.body.style.overflow = 'hidden';

      // Focus first focusable inside sheet
      setTimeout(() => {
        const focusable = sheetRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable && focusable.length > 0) {
          focusable[0].focus();
        }
      }, 50);
    } else {
      document.body.style.overflow = '';
      if (previousActiveElement.current) {
        previousActiveElement.current.focus?.();
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle Escape key and Tab focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
        return;
      }

      if (e.key === 'Tab') {
        const focusable = sheetRef.current?.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={title || ariaLabel}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet / Modal Container */}
      <div
        ref={sheetRef}
        className={`
          relative z-10 w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-pop
          border border-stone-200/80 max-h-[90vh] flex flex-col overflow-hidden
          pb-[env(safe-area-inset-bottom,16px)] animate-in fade-in-0 slide-in-from-bottom-6 duration-200
          ${className}
        `}
      >
        {/* Drag handle pill on mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-stone-300" aria-hidden="true" />
        </div>

        {/* Sheet Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="text-lg sm:text-xl font-bold text-stone-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-800 hover:bg-stone-100 active:bg-stone-200 transition-colors focus-visible:ring-2 focus-visible:ring-green-600 outline-none"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Sheet Content with scroll */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}
