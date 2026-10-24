import React from 'react';

/**
 * Mapping of Mandi commodities to emoji, background tints, and border accents.
 * Supports English, Hindi, and Marathi keyword matching.
 */
const COMMODITY_MAP = [
  {
    keywords: ['tomato', 'tamatar', 'टोमॅटो', 'टमाटर'],
    emoji: '🍅',
    bg: 'bg-red-50 text-red-700 border-red-200',
  },
  {
    keywords: ['onion', 'pyaz', 'pyaaj', 'kanda', 'कांदा', 'प्याज'],
    emoji: '🧅',
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    keywords: ['potato', 'aaloo', 'aalu', 'batata', 'बटाटा', 'आलू'],
    emoji: '🥔',
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    keywords: ['wheat', 'gehu', 'gahu', 'गहू', 'गेहूं'],
    emoji: '🌾',
    bg: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  },
  {
    keywords: ['soyabean', 'soya', 'soybean', 'सोयाबीन'],
    emoji: '🫘',
    bg: 'bg-orange-50 text-orange-800 border-orange-200',
  },
  {
    keywords: ['cotton', 'kapaas', 'kapas', 'kaapus', 'कापूस', 'कपास'],
    emoji: '🌿',
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  {
    keywords: ['rice', 'paddy', 'chawal', 'tandul', 'तांदूळ', 'चावल', 'dhan'],
    emoji: '🍚',
    bg: 'bg-sky-50 text-sky-800 border-sky-200',
  },
  {
    keywords: ['maize', 'corn', 'makka', 'makkai', 'मका', 'मक्का'],
    emoji: '🌽',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    keywords: ['chilli', 'mirch', 'mirchi', 'मिरची', 'मिर्च'],
    emoji: '🌶️',
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  {
    keywords: ['banana', 'kela', 'kele', 'केळी', 'केला'],
    emoji: '🍌',
    bg: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  },
  {
    keywords: ['mango', 'aam', 'amba', 'आंबा', 'आम'],
    emoji: '🥭',
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    keywords: ['garlic', 'lahsun', 'lasun', 'लसूण', 'लहसुन'],
    emoji: '🧄',
    bg: 'bg-stone-50 text-stone-700 border-stone-200',
  },
  {
    keywords: ['ginger', 'adrak', 'aale', 'आले', 'अदरक'],
    emoji: '🫚',
    bg: 'bg-orange-50 text-orange-800 border-orange-200',
  },
];

const DEFAULT_COMMODITY = {
  emoji: '🌱',
  bg: 'bg-green-50 text-green-700 border-green-200',
};

/**
 * Returns commodity icon details for a commodity name
 * @param {string} commodityName
 */
export function getCommodityIconData(commodityName) {
  if (!commodityName || typeof commodityName !== 'string') return DEFAULT_COMMODITY;
  const normalized = commodityName.toLowerCase().trim();

  for (const item of COMMODITY_MAP) {
    if (item.keywords.some((kw) => normalized.includes(kw))) {
      return item;
    }
  }

  return DEFAULT_COMMODITY;
}

/**
 * CommodityIcon: Emoji inside a tinted tile with rounded border
 */
export function CommodityIcon({
  name,
  size = 'md',
  className = '',
}) {
  const { emoji, bg } = getCommodityIconData(name);

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-xl',
    xl: 'w-14 h-14 text-2xl',
  }[size] || 'w-10 h-10 text-base';

  return React.createElement(
    'span',
    {
      className: `inline-flex items-center justify-center rounded-xl border shrink-0 ${bg} ${sizeClasses} ${className}`,
      'aria-hidden': 'true',
    },
    React.createElement('span', null, emoji)
  );
}

export default CommodityIcon;
