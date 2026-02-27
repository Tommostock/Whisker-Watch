/**
 * useTheme Hook
 * Manages dark/light mode with localStorage persistence
 * Syncs with document body class for CSS variable switching
 */

import { useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '@/lib/constants';
import { useLocalStorage } from './useLocalStorage';

type Theme = 'light' | 'dark';

interface UseThemeReturn {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

/**
 * useTheme hook - manages application theme (dark/light mode)
 */
export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useLocalStorage<Theme>(
    STORAGE_KEYS.theme,
    'dark'
  );

  /**
   * Update document body class and CSS variables
   */
  useEffect(() => {
    if (typeof document === 'undefined') return; // SSR check

    const isDark = theme === 'dark';

    if (isDark) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }, [theme]);

  /**
   * Toggle between light and dark mode
   */
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, [setThemeState]);

  /**
   * Set specific theme
   */
  const setTheme = useCallback(
    (newTheme: Theme) => {
      if (newTheme !== theme) {
        setThemeState(newTheme);
      }
    },
    [theme, setThemeState]
  );

  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme,
  };
}

/**
 * Get system color scheme preference (for initial theme selection)
 */
export function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'; // SSR check

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/**
 * Listen to system theme changes
 */
export function useSystemThemeListener(callback: (theme: Theme) => void): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      callback(e.matches ? 'dark' : 'light');
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    // Older browsers (IE 11)
    if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [callback]);
}
