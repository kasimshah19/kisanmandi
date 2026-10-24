import React from 'react';

/**
 * Mapping of crop/produce categories to emoji and soft tinted backgrounds.
 * Supports English, Hindi, and Marathi keyword matching.
 */
const CATEGORY_MAP = [
  {
    keywords: ['vegetable', 'veg', 'sabzi', 'sabji', 'bhaji', 'भाजी', 'सब्जी', 'भाज्या', 'tarkari'],
    emoji: '🍅',
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    color: '#059669',
  },
  {
    keywords: ['fruit', 'fal', 'phal', 'phale', 'फल', 'फळे'],
    emoji: '🍎',
    bg: 'bg-rose-50 text-rose-800 border-rose-200',
    color: '#e11d48',
  },
  {
    keywords: ['grain', 'cereal', 'anaaj', 'dhaanya', 'dhanya', 'अनाज', 'धान्य', 'gehu', 'wheat', 'rice'],
    emoji: '🌾',
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
    color: '#d97706',
  },
  {
    keywords: ['pulse', 'dal', 'daal', 'pulses', 'daali', 'दाल', 'डाळी', 'कडधान्य', 'kadadhanya', 'soyabean', 'chana'],
    emoji: '🫘',
    bg: 'bg-orange-50 text-orange-800 border-orange-200',
    color: '#ea580c',
  },
  {
    keywords: ['dairy', 'milk', 'doodh', 'dudh', 'dugdha', 'दूध', 'डेअरी', 'paneer', 'ghee'],
    emoji: '🥛',
    bg: 'bg-sky-50 text-sky-800 border-sky-200',
    color: '#0284c7',
  },
  {
    keywords: ['spice', 'masala', 'masale', 'mirchi', 'मसाले', 'मसाला', 'spices'],
    emoji: '🌶️',
    bg: 'bg-red-50 text-red-800 border-red-200',
    color: '#dc2626',
  },
];

const DEFAULT_CATEGORY = {
  emoji: '🌿',
  bg: 'bg-green-50 text-green-800 border-green-200',
  color: '#15803d',
};

/**
 * Resolves an icon & tint for a category string
 * @param {string} categoryName
 * @returns {{ emoji: string, bg: string, color: string }}
 */
export function getCategoryIconData(categoryName) {
  if (!categoryName || typeof categoryName !== 'string') return DEFAULT_CATEGORY;
  const normalized = categoryName.toLowerCase().trim();

  for (const item of CATEGORY_MAP) {
    if (item.keywords.some((kw) => normalized.includes(kw))) {
      return item;
    }
  }

  return DEFAULT_CATEGORY;
}

/**
 * Convenience helper returning just the emoji icon for a category.
 * @param {string} categoryName
 * @returns {string}
 */
export function getCategoryIcon(categoryName) {
  return getCategoryIconData(categoryName).emoji;
}

/**
 * CategoryIcon component: Emoji in a tinted circle with aria-hidden.
 */
export function CategoryIcon({
  name,
  size = 'md',
  className = '',
}) {
  const { emoji, bg } = getCategoryIconData(name);

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-xl',
    xl: 'w-14 h-14 text-2xl',
  }[size] || 'w-10 h-10 text-base';

  return React.createElement(
    'span',
    {
      className: `inline-flex items-center justify-center rounded-full border shrink-0 ${bg} ${sizeClasses} ${className}`,
      'aria-hidden': 'true',
    },
    React.createElement('span', null, emoji)
  );
}

export default CategoryIcon;
