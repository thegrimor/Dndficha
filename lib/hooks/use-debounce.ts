"use client";

import { useEffect, useState } from "react";

/**
 * Returns `value` delayed by `delayMs` milliseconds. Used to avoid firing
 * a request to /api/open5e/* on every keystroke in the text search.
 */
export function useDebounce<T>(value: T, delayMs = 350): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timeoutId);
  }, [value, delayMs]);

  return debouncedValue;
}
