import React, { createContext, useContext, useState, useEffect } from 'react';

const TextSizeContext = createContext(null);

const STORAGE_KEY = 'kisanmandi_text_size';
export const TEXT_SIZES = ['normal', 'large', 'xlarge'];

export function TextSizeProvider({ children }) {
  const [textSize, setTextSizeState] = useState(() => {
    if (typeof window === 'undefined') return 'normal';
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && TEXT_SIZES.includes(stored)) {
        return stored;
      }
    } catch {
      // Storage access blocked or unavailable
    }
    return 'normal';
  });

  // Apply to document element data attribute
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-text-size', textSize);
    try {
      localStorage.setItem(STORAGE_KEY, textSize);
    } catch {
      // Ignore
    }
  }, [textSize]);

  const setTextSize = (newSize) => {
    if (TEXT_SIZES.includes(newSize)) {
      setTextSizeState(newSize);
    }
  };

  const cycleTextSize = () => {
    const nextIdx = (TEXT_SIZES.indexOf(textSize) + 1) % TEXT_SIZES.length;
    setTextSizeState(TEXT_SIZES[nextIdx]);
  };

  const value = {
    textSize,
    setTextSize,
    cycleTextSize,
    isLarge: textSize === 'large',
    isXLarge: textSize === 'xlarge',
  };

  return <TextSizeContext.Provider value={value}>{children}</TextSizeContext.Provider>;
}

export function useTextSize() {
  const context = useContext(TextSizeContext);
  if (!context) {
    // Return graceful fallback if rendered outside provider (e.g. isolated test)
    return {
      textSize: 'normal',
      setTextSize: () => {},
      cycleTextSize: () => {},
      isLarge: false,
      isXLarge: false,
    };
  }
  return context;
}

export default TextSizeContext;
