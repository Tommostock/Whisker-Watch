/**
 * useIncidents Hook
 * Manages incident CRUD operations, filtering, sorting, and search
 * Implements the core business logic from original app
 */

import { useState, useCallback, useMemo } from 'react';
import {
  Incident,
  FilterState,
  CaseNote,
} from '@/lib/types';
import {
  STORAGE_KEYS,
  STATUS_PRIORITY,
  BOROUGHS,
} from '@/lib/constants';
import { useLocalStorage } from './useLocalStorage';

interface UseIncidentsReturn {
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

  // Filters
  setFilters: (filters: FilterState) => void;
  clearFilters: () => void;
  applyFilters: (filters: FilterState) => void;

  // Sorting
  setSort: (field: 'date' | 'area' | 'status', direction?: 1 | -1) => void;

  // Search
  searchIncidents: (query: string) => Incident[];

  // Case Notes (Intel)
  addCaseNote: (incidentId: string, text: string) => void;
  deleteCaseNote: (incidentId: string, noteId: string) => void;

  // Statistics
  getStats: () => Record<string, number>;
  getAreasList: () => string[];
}

/**
 * Extract borough/area from address
 */
function extractArea(addr: string): string {
  if (!addr) return 'Unknown';
  const parts = addr.split(',').map((p) => p.trim());
  const hit = parts.find((p) =>
    BOROUGHS.some((b) => p.toLowerCase().includes(b.toLowerCase()))
  );
  if (hit) {
    // Remove postcode pattern
    return (
      hit.replace(/\b[A-Z]{1,2}\d[\dA-Z]?\s?\d[A-Z]{2}\b/gi, '').trim() || hit
    );
  }
  return parts[0] || 'Unknown';
}

/**
 * Generate unique incident ID
 */
function generateIncidentId(): string {
  return 'INC-' + Date.now().toString(36).toUpperCase().slice(-6);
}

/**
 * Generate case note ID
 */
function generateNoteId(): string {
  return 'cn-' + Date.now().toString(36).toUpperCase().slice(-8);
}

/**
 * useIncidents hook - manages all incident data and operations
 */
