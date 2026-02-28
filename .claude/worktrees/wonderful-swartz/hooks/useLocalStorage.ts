/**
 * useLocalStorage Hook
 * Wraps localStorage access with error handling and type safety
 * Handles quota exceeded, access denied, and JSON parsing errors
 */

import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for localStorage with error handling
 * @param key - localStorage key name
 * @param initialValue - Default value if key doesn't exist
 * @returns [value, setValue, error]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, Error | null] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [error, setError] = useState<Error | null>(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item));
      }
      setError(null);
    } catch (err) {
      console.error(`Failed to load from localStorage (${key}):`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [key]);

  // Update localStorage when value changes
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function for same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        // Try to save to localStorage
        try {
          localStorage.setItem(key, JSON.stringify(valueToStore));
          setError(null);
        } catch (err) {
          // Handle quota exceeded error
          if (err instanceof Error && err.name === 'QuotaExceededError') {
            console.error('localStorage quota exceeded:', err);
            setError(new Error('Storage quota exceeded'));
          } else {
            console.error('Failed to save to localStorage:', err);
            setError(err instanceof Error ? err : new Error(String(err)));
          }
          // Still update state even if storage failed
          // User can still use app, just won't persist
        }
      } catch (err) {
        console.error('Error in setValue:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue, error];
}

/**
 * Synchronous localStorage getter (for initialization before first render)
 * Use this for reading initial values synchronously
 */
export function getStorageValue<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.error(`Failed to read from localStorage (${key}):`, err);
    return defaultValue;
  }
}

/**
 * Synchronous localStorage setter (for non-React code)
 * Use this for writing values outside of React components
 */
export function setStorageValue<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Failed to write to localStorage (${key}):`, err);
    return false;
  }
}

/**
 * Clear all data from localStorage
 * Useful for testing or user logout
 */
export function clearStorage(): boolean {
  try {
    localStorage.clear();
    return true;
  } catch (err) {
    console.error('Failed to clear localStorage:', err);
    return false;
  }
}

/**
 * Remove specific key from localStorage
 */
export function removeStorageKey(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (err) {
    console.error(`Failed to remove localStorage key (${key}):`, err);
    return false;
  }
}

/**
 * Get all localStorage keys (for debugging)
 */
export function getStorageKeys(): string[] {
  try {
    return Object.keys(localStorage);
  } catch (err) {
    console.error('Failed to get localStorage keys:', err);
    return [];
  }
}

/**
 * Get localStorage size in bytes (for debugging)
 */
export function getStorageSize(): number {
  try {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  } catch (err) {
    console.error('Failed to calculate storage size:', err);
    return 0;
  }
}
