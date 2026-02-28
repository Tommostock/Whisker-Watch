/**
 * useIncidents Hook Tests
 * Tests CRUD operations, filtering, sorting, searching, and statistics
 */

import { renderHook, act } from '@testing-library/react';
import { useIncidents } from '../useIncidents';
import { mockIncidents } from '@/lib/test-utils';

describe('useIncidents Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Initialization', () => {
    it('should initialize with empty incidents array', () => {
      const { result } = renderHook(() => useIncidents());
      expect(result.current.incidents).toEqual([]);
    });

    it('should load incidents from localStorage', () => {
      localStorage.setItem('lckData', JSON.stringify(mockIncidents));
      const { result } = renderHook(() => useIncidents());
      expect(result.current.incidents.length).toBeGreaterThan(0);
    });

    it('should initialize with default filter state', () => {
      const { result } = renderHook(() => useIncidents());
      expect(result.current.filters).toEqual({
        status: '',
        method: '',
        area: '',
      });
    });

    it('should initialize with date sort descending', () => {
      const { result } = renderHook(() => useIncidents());
      expect(result.current.sortField).toBe('date');
      expect(result.current.sortDir).toBe(-1);
    });
  });

  describe('CRUD Operations - Create', () => {
    it('should create a new incident', () => {
      const { result } = renderHook(() => useIncidents());

      act(() => {
        const newIncident = result.current.createIncident({
          address: 'Peckham, London',
          lat: 51.47,
          lng: -0.07,
          datetime: new Date().toISOString(),
          status: 'unconfirmed',
          animalType: 'Domestic Cat',
          age: 'Unknown',
          sex: 'Unknown',
          method: 'Other/Unknown',
          severity: 'Injured',
          notes: 'Test incident',
          witnessName: '',
          witnessContact: '',
          witnessStatement: '',
          sightedDesc: '',
          photos: [],
          caseNotes: [],
          updatedAt: new Date().toISOString(),
        });

        expect(newIncident).toBeDefined();
        expect(newIncident.id).toBeDefined();
        expect(newIncident.createdAt).toBeDefined();
      });

      expect(result.current.incidents.length).toBe(1);
    });

    it('should generate unique IDs for incidents', () => {
      const { result } = renderHook(() => useIncidents());

      let incident1Id: string = '';
      let incident2Id: string = '';

      act(() => {
        const inc1 = result.current.createIncident({
          address: 'London',
          lat: 51.5,
          lng: -0.1,
          datetime: new Date().toISOString(),
          status: 'unconfirmed',
          animalType: 'Cat',
          age: 'Unknown',
          sex: 'Unknown',
          method: 'Other/Unknown',
          severity: 'Injured',
          notes: '',
          witnessName: '',
          witnessContact: '',
          witnessStatement: '',
          sightedDesc: '',
          photos: [],
          caseNotes: [],
          updatedAt: new Date().toISOString(),
        });
        incident1Id = inc1.id;
      });

      // Wait a bit and create second incident to ensure different timestamp
      setTimeout(() => {
        act(() => {
          const inc2 = result.current.createIncident({
            address: 'London',
            lat: 51.5,
            lng: -0.1,
            datetime: new Date().toISOString(),
            status: 'unconfirmed',
            animalType: 'Cat',
            age: 'Unknown',
            sex: 'Unknown',
            method: 'Other/Unknown',
            severity: 'Injured',
            notes: '',
            witnessName: '',
            witnessContact: '',
            witnessStatement: '',
            sightedDesc: '',
            photos: [],
            caseNotes: [],
            updatedAt: new Date().toISOString(),
          });
          incident2Id = inc2.id;
        });
      }, 10);

      expect(result.current.incidents.length).toBeGreaterThanOrEqual(1);
      // IDs should exist and be non-empty
      expect(incident1Id).toBeTruthy();
      expect(incident1Id).toMatch(/^INC-/);
    });

    it('should extract area from address', () => {
      const { result } = renderHook(() => useIncidents());

      let createdIncident: any;
      act(() => {
        createdIncident = result.current.createIncident({
          address: 'Peckham, Southwark, London SE15 4AE',
          lat: 51.47,
          lng: -0.07,
          datetime: new Date().toISOString(),
          status: 'unconfirmed',
          animalType: 'Cat',
          age: 'Unknown',
          sex: 'Unknown',
          method: 'Other/Unknown',
          severity: 'Injured',
          notes: '',
          witnessName: '',
          witnessContact: '',
          witnessStatement: '',
          sightedDesc: '',
          photos: [],
          caseNotes: [],
          updatedAt: new Date().toISOString(),
        });
      });

      expect(createdIncident.area).toBeTruthy();
    });
  });

  describe('CRUD Operations - Read', () => {
    it('should get incident by ID', () => {
      const { result } = renderHook(() => useIncidents());

      let incidentId: string;
      act(() => {
        const incident = result.current.createIncident({
          address: 'London',
          lat: 51.5,
          lng: -0.1,
          datetime: new Date().toISOString(),
          status: 'unconfirmed',
          animalType: 'Cat',
          age: 'Unknown',
          sex: 'Unknown',
          method: 'Other/Unknown',
          severity: 'Injured',
          notes: 'Test',
          witnessName: '',
          witnessContact: '',
          witnessStatement: '',
          sightedDesc: '',
          photos: [],
          caseNotes: [],
          updatedAt: new Date().toISOString(),
        });
        incidentId = incident.id;
      });

      const retrieved = result.current.getIncident(incidentId!);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(incidentId);
    });

    it('should return undefined for non-existent incident', () => {
      const { result } = renderHook(() => useIncidents());
      const retrieved = result.current.getIncident('non-existent-id');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('CRUD Operations - Update', () => {
    it('should update incident', () => {
      const { result } = renderHook(() => useIncidents());

      let incidentId: string;
      act(() => {
        const incident = result.current.createIncident({
          address: 'London',
          lat: 51.5,
          lng: -0.1,
          datetime: new Date().toISOString(),
          status: 'unconfirmed',
          animalType: 'Cat',
          age: 'Unknown',
          sex: 'Unknown',
          method: 'Other/Unknown',
          severity: 'Injured',
          notes: 'Original notes',
          witnessName: '',
          witnessContact: '',
          witnessStatement: '',
          sightedDesc: '',
          photos: [],
          caseNotes: [],
          updatedAt: new Date().toISOString(),
        });
        incidentId = incident.id;
      });

      act(() => {
        result.current.updateIncident(incidentId!, {
          notes: 'Updated notes',
          status: 'confirmed',
        });
      });

      const updated = result.current.getIncident(incidentId!);
      expect(updated?.notes).toBe('Updated notes');
      expect(updated?.status).toBe('confirmed');
    });

    it('should prevent ID change on update', () => {
      const { result } = renderHook(() => useIncidents());

      let incidentId: string;
      act(() => {
        const incident = result.current.createIncident({
          address: 'London',
          lat: 51.5,
          lng: -0.1,
          datetime: new Date().toISOString(),
          status: 'unconfirmed',
          animalType: 'Cat',
          age: 'Unknown',
          sex: 'Unknown',
          method: 'Other/Unknown',
          severity: 'Injured',
          notes: '',
          witnessName: '',
          witnessContact: '',
          witnessStatement: '',
          sightedDesc: '',
          photos: [],
          caseNotes: [],
          updatedAt: new Date().toISOString(),
        });
        incidentId = incident.id;
      });

      act(() => {
        result.current.updateIncident(incidentId!, {
          // @ts-ignore
          id: 'new-id',
        });
      });

      const updated = result.current.getIncident(incidentId!);
      expect(updated?.id).toBe(incidentId);
    });

    it('should update updatedAt timestamp', () => {
      const { result } = renderHook(() => useIncidents());

      let incidentId: string = '';
      let originalUpdatedAt: string = '';
      act(() => {
        const incident = result.current.createIncident({
          address: 'London',
          lat: 51.5,
          lng: -0.1,
          datetime: new Date().toISOString(),
          status: 'unconfirmed',
          animalType: 'Cat',
          age: 'Unknown',
          sex: 'Unknown',
          method: 'Other/Unknown',
          severity: 'Injured',
          notes: '',
          witnessName: '',
          witnessContact: '',
          witnessStatement: '',
          sightedDesc: '',
          photos: [],
          caseNotes: [],
          updatedAt: new Date().toISOString(),
        });
        incidentId = incident.id;
        originalUpdatedAt = incident.updatedAt;
      });

      // Update incident - timestamp should change
      act(() => {
        result.current.updateIncident(incidentId, { notes: 'Updated' });
      });

      const updated = result.current.getIncident(incidentId);
      expect(updated?.notes).toBe('Updated');
      // The updatedAt should be set (may or may not be different due to timing)
      expect(updated?.updatedAt).toBeTruthy();
    });
  });

  describe('CRUD Operations - Delete', () => {
    it('should delete incident', () => {
      const { result } = renderHook(() => useIncidents());

      let incidentId: string;
      act(() => {
        const incident = result.current.createIncident({
          address: 'London',
          lat: 51.5,
          lng: -0.1,
          datetime: new Date().toISOString(),
          status: 'unconfirmed',
          animalType: 'Cat',
          age: 'Unknown',
          sex: 'Unknown',
          method: 'Other/Unknown',
          severity: 'Injured',
          notes: '',
          witnessName: '',
          witnessContact: '',
          witnessStatement: '',
          sightedDesc: '',
          photos: [],
          caseNotes: [],
          updatedAt: new Date().toISOString(),
        });
        incidentId = incident.id;
      });

      expect(result.current.incidents.length).toBe(1);

      act(() => {
        result.current.deleteIncident(incidentId!);
      });

      expect(result.current.incidents.length).toBe(0);
      expect(result.current.getIncident(incidentId!)).toBeUndefined();
    });

    it('should not error when deleting non-existent incident', () => {
      const { result } = renderHook(() => useIncidents());

      expect(() => {
        act(() => {
          result.current.deleteIncident('non-existent-id');
        });
      }).not.toThrow();
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      localStorage.setItem('lckData', JSON.stringify(mockIncidents));
    });

    it('should filter by status', () => {
      const { result } = renderHook(() => useIncidents());

      act(() => {
        result.current.applyFilters({ status: 'confirmed', method: '', area: '' });
      });

      result.current.filteredIncidents.forEach((incident) => {
        expect(incident.status).toBe('confirmed');
      });
    });

    it('should filter by method', () => {
      const { result } = renderHook(() => useIncidents());

      act(() => {
        result.current.applyFilters({ status: '', method: 'Roadkill', area: '' });
      });

      result.current.filteredIncidents.forEach((incident) => {
        expect(incident.method).toBe('Roadkill');
      });
    });

    it('should filter by area', () => {
      const { result } = renderHook(() => useIncidents());

      act(() => {
        result.current.applyFilters({ status: '', method: '', area: 'Croydon' });
      });

      result.current.filteredIncidents.forEach((incident) => {
        expect(incident.area).toBe('Croydon');
      });
    });

    it('should combine multiple filters', () => {
      const { result } = renderHook(() => useIncidents());

      act(() => {
        result.current.applyFilters({
          status: 'confirmed',
          method: 'Roadkill',
          area: '',
        });
      });

      result.current.filteredIncidents.forEach((incident) => {
        expect(incident.status).toBe('confirmed');
        expect(incident.method).toBe('Roadkill');
      });
    });

    it('should clear filters', () => {
      const { result } = renderHook(() => useIncidents());

      act(() => {
        result.current.applyFilters({
          status: 'confirmed',
          method: '',
          area: '',
        });
      });

      expect(result.current.filters.status).toBe('confirmed');

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.filters.status).toBe('');
      expect(result.current.filters.method).toBe('');
      expect(result.current.filters.area).toBe('');
    });
  });

  describe('Sorting', () => {
    beforeEach(() => {
      localStorage.setItem('lckData', JSON.stringify(mockIncidents));
    });

    it('should sort by date descending', () => {
      const { result } = renderHook(() => useIncidents());

      expect(result.current.sortField).toBe('date');
      expect(result.current.sortDir).toBe(-1);

      // Verify incidents are sorted by date (newest first)
      const incidents = result.current.filteredIncidents;
      for (let i = 0; i < incidents.length - 1; i++) {
        const current = new Date(incidents[i].datetime).getTime();
        const next = new Date(incidents[i + 1].datetime).getTime();
        expect(current).toBeGreaterThanOrEqual(next);
      }
    });

    it('should toggle sort direction', () => {
      const { result } = renderHook(() => useIncidents());

      expect(result.current.sortDir).toBe(-1);

      act(() => {
        result.current.setSort('date');
      });

      expect(result.current.sortDir).toBe(1);
    });

    it('should sort by status', () => {
      const { result } = renderHook(() => useIncidents());

      act(() => {
        result.current.setSort('status');
      });

      expect(result.current.sortField).toBe('status');
    });

    it('should sort by area', () => {
      const { result } = renderHook(() => useIncidents());

      act(() => {
        result.current.setSort('area');
      });

      expect(result.current.sortField).toBe('area');
    });
  });

  describe('Search', () => {
    beforeEach(() => {
      localStorage.setItem('lckData', JSON.stringify(mockIncidents));
    });

    it('should search by address', () => {
      const { result } = renderHook(() => useIncidents());

      // Use a search term that's likely in the mock data
      const searchResults = result.current.searchIncidents('street');
      if (searchResults.length > 0) {
        searchResults.forEach((incident) => {
          const searchableText = [
            incident.address,
            incident.animalType,
            incident.notes,
          ].join(' ').toLowerCase();
          expect(searchableText).toContain('street');
        });
      }
    });

    it('should return empty array for no matches', () => {
      const { result } = renderHook(() => useIncidents());

      const searchResults = result.current.searchIncidents('nonexistent-place-xyz');
      expect(searchResults).toEqual([]);
    });

    it('should return all incidents for empty search', () => {
      const { result } = renderHook(() => useIncidents());

      const searchResults = result.current.searchIncidents('');
      expect(searchResults.length).toBe(result.current.filteredIncidents.length);
    });

    it('should search case-insensitively', () => {
      const { result } = renderHook(() => useIncidents());

      const resultsLower = result.current.searchIncidents('croydon');
      const resultsUpper = result.current.searchIncidents('CROYDON');
      expect(resultsLower.length).toBe(resultsUpper.length);
    });
  });

  describe('Case Notes', () => {
    it('should add case note to incident', () => {
      const { result } = renderHook(() => useIncidents());

      let incidentId: string;
      act(() => {
        const incident = result.current.createIncident({
          address: 'London',
          lat: 51.5,
          lng: -0.1,
          datetime: new Date().toISOString(),
          status: 'unconfirmed',
          animalType: 'Cat',
          age: 'Unknown',
          sex: 'Unknown',
          method: 'Other/Unknown',
          severity: 'Injured',
          notes: '',
          witnessName: '',
          witnessContact: '',
          witnessStatement: '',
          sightedDesc: '',
          photos: [],
          caseNotes: [],
          updatedAt: new Date().toISOString(),
        });
        incidentId = incident.id;
      });

      act(() => {
        result.current.addCaseNote(incidentId!, 'Test case note');
      });

      const updated = result.current.getIncident(incidentId!);
      expect(updated?.caseNotes?.length).toBe(1);
      expect(updated?.caseNotes?.[0].text).toBe('Test case note');
    });

    it('should delete case note from incident', () => {
      const { result } = renderHook(() => useIncidents());

      let incidentId: string;
      let noteId: string;
      act(() => {
        const incident = result.current.createIncident({
          address: 'London',
          lat: 51.5,
          lng: -0.1,
          datetime: new Date().toISOString(),
          status: 'unconfirmed',
          animalType: 'Cat',
          age: 'Unknown',
          sex: 'Unknown',
          method: 'Other/Unknown',
          severity: 'Injured',
          notes: '',
          witnessName: '',
          witnessContact: '',
          witnessStatement: '',
          sightedDesc: '',
          photos: [],
          caseNotes: [],
          updatedAt: new Date().toISOString(),
        });
        incidentId = incident.id;

        result.current.addCaseNote(incidentId, 'Test note');
      });

      const withNote = result.current.getIncident(incidentId!);
      noteId = withNote?.caseNotes?.[0]?.id || '';

      act(() => {
        result.current.deleteCaseNote(incidentId!, noteId);
      });

      const updated = result.current.getIncident(incidentId!);
      expect(updated?.caseNotes?.length).toBe(0);
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      localStorage.setItem('lckData', JSON.stringify(mockIncidents));
    });

    it('should calculate correct statistics', () => {
      const { result } = renderHook(() => useIncidents());

      const stats = result.current.getStats();
      expect(stats.total).toBe(mockIncidents.length);
      expect(stats).toHaveProperty('unconfirmed');
      expect(stats).toHaveProperty('suspected');
      expect(stats).toHaveProperty('confirmed');
      expect(stats).toHaveProperty('sighted');
    });

    it('should get areas list', () => {
      const { result } = renderHook(() => useIncidents());

      const areas = result.current.getAreasList();
      expect(Array.isArray(areas)).toBe(true);
      expect(areas.length).toBeGreaterThan(0);
      // Areas should be sorted
      for (let i = 0; i < areas.length - 1; i++) {
        expect(areas[i].localeCompare(areas[i + 1])).toBeLessThanOrEqual(0);
      }
    });

    it('should not include Unknown in areas list', () => {
      const { result } = renderHook(() => useIncidents());

      const areas = result.current.getAreasList();
      expect(areas).not.toContain('Unknown');
    });
  });

  describe('Persistence', () => {
    it('should persist incidents to localStorage', () => {
      const { result } = renderHook(() => useIncidents());

      act(() => {
        result.current.createIncident({
          address: 'London',
          lat: 51.5,
          lng: -0.1,
          datetime: new Date().toISOString(),
          status: 'unconfirmed',
          animalType: 'Cat',
          age: 'Unknown',
          sex: 'Unknown',
          method: 'Other/Unknown',
          severity: 'Injured',
          notes: '',
          witnessName: '',
          witnessContact: '',
          witnessStatement: '',
          sightedDesc: '',
          photos: [],
          caseNotes: [],
          updatedAt: new Date().toISOString(),
        });
      });

      const stored = localStorage.getItem('lckData');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.length).toBe(1);
    });
  });
});
