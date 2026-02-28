/**
 * useSidebarFilters Hook
 * Manages sidebar filtering and search state
 */

import { useState, useCallback } from 'react';
import { Incident } from '@/lib/types';
import { INCIDENT_STATUS, INCIDENT_METHODS } from '@/lib/constants';

export interface SidebarFilters {
  searchText: string;
  statusFilter: string | null; // null = all
  methodFilter: string | null; // null = all
  areaFilter: string | null; // null = all
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
}

export interface SidebarFiltersHook {
  filters: SidebarFilters;
  setSearchText: (text: string) => void;
  setStatusFilter: (status: string | null) => void;
  setMethodFilter: (method: string | null) => void;
  setAreaFilter: (area: string | null) => void;
  setDateRange: (from: Date | null, to: Date | null) => void;
  clearFilters: () => void;
  filterIncidents: (incidents: Incident[]) => Incident[];
  getFilteredStats: (incidents: Incident[]) => {
    total: number;
    byStatus: Record<string, number>;
    byMethod: Record<string, number>;
    byArea: Record<string, number>;
  };
}

const INITIAL_FILTERS: SidebarFilters = {
  searchText: '',
  statusFilter: null,
  methodFilter: null,
  areaFilter: null,
  dateRange: { from: null, to: null },
};

export function useSidebarFilters(): SidebarFiltersHook {
  const [filters, setFilters] = useState<SidebarFilters>(INITIAL_FILTERS);

  const setSearchText = useCallback((text: string) => {
    setFilters((prev) => ({ ...prev, searchText: text.toLowerCase() }));
  }, []);

  const setStatusFilter = useCallback((status: string | null) => {
    setFilters((prev) => ({ ...prev, statusFilter: status }));
  }, []);

  const setMethodFilter = useCallback((method: string | null) => {
    setFilters((prev) => ({ ...prev, methodFilter: method }));
  }, []);

  const setAreaFilter = useCallback((area: string | null) => {
    setFilters((prev) => ({ ...prev, areaFilter: area }));
  }, []);

  const setDateRange = useCallback((from: Date | null, to: Date | null) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: { from, to },
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  // Filter incidents based on current filters
  const filterIncidents = useCallback(
    (incidents: Incident[]): Incident[] => {
      return incidents.filter((incident) => {
        // Status filter
        if (filters.statusFilter && incident.status !== filters.statusFilter) {
          return false;
        }

        // Method filter
        if (filters.methodFilter && incident.method !== filters.methodFilter) {
          return false;
        }

        // Area filter
        if (filters.areaFilter && incident.area !== filters.areaFilter) {
          return false;
        }

        // Date range filter
        if (filters.dateRange.from || filters.dateRange.to) {
          const incidentDate = new Date(incident.datetime);
          if (filters.dateRange.from && incidentDate < filters.dateRange.from) {
            return false;
          }
          if (filters.dateRange.to && incidentDate > filters.dateRange.to) {
            return false;
          }
        }

        // Search text (searches address, animal type, notes, witness name)
        if (filters.searchText) {
          const searchLower = filters.searchText;
          const searchFields = [
            incident.address?.toLowerCase() || '',
            incident.animalType?.toLowerCase() || '',
            incident.notes?.toLowerCase() || '',
            incident.witnessName?.toLowerCase() || '',
            incident.area?.toLowerCase() || '',
          ].join(' ');

          if (!searchFields.includes(searchLower)) {
            return false;
          }
        }

        return true;
      });
    },
    [filters]
  );

  // Calculate filtered statistics
  const getFilteredStats = useCallback(
    (incidents: Incident[]) => {
      const filtered = filterIncidents(incidents);

      const stats = {
        total: filtered.length,
        byStatus: {} as Record<string, number>,
        byMethod: {} as Record<string, number>,
        byArea: {} as Record<string, number>,
      };

      // Initialize all statuses
      Object.values(INCIDENT_STATUS).forEach((status) => {
        stats.byStatus[status] = 0;
      });

      // Initialize all methods
      Object.values(INCIDENT_METHODS).forEach((method) => {
        stats.byMethod[method] = 0;
      });

      // Count by category
      filtered.forEach((incident) => {
        stats.byStatus[incident.status] = (stats.byStatus[incident.status] || 0) + 1;
        stats.byMethod[incident.method] = (stats.byMethod[incident.method] || 0) + 1;
        stats.byArea[incident.area] = (stats.byArea[incident.area] || 0) + 1;
      });

      return stats;
    },
    [filterIncidents]
  );

  return {
    filters,
    setSearchText,
    setStatusFilter,
    setMethodFilter,
    setAreaFilter,
    setDateRange,
    clearFilters,
    filterIncidents,
    getFilteredStats,
  };
}
