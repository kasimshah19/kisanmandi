import React, { useState, useId } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Accordion({ items = [], allowMultiple = false, className = '' }) {
  const [openIndices, setOpenIndices] = useState([0]); // Default first item open

  const toggleIndex = (index) => {
    if (allowMultiple) {
      setOpenIndices((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    } else {
      setOpenIndices((prev) => (prev.includes(index) ? [] : [index]));
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, index) => {
        const isOpen = openIndices.includes(index);
        return (
          <AccordionItem
            key={item.id || index}
            title={item.question || item.title}
            isOpen={isOpen}
            onToggle={() => toggleIndex(index)}
          >
            {item.answer || item.content}
          </AccordionItem>
        );
      })}
    </div>
  );
}

function AccordionItem({ title, isOpen, onToggle, children }) {
  const contentId = useId();
  const buttonId = useId();

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden transition-all duration-200 shadow-card">
      <h3>
        <button
          id={buttonId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={onToggle}
          className="w-full flex items-center justify-between p-5 text-left font-semibold text-gray-900 hover:text-green-800 transition-colors focus-visible:outline-none focus-visible:bg-green-50/50 min-h-[48px]"
        >
          <span className="text-base sm:text-lg leading-normal pr-4">{title}</span>
          <ChevronDown
            className={`w-5 h-5 text-gray-500 shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-green-700' : ''
            }`}
            aria-hidden="true"
          />
        </button>
      </h3>
      {isOpen && (
        <div
          id={contentId}
          role="region"
          aria-labelledby={buttonId}
          className="px-5 pb-5 pt-0 text-sm sm:text-base text-gray-600 leading-relaxed border-t border-gray-100/60"
        >
          <div className="pt-3">{children}</div>
        </div>
      )}
    </div>
  );
}
