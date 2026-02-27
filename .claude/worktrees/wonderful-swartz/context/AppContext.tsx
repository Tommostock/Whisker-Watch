/**
 * AppContext
 * Central state management using React Context
 * Wires together all hooks for application-wide state
 */

'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useIncidents } from '@/hooks/useIncidents';
import { useTheme } from '@/hooks/useTheme';
import { useGeocoding } from '@/hooks/useGeocoding';
import { Incident, FilterState } from '@/lib/types';

/**
 * Application state from all hooks
 */
interface AppContextType {
  // ═══════════════════════════════════════════
  // INCIDENTS
  // ═══════════════════════════════════════════
  incidents: Incident[];
  filters: FilterState;
  sortField: 'date' | 'area' | 'status';
  sortDir: 1 | -1;
  filteredIncidents: Incident[];

  // CRUD
  createIncident: (data: Omit<Incident, 'id' | 'createdAt'>) => Incident;
  updateIncident: (id: string, updates: Partial<Incident>) => void;
  deleteIncident: (id: string) => void;
  getIncident: (id: string) => Incident | undefined;

  // Filters & Search
  setFilters: (filters: FilterState) => void;
  clearFilters: () => void;
  applyFilters: (filters: FilterState) => void;
  searchIncidents: (query: string) => Incident[];

  // Sorting
  setSort: (field: 'date' | 'area' | 'status', direction?: 1 | -1) => void;

  // Case Notes (Intel)
  addCaseNote: (incidentId: string, text: string) => void;
  deleteCaseNote: (incidentId: string, noteId: string) => void;

  // Statistics
  getStats: () => Record<string, number>;
  getAreasList: () => string[];

  // ═══════════════════════════════════════════
  // THEME
  // ═══════════════════════════════════════════
  theme: 'light' | 'dark';
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;

  // ═══════════════════════════════════════════
  // GEOCODING
  // ═══════════════════════════════════════════
  searchAddress: (query: string) => Promise<any[]>;
  searchAddressLoading: boolean;
  searchAddressError: Error | null;

  reverseGeocode: (lat: number, lon: number) => Promise<string>;
  reverseGeoLoading: boolean;
  reverseGeoError: Error | null;

  clearGeoErrors: () => void;
}

/**
 * Create context with undefined initial value
 * This forces consumers to use the provider
 */
const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * Provider component - wrap your app with this
 */
export function AppProvider({ children }: { children: ReactNode }): JSX.Element {
  // Get hooks
  const incidents = useIncidents();
  const theme = useTheme();
  const geocoding = useGeocoding();

  // Build context value
  const value: AppContextType = {
    // Incidents
    incidents: incidents.incidents,
    filters: incidents.filters,
    sortField: incidents.sortField,
    sortDir: incidents.sortDir,
    filteredIncidents: incidents.filteredIncidents,

    createIncident: incidents.createIncident,
    updateIncident: incidents.updateIncident,
    deleteIncident: incidents.deleteIncident,
    getIncident: incidents.getIncident,

    setFilters: incidents.setFilters,
    clearFilters: incidents.clearFilters,
    applyFilters: incidents.applyFilters,
    searchIncidents: incidents.searchIncidents,

    setSort: incidents.setSort,

    addCaseNote: incidents.addCaseNote,
    deleteCaseNote: incidents.deleteCaseNote,

    getStats: incidents.getStats,
    getAreasList: incidents.getAreasList,

    // Theme
    theme: theme.theme,
    isDark: theme.isDark,
    toggleTheme: theme.toggleTheme,
    setTheme: theme.setTheme,

    // Geocoding
    searchAddress: geocoding.search,
    searchAddressLoading: geocoding.searchLoading,
    searchAddressError: geocoding.searchError,

    reverseGeocode: geocoding.reverseGeocode,
    reverseGeoLoading: geocoding.reverseLoading,
    reverseGeoError: geocoding.reverseError,

    clearGeoErrors: geocoding.clearErrors,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * Hook to use AppContext in components
 * Throws error if used outside AppProvider
 */
export function useApp(): AppContextType {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error(
      'useApp must be used within an AppProvider. ' +
        'Make sure to wrap your app with <AppProvider>.'
    );
  }

  return context;
}

/**
 * Typed hook for just incidents
 */
export function useAppIncidents() {
  const app = useApp();
  return {
    incidents: app.incidents,
    filters: app.filters,
    sortField: app.sortField,
    sortDir: app.sortDir,
    filteredIncidents: app.filteredIncidents,
    createIncident: app.createIncident,
    updateIncident: app.updateIncident,
    deleteIncident: app.deleteIncident,
    getIncident: app.getIncident,
    setFilters: app.setFilters,
    clearFilters: app.clearFilters,
    applyFilters: app.applyFilters,
    searchIncidents: app.searchIncidents,
    setSort: app.setSort,
    addCaseNote: app.addCaseNote,
    deleteCaseNote: app.deleteCaseNote,
    getStats: app.getStats,
    getAreasList: app.getAreasList,
  };
}

/**
 * Typed hook for just theme
 */
export function useAppTheme() {
  const app = useApp();
  return {
    theme: app.theme,
    isDark: app.isDark,
    toggleTheme: app.toggleTheme,
    setTheme: app.setTheme,
  };
}

/**
 * Typed hook for just geocoding
 */
export function useAppGeocoding() {
  const app = useApp();
  return {
    searchAddress: app.searchAddress,
    searchAddressLoading: app.searchAddressLoading,
    searchAddressError: app.searchAddressError,
    reverseGeocode: app.reverseGeocode,
    reverseGeoLoading: app.reverseGeoLoading,
    reverseGeoError: app.reverseGeoError,
    clearGeoErrors: app.clearGeoErrors,
  };
}
