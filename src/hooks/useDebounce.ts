'use client';
import { useState, useEffect } from 'react';

/**
 * Returns a debounced version of `value` that only updates after `delay` ms of no changes.
 * Use this to delay expensive filter / search operations triggered on every keystroke.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
