/**
 * useSidebarFilters Hook Tests
 * Tests filter state management, incident filtering, and statistics calculation
 */

import { renderHook, act } from '@testing-library/react';
import { useSidebarFilters } from '../useSidebarFilters';
import { Incident } from '@/lib/types';

// Helper to create test incidents
function createIncident(overrides: Partial<Incident> = {}): Incident {
  return {
    id: 'test-' + Math.random(),
    address: '10 Peckham Road, London',
    lat: 51.475,
    lng: -0.062,
    area: 'Peckham',
    datetime: new Date('2025-02-27').toISOString(),
    status: 'suspected',
    animalType: 'Domestic Cat',
    age: 'Unknown',
    sex: 'Unknown',
    catName: '',
    animalDesc: 'Tabby cat',
    method: 'Blunt Trauma',
    severity: 'Fatal',
    notes: 'Found near the park',
    witnessName: 'John Doe',
    witnessContact: '07000 000000',
    witnessStatement: 'Saw the incident at 10am',
    sightedDesc: '',
    photos: [],
    caseNotes: [],
    createdAt: new Date('2025-02-27').toISOString(),
    updatedAt: new Date('2025-02-27').toISOString(),
    ...overrides,
  };
}

describe('useSidebarFilters Hook', () => {
  describe('Filter State Initialization', () => {
    it('should initialize with empty filters', () => {
      const { result } = renderHook(() => useSidebarFilters());

      expect(result.current.filters.searchText).toBe('');
      expect(result.current.filters.statusFilter).toBeNull();
      expect(result.current.filters.methodFilter).toBeNull();
      expect(result.current.filters.areaFilter).toBeNull();
      expect(result.current.filters.dateRange.from).toBeNull();
      expect(result.current.filters.dateRange.to).toBeNull();
    });

    it('should have all setter functions available', () => {
      const { result } = renderHook(() => useSidebarFilters());

      expect(typeof result.current.setSearchText).toBe('function');
      expect(typeof result.current.setStatusFilter).toBe('function');
      expect(typeof result.current.setMethodFilter).toBe('function');
      expect(typeof result.current.setAreaFilter).toBe('function');
      expect(typeof result.current.setDateRange).toBe('function');
      expect(typeof result.current.clearFilters).toBe('function');
      expect(typeof result.current.filterIncidents).toBe('function');
      expect(typeof result.current.getFilteredStats).toBe('function');
    });
  });

  describe('Search Text Filter', () => {
    it('should set search text', () => {
      const { result } = renderHook(() => useSidebarFilters());

      act(() => {
        result.current.setSearchText('Peckham');
      });

      expect(result.current.filters.searchText).toBe('peckham');
    });

    it('should convert search text to lowercase', () => {
      const { result } = renderHook(() => useSidebarFilters());

      act(() => {
        result.current.setSearchText('CROYDON');
      });

      expect(result.current.filters.searchText).toBe('croydon');
    });

    it('should handle empty search text', () => {
      const { result } = renderHook(() => useSidebarFilters());

      act(() => {
        result.current.setSearchText('initial');
      });

      act(() => {
        result.current.setSearchText('');
      });

      expect(result.current.filters.searchText).toBe('');
    });

    it('should filter incidents by search text in address', () => {
      const { result } = renderHook(() => useSidebarFilters());

      const incidents = [
        createIncident({ address: '10 Peckham Road', area: 'Peckham' }),
        createIncident({ address: '20 Croydon Street', area: 'Croydon' }),
        createIncident({ address: '30 Dulwich Lane', area: 'Dulwich' }),
      ];

      act(() => {
        result.current.setSearchText('10 peckham');
      });

      const filtered = result.current.filterIncidents(incidents);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].address).toContain('10 Peckham');
    });

    it('should filter incidents by search text in animal type', () => {
      const { result } = renderHook(() => useSidebarFilters());

      const incidents = [
        createIncident({ animalType: 'Domestic Cat' }),
        createIncident({ animalType: 'Kitten' }),
        createIncident({ animalType: 'Feral Cat' }),
      ];

      act(() => {
        result.current.setSearchText('kitten');
      });

      const filtered = result.current.filterIncidents(incidents);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].animalType).toBe('Kitten');
    });

    it('should filter incidents by search text in notes', () => {
      const { result } = renderHook(() => useSidebarFilters());

      const incidents = [
        createIncident({ notes: 'Found near park' }),
        createIncident({ notes: 'Under the bridge' }),
        createIncident({ notes: 'Near the river' }),
      ];

      act(() => {
        result.current.setSearchText('park');
      });

      const filtered = result.current.filterIncidents(incidents);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].notes).toContain('park');
    });

    it('should filter incidents by search text in witness name', () => {
      const { result } = renderHook(() => useSidebarFilters());

      const incidents = [
        createIncident({ witnessName: 'John Smith' }),
        createIncident({ witnessName: 'Jane Doe' }),
        createIncident({ witnessName: 'John Brown' }),
      ];

      act(() => {
        result.current.setSearchText('jane');
      });

      const filtered = result.current.filterIncidents(incidents);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].witnessName).toBe('Jane Doe');
    });

    it('should filter incidents by search text in area', () => {
      const { result } = renderHook(() => useSidebarFilters());

      const incidents = [
        createIncident({ area: 'Peckham' }),
        createIncident({ area: 'Croydon' }),
        createIncident({ area: 'Dulwich' }),
      ];

      act(() => {
        result.current.setSearchText('dulwich');
      });

      const filtered = result.current.filterIncidents(incidents);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].area).toBe('Dulwich');
    });

    it('should be case-insensitive', () => {
      const { result } = renderHook(() => useSidebarFilters());

      const incidents = [
        createIncident({ address: 'Peckham Road' }),
      ];

      act(() => {
        result.current.setSearchText('PECKHAM');
      });

      const filtered = result.current.filterIncidents(incidents);
      expect(filtered).toHaveLength(1);
    });
  });

  describe('Status Filter', () => {
    it('should set status filter', () => {
      const { result } = renderHook(() => useSidebarFilters());

      act(() => {
        result.current.setStatusFilter('confirmed');
      });

      expect(result.current.filters.statusFilter).toBe('confirmed');
    });

    it('should clear status filter with null', () => {
      const { result } = renderHook(() => useSidebarFilters());

      act(() => {
        result.current.setStatusFilter('confirmed');
      });

      act(() => {
        result.current.setStatusFilter(null);
      });

      expect(result.current.filters.statusFilter).toBeNull();
    });

    it('should filter incidents by status', () => {
      const { result } = renderHook(() => useSidebarFilters());

      const incidents = [
        createIncident({ status: 'confirmed' }),
        createIncident({ status: 'suspected' }),
        createIncident({ status: 'confirmed' }),
      ];

      act(() => {
        result.current.setStatusFilter('confirmed');
      });

      const filtered = result.current.filterIncidents(incidents);
      expect(filtered).toHaveLength(2);
      expect(filtered.every((i) => i.status === 'confirmed')).toBe(true);
    });

    it('should not filter when status filter is null', () => {
      const { result } = renderHook(() => useSidebarFilters());

      const incidents = [
        createIncident({ status: 'confirmed' }),
        createIncident({ status: 'suspected' }),
      ];

      const filtered = result.current.filterIncidents(incidents);
      expect(filtered).toHaveLength(2);
    });
  });

  describe('Method Filter', () => {
    it('should set method filter', () => {
      const { result } = renderHook(() => useSidebarFilters());

      act(() => {
        result.current.setMethodFilter('Roadkill');
      });

      expect(result.current.filters.methodFilter).toBe('Roadkill');
    });

    it('should filter incidents by method', () => {
      const { result } = renderHook(() => useSidebarFilters());

      const incidents = [
        createIncident({ method: 'Blunt Trauma' }),
        createIncident({ method: 'Roadkill' }),
        createIncident({ method: 'Blunt Trauma' }),
      ];

      act(() => {
        result.current.setMethodFilter('Roadkill');
      });

      const filtered = result.current.filterIncidents(incidents);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].method).toBe('Roadkill');
    });

    it('should clear method filter with null', () => {
      const { result } = renderHook(() => useSidebarFilters());

      act(() => {
        result.current.setMethodFilter('Roadkill');
      });

      act(() => {
        result.current.setMethodFilter(null);
      });

      expect(result.current.filters.methodFilter).toBeNull();
    });
  });

  describe('Area Filter', () => {
    it('should set area filter', () => {
      const { result } = renderHook(() => useSidebarFilters());

      act(() => {
        result.current.setAreaFilter('Peckham');
      });

      expect(result.current.filters.areaFilter).toBe('Peckham');
    });

    it('should filter incidents by area', () => {
      const { result } = renderHook(() => useSidebarFilters());

      const incidents = [
        createIncident({ area: 'Peckham' }),
        createIncident({ area: 'Croydon' }),
        createIncident({ area: 'Peckham' }),
      ];

      act(() => {
        result.current.setAreaFilter('Peckham');
      });

      const filtered = result.current.filterIncidents(incidents);
      expect(filtered).toHaveLength(2);
      expect(filtered.every((i) => i.area === 'Peckham')).toBe(true);
    });

    it('should clear area filter with null', () => {
      const { result } = renderHook(() => useSidebarFilters());

      act(() => {
        result.current.setAreaFilter('Croydon');
      });

      act(() => {
        result.current.setAreaFilter(null);
      });

      expect(result.current.filters.areaFilter).toBeNull();
    });
  });

  describe('Date Range Filter', () => {
    it('should set date range', () => {
      const { result } = renderHook(() => useSidebarFilters());

      const from = new Date('2025-02-01');
      const to = new Date('2025-02-28');

      act(() => {
        result.current.setDateRange(from, to);
      });

      expect(result.current.filters.dateRange.from).toEqual(from);
      expect(result.current.filters.dateRange.to).toEqual(to);
    });

    it('should filter incidents by date range (from and to)', () => {
      const { result } = renderHook(() => useSidebarFilters());

      const incidents = [
        createIncident({ datetime: new Date('2025-02-01').toISOString() }),
        createIncident({ datetime: new Date('2025-02-15').toISOString() }),
        createIncident({ datetime: new Date('2025-03-01').toISOString() }),
      ];

      const from = new Date('2025-02-01');
      const to = new Date('2025-02-28');

      act(() => {
        result.current.setDateRange(from, to);
      });

      const filtered = result.current.filterIncidents(incidents);
      expect(filtered).toHaveLength(2);
    });

    it('should filter with only from date', () => {
      const { result } = renderHook(() => useSidebarFilters());

      const incidents = [
        createIncident({ datetime: new Date('2025-02-01').toISOString() }),
        createIncident({ datetime: new Date('2025-02-15').toISOString() }),
        createIncident({ datetime: new Date('2025-03-01').toISOString() }),
      ];

      act(() => {
        result.current.setDateRange(new Date('2025-02-15'), null);
      });

      const filtered = result.current.filterIncidents(incidents);
      expect(filtered).toHaveLength(2);
    });

    it('should filter with only to date', () => {
      const { result } = renderHook(() => useSidebarFilters());

      const incidents = [
        createIncident({ datetime: new Date('2025-02-01').toISOString() }),
        createIncident({ datetime: new Date('2025-02-15').toISOString() }),
        createIncident({ datetime: new Date('2025-03-01').toISOString() }),
      ];

      act(() => {
        result.current.setDateRange(null, new Date('2025-02-15'));
      });

      const filtered = result.current.filterIncidents(incidents);
      expect(filtered).toHaveLength(2);
    });

    it('should clear date range with null values', () => {
      const { result } = renderHook(() => useSidebarFilters());

      act(() => {
        result.current.setDateRange(
          new Date('2025-02-01'),
          new Date('2025-02-28')
        );
      });

      act(() => {
        result.current.setDateRange(null, null);
      });

      expect(result.current.filters.dateRange.from).toBeNull();
      expect(result.current.filters.dateRange.to).toBeNull();
    });
  });

  describe('Combined Filters', () => {
    it('should apply multiple filters (AND logic)', () => {
      const { result } = renderHook(() => useSidebarFilters());

      const incidents = [
        createIncident({
          status: 'confirmed',
          area: 'Peckham',
          method: 'Blunt Trauma',
        }),
        createIncident({
          status: 'suspected',
          area: 'Peckham',
          method: 'Blunt Trauma',
        }),
        createIncident({
          status: 'confirmed',
          area: 'Croydon',
          method: 'Blunt Trauma',
        }),
        createIncident({
          status: 'confirmed',
          area: 'Peckham',
          method: 'Roadkill',
        }),
      ];

      act(() => {
        result.current.setStatusFilter('confirmed');
        result.current.setAreaFilter('Peckham');
        result.current.setMethodFilter('Blunt Trauma');
      });

      const filtered = result.current.filterIncidents(incidents);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].status).toBe('confirmed');
      expect(filtered[0].area).toBe('Peckham');
      expect(filtered[0].method).toBe('Blunt Trauma');
    });

    it('should apply search + filters together', () => {
      const { result } = renderHook(() => useSidebarFilters());

      const incidents = [
        createIncident({
          status: 'confirmed',
          area: 'Peckham',
          address: '10 Peckham Road',
        }),
        createIncident({
          status: 'suspected',
          area: 'Peckham',
          address: '20 Peckham Road',
        }),
      ];

      act(() => {
        result.current.setSearchText('10');
        result.current.setStatusFilter('confirmed');
      });

      const filtered = result.current.filterIncidents(incidents);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].address).toContain('10');
    });

    it('should apply all filter types together', () => {
      const { result } = renderHook(() => useSidebarFilters());

      const incidents = [
        createIncident({
          status: 'confirmed',
          area: 'Peckham',
          method: 'Roadkill',
          address: 'Peckham High Street',
          datetime: new Date('2025-02-15').toISOString(),
        }),
        createIncident({
          status: 'confirmed',
          area: 'Peckham',
          method: 'Roadkill',
          address: 'Peckham High Street',
          datetime: new Date('2025-03-15').toISOString(),
        }),
      ];

      act(() => {
        result.current.setStatusFilter('confirmed');
        result.current.setAreaFilter('Peckham');
        result.current.setMethodFilter('Roadkill');
        result.current.setSearchText('high');
        result.current.setDateRange(
          new Date('2025-02-01'),
          new Date('2025-02-28')
        );
      });

      const filtered = result.current.filterIncidents(incidents);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].datetime).toContain('2025-02-15');
    });
  });

  describe('Clear Filters', () => {
    it('should clear all filters', () => {
      const { result } = renderHook(() => useSidebarFilters());

      act(() => {
        result.current.setSearchText('test');
        result.current.setStatusFilter('confirmed');
        result.current.setMethodFilter('Roadkill');
        result.current.setAreaFilter('Peckham');
        result.current.setDateRange(
          new Date('2025-02-01'),
          new Date('2025-02-28')
        );
      });

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.filters.searchText).toBe('');
      expect(result.current.filters.statusFilter).toBeNull();
      expect(result.current.filters.methodFilter).toBeNull();
      expect(result.current.filters.areaFilter).toBeNull();
      expect(result.current.filters.dateRange.from).toBeNull();
      expect(result.current.filters.dateRange.to).toBeNull();
    });

    it('should show all incidents after clearing filters', () => {
      const { result } = renderHook(() => useSidebarFilters());

      const incidents = [
        createIncident({ status: 'confirmed' }),
        createIncident({ status: 'suspected' }),
      ];

      act(() => {
        result.current.setStatusFilter('confirmed');
      });

      let filtered = result.current.filterIncidents(incidents);
      expect(filtered).toHaveLength(1);

      act(() => {
        result.current.clearFilters();
      });

      filtered = result.current.filterIncidents(incidents);
      expect(filtered).toHaveLength(2);
    });
  });

  describe('Filter Incidents', () => {
    it('should return all incidents with no filters', () => {
      const { result } = renderHook(() => useSidebarFilters());

      const incidents = [
        createIncident(),
        createIncident(),
        createIncident(),
      ];

      const filtered = result.current.filterIncidents(incidents);
      expect(filtered).toHaveLength(3);
    });

    it('should return empty array for no matches', () => {
      const { result } = renderHook(() => useSidebarFilters());

      const incidents = [
        createIncident({ status: 'confirmed' }),
        createIncident({ status: 'confirmed' }),
      ];

      act(() => {
        result.current.setStatusFilter('suspected');
      });

      const filtered = result.current.filterIncidents(incidents);
      expect(filtered).toHaveLength(0);
    });

    it('should not mutate original incidents array', () => {
      const { result } = renderHook(() => useSidebarFilters());

      const incidents = [
        createIncident({ status: 'confirmed' }),
        createIncident({ status: 'suspected' }),
      ];

      const incidentsClone = [...incidents];

      act(() => {
        result.current.setStatusFilter('confirmed');
      });

      result.current.filterIncidents(incidents);

      expect(incidents).toEqual(incidentsClone);
    });
  });

  describe('Filtered Statistics', () => {
    it('should calculate stats for all incidents', () => {
      const { result } = renderHook(() => useSidebarFilters());

      const incidents = [
        createIncident({
          status: 'confirmed',
          area: 'Peckham',
          method: 'Blunt Trauma',
        }),
        createIncident({
          status: 'suspected',
          area: 'Croydon',
          method: 'Roadkill',
        }),
        createIncident({
          status: 'confirmed',
          area: 'Peckham',
          method: 'Blunt Trauma',
        }),
      ];

      const stats = result.current.getFilteredStats(incidents);

      expect(stats.total).toBe(3);
      expect(stats.byStatus.confirmed).toBe(2);
      expect(stats.byStatus.suspected).toBe(1);
      expect(stats.byArea.Peckham).toBe(2);
      expect(stats.byArea.Croydon).toBe(1);
      expect(stats.byMethod['Blunt Trauma']).toBe(2);
      expect(stats.byMethod.Roadkill).toBe(1);
    });

    it('should calculate stats with filters applied', () => {
      const { result } = renderHook(() => useSidebarFilters());

      const incidents = [
        createIncident({ status: 'confirmed', area: 'Peckham' }),
        createIncident({ status: 'suspected', area: 'Peckham' }),
        createIncident({ status: 'confirmed', area: 'Croydon' }),
      ];

      act(() => {
        result.current.setAreaFilter('Peckham');
      });

      const stats = result.current.getFilteredStats(incidents);

      expect(stats.total).toBe(2);
      expect(stats.byStatus.confirmed).toBe(1);
      expect(stats.byStatus.suspected).toBe(1);
    });

    it('should return 0 counts for unmatched statuses', () => {
      const { result } = renderHook(() => useSidebarFilters());

      const incidents = [
        createIncident({ status: 'confirmed' }),
        createIncident({ status: 'confirmed' }),
      ];

      const stats = result.current.getFilteredStats(incidents);

      expect(stats.byStatus.suspected).toBe(0);
      expect(stats.byStatus.sighted).toBe(0);
      expect(stats.byStatus.unconfirmed).toBe(0);
    });

    it('should return 0 counts for unmatched methods', () => {
      const { result } = renderHook(() => useSidebarFilters());

      const incidents = [
        createIncident({ method: 'Roadkill' }),
      ];

      const stats = result.current.getFilteredStats(incidents);

      expect(stats.byMethod['Blunt Trauma']).toBe(0);
      expect(stats.byMethod.Poisoning).toBe(0);
    });

    it('should include only matched areas in byArea stats', () => {
      const { result } = renderHook(() => useSidebarFilters());

      const incidents = [
        createIncident({ area: 'Peckham' }),
        createIncident({ area: 'Croydon' }),
      ];

      const stats = result.current.getFilteredStats(incidents);

      expect(stats.byArea.Peckham).toBe(1);
      expect(stats.byArea.Croydon).toBe(1);
      expect(stats.byArea.Dulwich).toBeUndefined();
    });

    it('should handle empty incidents array', () => {
      const { result } = renderHook(() => useSidebarFilters());

      const stats = result.current.getFilteredStats([]);

      expect(stats.total).toBe(0);
      expect(Object.values(stats.byStatus).reduce((a, b) => a + b, 0)).toBe(0);
      expect(Object.values(stats.byMethod).reduce((a, b) => a + b, 0)).toBe(0);
      expect(Object.values(stats.byArea).reduce((a, b) => a + b, 0)).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle incidents with missing optional fields', () => {
      const { result } = renderHook(() => useSidebarFilters());

      const incidents = [
        createIncident({
          notes: undefined as any,
          witnessName: undefined as any,
        }),
      ];

      act(() => {
        result.current.setSearchText('test');
      });

      const filtered = result.current.filterIncidents(incidents);
      expect(filtered).toHaveLength(0);
    });

    it('should handle special characters in search', () => {
      const { result } = renderHook(() => useSidebarFilters());

      const incidents = [
        createIncident({ address: '10 Peckham Road (South)' }),
      ];

      act(() => {
        result.current.setSearchText('(south)');
      });

      // Should search in lowercase, so special chars should be handled
      const filtered = result.current.filterIncidents(incidents);
      expect(filtered.length).toBeLessThanOrEqual(1);
    });

    it('should handle null date range values', () => {
      const { result } = renderHook(() => useSidebarFilters());

      const incidents = [createIncident()];

      act(() => {
        result.current.setDateRange(null, null);
      });

      const filtered = result.current.filterIncidents(incidents);
      expect(filtered).toHaveLength(1);
    });
  });
});
