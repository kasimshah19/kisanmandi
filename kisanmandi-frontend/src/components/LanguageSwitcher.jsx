import React, { useState, useRef, useEffect, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { LANGUAGES } from '../utils/languages';

export default function LanguageSwitcher({ variant = 'dropdown', className = '' }) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const menuId = useId();
  const triggerId = useId();

  // Resolved current language code ('en', 'hi', or 'mr')
  const currentLangCode = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
  const currentLang = LANGUAGES.find((l) => l.code === currentLangCode) || LANGUAGES[0];

  // State for dropdown variant
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const optionsRef = useRef([]);

  // Change language and persist
  const handleSelectLanguage = (code) => {
    i18n.changeLanguage(code);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('kisanmandi_lang', code);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = code;
    }
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  // Close dropdown on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Keep focused option in sync when focusedIndex changes
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && optionsRef.current[focusedIndex]) {
      optionsRef.current[focusedIndex].focus();
    }
  }, [isOpen, focusedIndex]);

  // Keyboard controls for trigger button
  const handleTriggerKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const activeIdx = LANGUAGES.findIndex((l) => l.code === currentLangCode);
      setIsOpen(true);
      setFocusedIndex(activeIdx >= 0 ? activeIdx : 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsOpen(true);
      setFocusedIndex(LANGUAGES.length - 1);
    }
  };

  // Keyboard navigation inside dropdown menu
  const handleMenuKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === 'Tab') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % LANGUAGES.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + LANGUAGES.length) % LANGUAGES.length);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setFocusedIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setFocusedIndex(LANGUAGES.length - 1);
    }
  };

  // Segmented keyboard navigation (roving tabindex)
  const handleSegmentedKeyDown = (e, index) => {
    let nextIndex = index;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (index + 1) % LANGUAGES.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (index - 1 + LANGUAGES.length) % LANGUAGES.length;
    }

    if (nextIndex !== index) {
      handleSelectLanguage(LANGUAGES[nextIndex].code);
      optionsRef.current[nextIndex]?.focus();
    }
  };

  // ─────────────────────────────────────────────────────────────
  // VARIANT B: Segmented (Mobile Menu, Login, Register)
  // ─────────────────────────────────────────────────────────────
  if (variant === 'segmented') {
    return (
      <div className={`w-full ${className}`}>
        <div className="text-xs font-semibold text-gray-600 mb-2">
          {t('common.language', 'Language')}
        </div>
        <div
          role="radiogroup"
          aria-label={t('common.language', 'Language')}
          className="grid grid-cols-3 gap-2"
        >
          {LANGUAGES.map((lang, index) => {
            const isSelected = currentLangCode === lang.code;
            return (
              <button
                key={lang.code}
                ref={(el) => (optionsRef.current[index] = el)}
                type="button"
                role="radio"
                aria-checked={isSelected}
                tabIndex={isSelected ? 0 : -1}
                lang={lang.code}
                onClick={() => handleSelectLanguage(lang.code)}
                onKeyDown={(e) => handleSegmentedKeyDown(e, index)}
                className={`min-h-[44px] px-2 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1.5 border ${
                  isSelected
                    ? 'bg-green-700 text-white font-semibold border-green-700 shadow-xs'
                    : 'bg-white border-gray-300 text-gray-800 hover:bg-green-50 hover:border-green-300'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
                <span className="truncate leading-normal">{lang.native}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // VARIANT A: Dropdown (Desktop Navbar)
  // ─────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={t('common.changeLanguage', 'Change language')}
        onClick={() => {
          const nextState = !isOpen;
          setIsOpen(nextState);
          if (nextState) {
            const activeIdx = LANGUAGES.findIndex((l) => l.code === currentLangCode);
            setFocusedIndex(activeIdx >= 0 ? activeIdx : 0);
          }
        }}
        onKeyDown={handleTriggerKeyDown}
        className="h-10 px-3 min-w-[76px] lg:min-w-[130px] flex items-center justify-between gap-2 bg-white border border-gray-300 rounded-lg text-gray-800 text-sm font-medium hover:bg-green-50 hover:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-1.5 shrink-0">
          <Globe className="w-4 h-4 text-gray-600 shrink-0" aria-hidden="true" />
          {/* Full native name on lg+, short code between md and lg */}
          <span className="hidden lg:inline leading-normal">{currentLang.native}</span>
          <span className="inline lg:hidden leading-normal">{currentLang.short}</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Menu Options */}
      {isOpen && (
        <div
          id={menuId}
          role="menu"
          aria-labelledby={triggerId}
          onKeyDown={handleMenuKeyDown}
          className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 p-1.5 z-50 transition-all duration-150 ease-out motion-reduce:transition-none motion-reduce:transform-none"
        >
          {LANGUAGES.map((lang, index) => {
            const isSelected = currentLangCode === lang.code;
            return (
              <button
                key={lang.code}
                ref={(el) => (optionsRef.current[index] = el)}
                type="button"
                role="menuitemradio"
                aria-checked={isSelected}
                tabIndex={focusedIndex === index ? 0 : -1}
                lang={lang.code}
                onClick={() => handleSelectLanguage(lang.code)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm min-h-[44px] cursor-pointer transition-colors outline-none ${
                  isSelected
                    ? 'bg-green-50 text-green-800 font-semibold focus:bg-green-100'
                    : 'text-gray-800 hover:bg-gray-50 focus:bg-gray-100'
                }`}
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-base leading-normal font-medium">{lang.native}</span>
                  <span className="text-xs text-gray-500 leading-normal">{lang.english}</span>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-green-700 shrink-0 ml-auto" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
