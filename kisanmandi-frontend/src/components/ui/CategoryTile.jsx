import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Standard agricultural categories with icons and color themes
export const CATEGORY_METADATA = {
  VEGETABLES: {
    icon: '🍅',
    key: 'categories.vegetables',
    defaultLabel: 'Vegetables',
    hindi: 'सब्जियां',
    marathi: 'भाज्या',
    bgColor: 'bg-emerald-50 hover:bg-emerald-100/90 border-emerald-200 text-emerald-950',
    iconBg: 'bg-emerald-100 text-emerald-800',
    badge: 'ताज़ा सब्जियां',
  },
  FRUITS: {
    icon: '🍎',
    key: 'categories.fruits',
    defaultLabel: 'Fruits',
    hindi: 'ताज़ा फल',
    marathi: 'फळे',
    bgColor: 'bg-rose-50 hover:bg-rose-100/90 border-rose-200 text-rose-950',
    iconBg: 'bg-rose-100 text-rose-800',
    badge: 'मीठे फल',
  },
  GRAINS: {
    icon: '🌾',
    key: 'categories.grains',
    defaultLabel: 'Grains & Cereals',
    hindi: 'अनाज (गेहूं, चावल)',
    marathi: 'धान्य (गहू, तांदूळ)',
    bgColor: 'bg-amber-50 hover:bg-amber-100/90 border-amber-200 text-amber-950',
    iconBg: 'bg-amber-100 text-amber-800',
    badge: 'सीधे खेत से',
  },
  PULSES: {
    icon: '🫘',
    key: 'categories.pulses',
    defaultLabel: 'Pulses & Dal',
    hindi: 'दालें और दलहन',
    marathi: 'डाळी व कडधान्ये',
    bgColor: 'bg-orange-50 hover:bg-orange-100/90 border-orange-200 text-orange-950',
    iconBg: 'bg-orange-100 text-orange-800',
    badge: 'शुद्ध दाल',
  },
  DAIRY: {
    icon: '🥛',
    key: 'categories.dairy',
    defaultLabel: 'Dairy & Milk',
    hindi: 'दूध व घी',
    marathi: 'दूध आणि तूप',
    bgColor: 'bg-sky-50 hover:bg-sky-100/90 border-sky-200 text-sky-950',
    iconBg: 'bg-sky-100 text-sky-800',
    badge: 'देसी डेयरी',
  },
  ORGANIC: {
    icon: '🌿',
    key: 'categories.organic',
    defaultLabel: 'Organic & Herbs',
    hindi: 'जैविक व मसाले',
    marathi: 'सेंद्रिय व मसाले',
    bgColor: 'bg-teal-50 hover:bg-teal-100/90 border-teal-200 text-teal-950',
    iconBg: 'bg-teal-100 text-teal-800',
    badge: 'रसायन मुक्त',
  },
};

export default function CategoryTile({
  categoryKey = 'VEGETABLES',
  name,
  count,
  isSelected = false,
  onClick,
  to,
  className = '',
}) {
  const { t } = useTranslation();
  const meta = CATEGORY_METADATA[categoryKey] || {
    icon: '🌱',
    key: `categories.${categoryKey.toLowerCase()}`,
    defaultLabel: name || categoryKey,
    bgColor: 'bg-green-50 hover:bg-green-100/90 border-green-200 text-green-950',
    iconBg: 'bg-green-100 text-green-800',
  };

  const displayName = name || t(meta.key, meta.defaultLabel);

  const tileClasses = `
    group relative flex flex-col items-center justify-center p-3.5 sm:p-5 rounded-2xl border-2 transition-all duration-200
    select-none text-center cursor-pointer min-h-[96px] sm:min-h-[110px] outline-none
    focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2
    ${
      isSelected
        ? 'border-green-600 bg-green-100/90 shadow-md ring-2 ring-green-500/20 scale-[1.02]'
        : `${meta.bgColor} shadow-2xs hover:shadow-sm hover:scale-[1.02]`
    }
    ${className}
  `.trim();

  const content = (
    <>
      {/* Large visual cue icon */}
      <span
        className="text-3xl sm:text-4xl mb-1.5 sm:mb-2 transform group-hover:scale-110 transition-transform duration-200"
        role="img"
        aria-hidden="true"
      >
        {meta.icon}
      </span>

      {/* Category Name (Bilingual/clear Devanagari readability) */}
      <span className="text-sm sm:text-base font-bold leading-tight block truncate max-w-full">
        {displayName}
      </span>

      {/* Optional count or badge */}
      {typeof count === 'number' && (
        <span className="text-[11px] font-medium text-gray-500 mt-0.5">
          {count} {t('common.items', 'items')}
        </span>
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={tileClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={tileClasses}>
      {content}
    </button>
  );
}
