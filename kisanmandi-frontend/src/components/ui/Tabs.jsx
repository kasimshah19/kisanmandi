import React, { useState, useRef, useId } from 'react';

export default function Tabs({
  tabs = [],
  activeTab: controlledActiveTab,
  onChange,
  className = '',
}) {
  const [internalActive, setInternalActive] = useState(0);
  const activeIndex = controlledActiveTab !== undefined ? controlledActiveTab : internalActive;
  const tabRefs = useRef([]);
  const baseId = useId();

  const handleTabClick = (index) => {
    if (controlledActiveTab === undefined) {
      setInternalActive(index);
    }
    onChange?.(index);
  };

  const handleKeyDown = (e, index) => {
    let nextIndex = index;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextIndex = (index + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = tabs.length - 1;
    }

    if (nextIndex !== index) {
      handleTabClick(nextIndex);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tablist */}
      <div
        role="tablist"
        aria-label="Navigation Tabs"
        className="inline-flex p-1.5 bg-gray-100/90 rounded-2xl border border-gray-200/80 max-w-full overflow-x-auto"
      >
        {tabs.map((tab, index) => {
          const isSelected = activeIndex === index;
          const tabId = `${baseId}-tab-${index}`;
          const panelId = `${baseId}-panel-${index}`;

          return (
            <button
              key={tab.label || index}
              ref={(el) => (tabRefs.current[index] = el)}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls={panelId}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => handleTabClick(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`
                px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 min-h-[44px]
                flex items-center gap-2 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-green-600
                ${
                  isSelected
                    ? 'bg-white text-green-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }
              `.trim()}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Panels */}
      {tabs.map((tab, index) => {
        const isSelected = activeIndex === index;
        const tabId = `${baseId}-tab-${index}`;
        const panelId = `${baseId}-panel-${index}`;

        return (
          <div
            key={tab.label || index}
            id={panelId}
            role="tabpanel"
            aria-labelledby={tabId}
            hidden={!isSelected}
            tabIndex={0}
            className="outline-none"
          >
            {isSelected && (tab.content || null)}
          </div>
        );
      })}
    </div>
  );
}
