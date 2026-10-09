import { useState, useEffect } from 'react';

// Delays updating a value until the user stops typing for `delay` ms
export default function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer); // cancel timer if value changes before delay
  }, [value, delay]);

  return debouncedValue;
}
