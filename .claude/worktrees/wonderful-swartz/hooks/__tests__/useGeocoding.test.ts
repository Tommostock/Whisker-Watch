/**
 * useGeocoding Hook Tests
 * Tests address search, reverse geocoding, API integration, and error handling
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useGeocoding, geocodeAddress, reverseGeocodeCoordinates } from '../useGeocoding';

// Mock fetch globally
global.fetch = jest.fn();

describe('useGeocoding Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Address Search', () => {
    it('should search for addresses matching query', async () => {
      const mockResults = [
        {
          display_name: '10 Peckham Road, London, UK',
          lat: 51.475,
          lon: -0.062,
          address: { house_number: '10', road: 'Peckham Road' },
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults,
      });

      const { result } = renderHook(() => useGeocoding());

      let searchResults: any[] = [];
      await act(async () => {
        searchResults = await result.current.search('10 Peckham Road');
      });

      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].display_name).toBe('10 Peckham Road, London, UK');
      expect(searchResults[0].lat).toBe(51.475);
      expect(searchResults[0].lon).toBe(-0.062);
    });

    it('should return empty array for empty query', async () => {
      const { result } = renderHook(() => useGeocoding());

      let searchResults: any[] = [];
      await act(async () => {
        searchResults = await result.current.search('');
      });

      expect(searchResults).toEqual([]);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return empty array for whitespace-only query', async () => {
      const { result } = renderHook(() => useGeocoding());

      let searchResults: any[] = [];
      await act(async () => {
        searchResults = await result.current.search('   ');
      });

      expect(searchResults).toEqual([]);
    });

    it('should set searchLoading during search', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => [],
              }),
            100
          )
        )
      );

      const { result } = renderHook(() => useGeocoding());

      act(() => {
        result.current.search('test');
      });

      expect(result.current.searchLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.searchLoading).toBe(false);
      });
    });

    it('should handle API error responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useGeocoding());

      let searchResults: any[] = [];
      await act(async () => {
        searchResults = await result.current.search('test');
      });

      expect(searchResults).toEqual([]);
      expect(result.current.searchError).not.toBeNull();
      expect(result.current.searchError?.message).toMatch(/500/);
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() => useGeocoding());

      let searchResults: any[] = [];
      await act(async () => {
        searchResults = await result.current.search('test');
      });

      expect(searchResults).toEqual([]);
      expect(result.current.searchError).not.toBeNull();
      expect(result.current.searchError?.message).toMatch(/Network error/);
    });

    it('should convert string lat/lon to numbers', async () => {
      const mockResults = [
        {
          display_name: 'Test Address',
          lat: '51.475',
          lon: '-0.062',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults,
      });

      const { result } = renderHook(() => useGeocoding());

      let searchResults: any[] = [];
      await act(async () => {
        searchResults = await result.current.search('test');
      });

      expect(typeof searchResults[0].lat).toBe('number');
      expect(typeof searchResults[0].lon).toBe('number');
      expect(searchResults[0].lat).toBe(51.475);
      expect(searchResults[0].lon).toBe(-0.062);
    });

    it('should handle multiple search requests with race condition prevention', async () => {
      (global.fetch as jest.Mock)
        .mockImplementationOnce(() =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => [
                    { display_name: 'First', lat: 1, lon: 1 },
                  ],
                }),
              100
            )
          )
        )
        .mockImplementationOnce(() =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => [
                    { display_name: 'Second', lat: 2, lon: 2 },
                  ],
                }),
              10
            )
          )
        );

      const { result } = renderHook(() => useGeocoding());

      act(() => {
        result.current.search('first');
      });

      let finalResults: any[] = [];
      await act(async () => {
        finalResults = await result.current.search('second');
      });

      // Second request completes faster, so results should be from second query
      await waitFor(() => {
        expect(finalResults[0].display_name).toBe('Second');
      });
    });

    it('should add " UK" to search query', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const { result } = renderHook(() => useGeocoding());

      await act(async () => {
        await result.current.search('Croydon');
      });

      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(callUrl).toContain('q=Croydon');
      expect(callUrl).toContain('UK');
    });
  });

  describe('Reverse Geocoding', () => {
    it('should reverse geocode coordinates to address', async () => {
      const mockResult = {
        display_name: '10 Peckham Road, London, UK',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult,
      });

      const { result } = renderHook(() => useGeocoding());

      let address = '';
      await act(async () => {
        address = await result.current.reverseGeocode(51.475, -0.062);
      });

      expect(address).toBe('10 Peckham Road, London, UK');
    });

    it('should fallback to coordinates if display_name missing', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useGeocoding());

      let address = '';
      await act(async () => {
        address = await result.current.reverseGeocode(51.475, -0.062);
      });

      expect(address).toBe('51.4750, -0.0620');
    });

    it('should set reverseLoading during geocoding', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ display_name: 'Test' }),
              }),
            100
          )
        )
      );

      const { result } = renderHook(() => useGeocoding());

      act(() => {
        result.current.reverseGeocode(51.475, -0.062);
      });

      expect(result.current.reverseLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.reverseLoading).toBe(false);
      });
    });

    it('should handle reverse geocoding API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const { result } = renderHook(() => useGeocoding());

      let address = '';
      await act(async () => {
        address = await result.current.reverseGeocode(0, 0);
      });

      // Should return coordinates as fallback
      expect(address).toMatch(/0\.0000, 0\.0000/);
      expect(result.current.reverseError).not.toBeNull();
    });

    it('should handle reverse geocoding network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network timeout')
      );

      const { result } = renderHook(() => useGeocoding());

      let address = '';
      await act(async () => {
        address = await result.current.reverseGeocode(51.475, -0.062);
      });

      // Should return coordinates as fallback
      expect(address).toMatch(/51\./);
      expect(result.current.reverseError).not.toBeNull();
    });

    it('should handle multiple reverse geocoding requests with race condition prevention', async () => {
      (global.fetch as jest.Mock)
        .mockImplementationOnce(() =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ display_name: 'First Address' }),
                }),
              100
            )
          )
        )
        .mockImplementationOnce(() =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ display_name: 'Second Address' }),
                }),
              10
            )
          )
        );

      const { result } = renderHook(() => useGeocoding());

      act(() => {
        result.current.reverseGeocode(1, 1);
      });

      let address = '';
      await act(async () => {
        address = await result.current.reverseGeocode(2, 2);
      });

      // Second request completes faster
      await waitFor(() => {
        expect(address).toBe('Second Address');
      });
    });

    it('should format coordinates with 4 decimal places', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useGeocoding());

      let address = '';
      await act(async () => {
        address = await result.current.reverseGeocode(51.47534, -0.06202);
      });

      expect(address).toBe('51.4753, -0.0620');
    });
  });

  describe('Error Management', () => {
    it('should clear search errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useGeocoding());

      await act(async () => {
        await result.current.search('test');
      });

      expect(result.current.searchError).not.toBeNull();

      act(() => {
        result.current.clearErrors();
      });

      expect(result.current.searchError).toBeNull();
    });

    it('should clear reverse geocoding errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useGeocoding());

      await act(async () => {
        await result.current.reverseGeocode(51.475, -0.062);
      });

      expect(result.current.reverseError).not.toBeNull();

      act(() => {
        result.current.clearErrors();
      });

      expect(result.current.reverseError).toBeNull();
    });

    it('should clear both errors with clearErrors()', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        });

      const { result } = renderHook(() => useGeocoding());

      await act(async () => {
        await result.current.search('test');
      });

      await act(async () => {
        await result.current.reverseGeocode(51.475, -0.062);
      });

      expect(result.current.searchError).not.toBeNull();
      expect(result.current.reverseError).not.toBeNull();

      act(() => {
        result.current.clearErrors();
      });

      expect(result.current.searchError).toBeNull();
      expect(result.current.reverseError).toBeNull();
    });

    it('should clear search error on successful search', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        });

      const { result } = renderHook(() => useGeocoding());

      await act(async () => {
        await result.current.search('first');
      });

      expect(result.current.searchError).not.toBeNull();

      await act(async () => {
        await result.current.search('second');
      });

      expect(result.current.searchError).toBeNull();
    });
  });

  describe('Standalone Utilities', () => {
    it('geocodeAddress should search and return first result', async () => {
      const mockResults = [
        {
          display_name: 'Croydon, London',
          lat: 51.375,
          lon: -0.098,
        },
        {
          display_name: 'Croydon, Surrey',
          lat: 51.3,
          lon: -0.1,
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults,
      });

      const result = await geocodeAddress('Croydon');

      expect(result).not.toBeNull();
      expect(result?.display_name).toBe('Croydon, London');
      expect(result?.lat).toBe(51.375);
    });

    it('geocodeAddress should return null on API error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await geocodeAddress('test');

      expect(result).toBeNull();
    });

    it('geocodeAddress should return null for network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const result = await geocodeAddress('test');

      expect(result).toBeNull();
    });

    it('geocodeAddress should return null for empty results', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const result = await geocodeAddress('nowhere');

      expect(result).toBeNull();
    });

    it('reverseGeocodeCoordinates should return address string', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          display_name: '10 Peckham Road, London',
        }),
      });

      const result = await reverseGeocodeCoordinates(51.475, -0.062);

      expect(result).toBe('10 Peckham Road, London');
    });

    it('reverseGeocodeCoordinates should return null on API error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await reverseGeocodeCoordinates(51.475, -0.062);

      expect(result).toBeNull();
    });

    it('reverseGeocodeCoordinates should return null for network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Timeout')
      );

      const result = await reverseGeocodeCoordinates(51.475, -0.062);

      expect(result).toBeNull();
    });

    it('reverseGeocodeCoordinates should return null if display_name missing', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const result = await reverseGeocodeCoordinates(51.475, -0.062);

      expect(result).toBeNull();
    });
  });

  describe('API Request Details', () => {
    it('should include User-Agent header in requests', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const { result } = renderHook(() => useGeocoding());

      await act(async () => {
        await result.current.search('test');
      });

      const [, options] = (global.fetch as jest.Mock).mock.calls[0];
      expect(options.headers['User-Agent']).toBe('Whisker-Watch (https://github.com/Tommostock/Whisker-Watch)');
    });

    it('should include search parameters in search request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const { result } = renderHook(() => useGeocoding());

      await act(async () => {
        await result.current.search('Peckham');
      });

      const url = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(url).toContain('/search?');
      expect(url).toContain('q=Peckham');
    });

    it('should include reverse geocoding parameters', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ display_name: 'Test' }),
      });

      const { result } = renderHook(() => useGeocoding());

      await act(async () => {
        await result.current.reverseGeocode(51.475, -0.062);
      });

      const url = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(url).toContain('/reverse?');
      expect(url).toContain('lat=51.475');
      expect(url).toContain('lon=-0.062');
    });
  });
});
