/**
 * AppContext Integration Tests
 * Verify that all hooks are correctly wired in context and available to consumers
 */

import { renderHook, act } from '@testing-library/react';
import { AppProvider, useApp, useAppIncidents, useAppTheme, useAppGeocoding } from '../AppContext';
import { mockIncident as mockIncidentData } from '@/lib/test-utils';
import type { ReactNode } from 'react';
import type { Incident } from '@/lib/types';

// Helper to create mock incident with overrides
function createMockIncident(overrides?: Partial<Incident>): Incident {
  return { ...mockIncidentData, ...overrides } as Incident;
}

describe('AppProvider + Context Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Provider Initialization', () => {
    it('should render provider without crashing', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AppProvider>{children}</AppProvider>
      );

      const { result } = renderHook(() => useApp(), { wrapper });
      expect(result.current).toBeDefined();
    });

    it('should initialize with default state', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AppProvider>{children}</AppProvider>
      );

      localStorage.clear();
      const { result: incidentsResult } = renderHook(() => useAppIncidents(), { wrapper });
      const { result: themeResult } = renderHook(() => useAppTheme(), { wrapper });

      expect(incidentsResult.current.incidents).toEqual([]);
      expect(themeResult.current.theme).toBe('dark');
    });

    it('should load incidents from localStorage on init', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AppProvider>{children}</AppProvider>
      );

      const testIncidents = [createMockIncident({ id: 'INC-001' })];
      localStorage.setItem('lckData', JSON.stringify(testIncidents));

      const { result } = renderHook(() => useAppIncidents(), { wrapper });

      expect(result.current.incidents).toHaveLength(1);
      expect(result.current.incidents[0].id).toBe('INC-001');
    });

    it('should load theme from localStorage on init', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AppProvider>{children}</AppProvider>
      );

      localStorage.clear();
      localStorage.setItem('slainTheme', JSON.stringify('light'));

      const { result } = renderHook(() => useAppTheme(), { wrapper });

      expect(result.current.theme).toBe('light');
    });
  });

  describe('Hook Availability', () => {
    it('should provide useAppIncidents hook with all methods', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AppProvider>{children}</AppProvider>
      );

      const { result } = renderHook(() => useAppIncidents(), { wrapper });

      expect(result.current).toHaveProperty('incidents');
      expect(result.current).toHaveProperty('createIncident');
      expect(result.current).toHaveProperty('updateIncident');
      expect(result.current).toHaveProperty('deleteIncident');
      expect(result.current).toHaveProperty('searchIncidents');
      expect(result.current).toHaveProperty('getStats');
    });

    it('should provide useAppTheme hook with all methods', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AppProvider>{children}</AppProvider>
      );

      const { result } = renderHook(() => useAppTheme(), { wrapper });

      expect(result.current).toHaveProperty('theme');
      expect(result.current).toHaveProperty('isDark');
      expect(typeof result.current.toggleTheme).toBe('function');
      expect(typeof result.current.setTheme).toBe('function');
    });

    it('should provide useAppGeocoding hook with all methods', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AppProvider>{children}</AppProvider>
      );

      const { result } = renderHook(() => useAppGeocoding(), { wrapper });

      expect(result.current).toHaveProperty('searchAddress');
      expect(result.current).toHaveProperty('reverseGeocode');
      expect(result.current).toHaveProperty('searchAddressLoading');
      expect(result.current).toHaveProperty('searchAddressError');
    });
  });

  describe('Theme Management', () => {
    it('should persist theme changes to localStorage', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AppProvider>{children}</AppProvider>
      );

      localStorage.clear();
      const { result } = renderHook(() => useAppTheme(), { wrapper });

      expect(result.current.theme).toBe('dark');

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('light');

      const stored = localStorage.getItem('slainTheme');
      expect(JSON.parse(stored!)).toBe('light');
    });

    it('should set specific theme', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AppProvider>{children}</AppProvider>
      );

      localStorage.clear();
      const { result } = renderHook(() => useAppTheme(), { wrapper });

      act(() => {
        result.current.setTheme('light');
      });

      expect(result.current.theme).toBe('light');
      expect(result.current.isDark).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage initialization errors gracefully', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AppProvider>{children}</AppProvider>
      );

      localStorage.setItem('lckData', 'invalid json');

      const { result } = renderHook(() => useAppIncidents(), { wrapper });

      // Should initialize with empty array on parse error
      expect(result.current.incidents).toEqual([]);
    });

    it('should handle missing localStorage keys gracefully', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AppProvider>{children}</AppProvider>
      );

      localStorage.clear();

      const { result } = renderHook(() => useAppIncidents(), { wrapper });

      expect(result.current.incidents).toEqual([]);
    });
  });

  describe('Multi-Hook Integration', () => {
    it('should maintain state consistency across theme changes and incident creation', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AppProvider>{children}</AppProvider>
      );

      localStorage.clear();
      const { result: themeResult } = renderHook(() => useAppTheme(), { wrapper });
      const { result: incidentsResult } = renderHook(() => useAppIncidents(), { wrapper });

      // Verify both hooks are initialized
      expect(themeResult.current.theme).toBe('dark');
      expect(incidentsResult.current.incidents).toEqual([]);

      // Create an incident
      const incident = createMockIncident({ id: 'INC-MULTI' });
      act(() => {
        incidentsResult.current.createIncident(incident);
      });

      // Both changes should be persisted
      const incidentsData = localStorage.getItem('lckData');
      expect(JSON.parse(incidentsData!)).toHaveLength(1);

      // Change theme in parallel
      act(() => {
        themeResult.current.toggleTheme();
      });

      const themeData = localStorage.getItem('slainTheme');
      expect(JSON.parse(themeData!)).toBe('light');

      // Verify both are still available
      expect(incidentsResult.current.incidents).toHaveLength(1);
      expect(themeResult.current.theme).toBe('light');
    });
  });
});
