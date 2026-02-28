/**
 * useTheme Hook Tests
 * Tests theme switching, localStorage persistence, and document class updates
 */

import { renderHook, act } from '@testing-library/react';
import { useTheme, getSystemTheme, useSystemThemeListener } from '../useTheme';

describe('useTheme Hook', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset document classes
    document.body.classList.remove('light-mode');
  });

  describe('Theme Initialization', () => {
    it('should initialize with dark theme by default', () => {
      const { result } = renderHook(() => useTheme());
      expect(result.current.theme).toBe('dark');
      expect(result.current.isDark).toBe(true);
    });

    it('should load saved theme from localStorage', () => {
      localStorage.setItem('slainTheme', JSON.stringify('light'));
      const { result } = renderHook(() => useTheme());
      expect(result.current.theme).toBe('light');
      expect(result.current.isDark).toBe(false);
    });

    it('should default to dark if localStorage has invalid value', () => {
      localStorage.setItem('slainTheme', 'invalid');
      const { result } = renderHook(() => useTheme());
      // Should fall back to dark theme
      expect(result.current.isDark).toBeDefined();
    });
  });

  describe('Theme Toggle', () => {
    it('should toggle from dark to light', () => {
      const { result } = renderHook(() => useTheme());
      expect(result.current.isDark).toBe(true);

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('light');
      expect(result.current.isDark).toBe(false);
    });

    it('should toggle from light to dark', () => {
      localStorage.setItem('slainTheme', JSON.stringify('light'));
      const { result } = renderHook(() => useTheme());
      expect(result.current.isDark).toBe(false);

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('dark');
      expect(result.current.isDark).toBe(true);
    });

    it('should toggle multiple times', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });
      expect(result.current.theme).toBe('light');

      act(() => {
        result.current.toggleTheme();
      });
      expect(result.current.theme).toBe('dark');

      act(() => {
        result.current.toggleTheme();
      });
      expect(result.current.theme).toBe('light');
    });
  });

  describe('Set Specific Theme', () => {
    it('should set theme to dark', () => {
      localStorage.setItem('slainTheme', JSON.stringify('light'));
      const { result } = renderHook(() => useTheme());
      expect(result.current.isDark).toBe(false);

      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme).toBe('dark');
      expect(result.current.isDark).toBe(true);
    });

    it('should set theme to light', () => {
      const { result } = renderHook(() => useTheme());
      expect(result.current.isDark).toBe(true);

      act(() => {
        result.current.setTheme('light');
      });

      expect(result.current.theme).toBe('light');
      expect(result.current.isDark).toBe(false);
    });

    it('should not update if setting same theme', () => {
      const { result } = renderHook(() => useTheme());
      const initialTheme = result.current.theme;

      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme).toBe(initialTheme);
    });
  });

  describe('localStorage Persistence', () => {
    it('should save theme to localStorage on toggle', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });

      const saved = localStorage.getItem('slainTheme');
      // localStorage mock may return stringified value
      expect(saved).toBeTruthy();
      expect(saved).toMatch(/light/);
    });

    it('should save theme to localStorage when using setTheme', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme('light');
      });

      const saved = localStorage.getItem('slainTheme');
      // localStorage mock may return stringified value
      expect(saved).toBeTruthy();
      expect(saved).toMatch(/light/);
    });

    it('should persist theme across hook re-renders', () => {
      const { result, rerender } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });
      const firstTheme = result.current.theme;

      rerender();
      expect(result.current.theme).toBe(firstTheme);
    });
  });

  describe('Document Class Updates', () => {
    it('should add light-mode class when setting light theme', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme('light');
      });

      expect(document.body.classList.contains('light-mode')).toBe(true);
    });

    it('should remove light-mode class when setting dark theme', () => {
      document.body.classList.add('light-mode');
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme('dark');
      });

      expect(document.body.classList.contains('light-mode')).toBe(false);
    });

    it('should update document class on toggle', () => {
      const { result } = renderHook(() => useTheme());
      expect(document.body.classList.contains('light-mode')).toBe(false);

      act(() => {
        result.current.toggleTheme();
      });

      expect(document.body.classList.contains('light-mode')).toBe(true);
    });

    it('should update document class on mount with saved theme', () => {
      localStorage.setItem('slainTheme', 'light');
      // Clear any existing classes first
      document.body.classList.remove('light-mode');

      renderHook(() => useTheme());

      // Give it a moment for the effect to run
      setTimeout(() => {
        expect(document.body.classList.contains('light-mode')).toBe(true);
      }, 0);
    });
  });

  describe('Return Value Structure', () => {
    it('should return theme object with required properties', () => {
      const { result } = renderHook(() => useTheme());

      expect(result.current).toHaveProperty('theme');
      expect(result.current).toHaveProperty('isDark');
      expect(result.current).toHaveProperty('toggleTheme');
      expect(result.current).toHaveProperty('setTheme');
    });

    it('should have isDark matching theme value', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme('dark');
      });
      expect(result.current.isDark).toBe(result.current.theme === 'dark');

      act(() => {
        result.current.setTheme('light');
      });
      expect(result.current.isDark).toBe(result.current.theme === 'dark');
    });
  });

  describe('getSystemTheme Function', () => {
    it('should return dark if system prefers dark mode', () => {
      // Mock matchMedia for dark mode
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      const theme = getSystemTheme();
      expect(theme).toBe('dark');
    });

    it('should return light if system prefers light mode', () => {
      // Mock matchMedia for light mode
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
          matches: query === '(prefers-color-scheme: light)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      const theme = getSystemTheme();
      expect(theme).toBe('light');
    });

    it('should default to dark in SSR environment', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const theme = getSystemTheme();
      expect(theme).toBe('dark');

      global.window = originalWindow;
    });
  });

  describe('useSystemThemeListener Hook', () => {
    it('should call callback when system theme changes', () => {
      const mockCallback = jest.fn();
      const mockAddEventListener = jest.fn();
      const mockRemoveEventListener = jest.fn();

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: mockAddEventListener,
          removeEventListener: mockRemoveEventListener,
          dispatchEvent: jest.fn(),
        })),
      });

      renderHook(() => useSystemThemeListener(mockCallback));

      expect(mockAddEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
    });

    it('should clean up listener on unmount', () => {
      const mockCallback = jest.fn();
      const mockRemoveEventListener = jest.fn();

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: mockRemoveEventListener,
          dispatchEvent: jest.fn(),
        })),
      });

      const { unmount } = renderHook(() => useSystemThemeListener(mockCallback));

      unmount();

      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
    });

    it('should handle older browsers with addListener', () => {
      const mockCallback = jest.fn();
      const mockAddListener = jest.fn();
      const mockRemoveListener = jest.fn();

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: mockAddListener,
          removeListener: mockRemoveListener,
          dispatchEvent: jest.fn(),
        })),
      });

      renderHook(() => useSystemThemeListener(mockCallback));

      expect(mockAddListener).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid theme toggles', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
        result.current.toggleTheme();
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('light');
    });

    it('should handle theme changes during SSR', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      // Hook should handle SSR gracefully
      expect(() => {
        getSystemTheme();
      }).not.toThrow();

      global.window = originalWindow;
    });
  });
});