export function useIncidents(): UseIncidentsReturn {
  const [incidents, setIncidents] = useLocalStorage<Incident[]>(
    STORAGE_KEYS.incidents,
    []
  );

  const [filters, setFiltersState] = useState<FilterState>({
    status: '',
    method: '',
    area: '',
  });

  const [sortField, setSortField] = useState<'date' | 'area' | 'status'>('date');
  const [sortDir, setSortDir] = useState<1 | -1>(-1);

  /**
   * Apply filters and sorting to incidents
   */
  const filteredIncidents = useMemo(() => {
    let result = [...incidents];

    // Apply filters
    if (filters.status) {
      result = result.filter((i) => i.status === filters.status);
    }
    if (filters.method) {
      result = result.filter((i) => i.method === filters.method);
    }
    if (filters.area) {
      result = result.filter((i) => i.area === filters.area);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (sortField === 'date') {
        aVal = a.datetime ? new Date(a.datetime).getTime() : 0;
        bVal = b.datetime ? new Date(b.datetime).getTime() : 0;
        return aVal < bVal ? sortDir : aVal > bVal ? -sortDir : 0;
      } else if (sortField === 'status') {
        aVal = STATUS_PRIORITY[a.status] || 999;
        bVal = STATUS_PRIORITY[b.status] || 999;
        return aVal < bVal ? -sortDir : aVal > bVal ? sortDir : 0;
      } else {
        // area or other
        aVal = (a[sortField as keyof Incident] || '').toString().toLowerCase();
        bVal = (b[sortField as keyof Incident] || '').toString().toLowerCase();
        return aVal < bVal ? sortDir : aVal > bVal ? -sortDir : 0;
      }
    });

    return result;
  }, [incidents, filters, sortField, sortDir]);

  /**
   * Create a new incident
   */
  const createIncident = useCallback(
    (data: Omit<Incident, 'id' | 'createdAt'>): Incident => {
      const newIncident: Incident = {
        ...data,
        id: generateIncidentId(),
        createdAt: new Date().toISOString(),
        area: extractArea(data.address),
        caseNotes: data.caseNotes || [],
      };

      setIncidents([...incidents, newIncident]);
      return newIncident;
    },
    [incidents, setIncidents]
  );

  /**
   * Update existing incident
   */
  const updateIncident = useCallback(
    (id: string, updates: Partial<Incident>) => {
      const index = incidents.findIndex((i) => i.id === id);
      if (index === -1) return;

      const updated = {
        ...incidents[index],
        ...updates,
        updatedAt: new Date().toISOString(),
        id, // Prevent ID changes
        createdAt: incidents[index].createdAt, // Prevent creation date changes
      };

      const newIncidents = [...incidents];
      newIncidents[index] = updated;
      setIncidents(newIncidents);
    },
    [incidents, setIncidents]
  );

  /**
   * Delete incident
   */
  const deleteIncident = useCallback(
    (id: string) => {
      setIncidents(incidents.filter((i) => i.id !== id));
    },
    [incidents, setIncidents]
  );

  /**
   * Get single incident by ID
   */
  const getIncident = useCallback(
    (id: string) => {
      return incidents.find((i) => i.id === id);
    },
    [incidents]
  );

  /**
   * Update filters
   */
  const applyFilters = useCallback((newFilters: FilterState) => {
    setFiltersState(newFilters);
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFiltersState({
      status: '',
      method: '',
      area: '',
    });
  }, []);

  /**
   * Set sorting field and direction
   */
  const setSort = useCallback(
    (field: 'date' | 'area' | 'status', direction?: 1 | -1) => {
      if (field === sortField && direction === undefined) {
        // Toggle direction if same field clicked
        setSortDir(sortDir === -1 ? 1 : -1);
      } else {
        setSortField(field);
        setSortDir(direction ?? -1);
      }
    },
    [sortField, sortDir]
  );

  /**
   * Search incidents by keyword across multiple fields
   */
  const searchIncidents = useCallback(
    (query: string): Incident[] => {
      const q = query.trim().toLowerCase();
      if (!q) return filteredIncidents;

      return filteredIncidents.filter((incident) => {
        const searchFields = [
          incident.id,
          incident.address,
          incident.area,
          incident.catName,
          incident.animalType,
          incident.animalDesc,
          incident.notes,
          incident.witnessName,
          incident.witnessStatement,
          incident.sightedDesc,
          incident.method,
          incident.severity,
        ];

        return searchFields.some(
          (field) => field && String(field).toLowerCase().includes(q)
        );
      });
    },
    [filteredIncidents]
  );

  /**
   * Add case note (intel) to incident
   */
  const addCaseNote = useCallback(
    (incidentId: string, text: string) => {
      const incident = incidents.find((i) => i.id === incidentId);
      if (!incident) return;

      if (!incident.caseNotes) {
        incident.caseNotes = [];
      }

      const newNote: CaseNote = {
        id: generateNoteId(),
        timestamp: new Date().toISOString(),
        text: text.trim(),
        author: 'System', // In future: current user name
      };

      updateIncident(incidentId, {
        caseNotes: [...incident.caseNotes, newNote],
      });
    },
    [incidents, updateIncident]
  );

  /**
   * Delete case note from incident
   */
  const deleteCaseNote = useCallback(
    (incidentId: string, noteId: string) => {
      const incident = incidents.find((i) => i.id === incidentId);
      if (!incident || !incident.caseNotes) return;

      updateIncident(incidentId, {
        caseNotes: incident.caseNotes.filter((note) => note.id !== noteId),
      });
    },
    [incidents, updateIncident]
  );

  /**
   * Get statistics about incidents
   */
  const getStats = useCallback(() => {
    const stats: Record<string, number> = {
      total: incidents.length,
      unconfirmed: 0,
      suspected: 0,
      confirmed: 0,
      sighted: 0,
    };

    incidents.forEach((inc) => {
      if (inc.status && inc.status in stats) {
        stats[inc.status]++;
      }
    });

    return stats;
  }, [incidents]);

  /**
   * Get list of unique areas
   */
  const getAreasList = useCallback(() => {
    const areas = [...new Set(incidents.map((i) => i.area).filter((a) => a && a !== 'Unknown'))].sort();
    return areas;
  }, [incidents]);

  return {
    incidents,
    filters,
    sortField,
    sortDir,
    filteredIncidents,

    createIncident,
    updateIncident,
    deleteIncident,
    getIncident,

    setFilters: applyFilters,
    clearFilters,
    applyFilters,

    setSort,

    searchIncidents,

    addCaseNote,
    deleteCaseNote,

    getStats,
    getAreasList,
  };
}
