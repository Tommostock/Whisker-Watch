/**
 * useGeocoding Hook
 * Integrates with Nominatim API for address search and reverse geocoding
 * Handles API requests, caching, and error handling
 */

import { useState, useCallback, useRef } from 'react';
import {
  NOMINATIM_API,
  NOMINATIM_SEARCH_PARAMS,
  NOMINATIM_REVERSE_PARAMS,
  API_TIMEOUT,
} from '@/lib/constants';
import { GeocodeResult } from '@/lib/types';

interface SearchResult {
  display_name: string;
  lat: number;
  lon: number;
  address?: Record<string, string>;
}

interface UseGeocodingReturn {
  // Search
  search: (query: string) => Promise<SearchResult[]>;
  searchLoading: boolean;
  searchError: Error | null;

  // Reverse geocoding
  reverseGeocode: (lat: number, lon: number) => Promise<string>;
  reverseLoading: boolean;
  reverseError: Error | null;

  // Clear errors
  clearErrors: () => void;
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(
  url: string,
  timeout: number = API_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Whisker-Watch (https://github.com/Tommostock/Whisker-Watch)',
      },
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * useGeocoding hook - handles address search and reverse geocoding
 */
export function useGeocoding(): UseGeocodingReturn {
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<Error | null>(null);

  const [reverseLoading, setReverseLoading] = useState(false);
  const [reverseError, setReverseError] = useState<Error | null>(null);

  // Track request IDs to prevent race conditions
  const searchRequestIdRef = useRef<number>(0);
  const reverseRequestIdRef = useRef<number>(0);

  /**
   * Search for addresses matching query
   */
  const search = useCallback(async (query: string): Promise<SearchResult[]> => {
    if (!query.trim()) {
      return [];
    }

    setSearchLoading(true);
    setSearchError(null);

    const requestId = ++searchRequestIdRef.current;

    try {
      const params = new URLSearchParams({
        ...NOMINATIM_SEARCH_PARAMS,
        q: query + ' UK', // Add UK to prioritize results
      });

      const url = `${NOMINATIM_API}/search?${params}`;
      const response = await fetchWithTimeout(url, API_TIMEOUT);

      // Check if this request was superseded by a newer one
      if (requestId !== searchRequestIdRef.current) {
        return [];
      }

      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.status}`);
      }

      const results = (await response.json()) as SearchResult[];

      // Ensure lat/lon are numbers
      return results.map((r) => ({
        ...r,
        lat: typeof r.lat === 'string' ? parseFloat(r.lat) : r.lat,
        lon: typeof r.lon === 'string' ? parseFloat(r.lon) : r.lon,
      }));
    } catch (err) {
      if (requestId === searchRequestIdRef.current) {
        const error =
          err instanceof Error
            ? err
            : new Error('Unknown error during geocoding');
        setSearchError(error);
        console.error('Geocoding search error:', error);
      }
      return [];
    } finally {
      if (requestId === searchRequestIdRef.current) {
        setSearchLoading(false);
      }
    }
  }, []);

  /**
   * Reverse geocode coordinates to address
   */
  const reverseGeocode = useCallback(
    async (lat: number, lon: number): Promise<string> => {
      setReverseLoading(true);
      setReverseError(null);

      const requestId = ++reverseRequestIdRef.current;

      try {
        const params = new URLSearchParams({
          ...NOMINATIM_REVERSE_PARAMS,
          lat: lat.toString(),
          lon: lon.toString(),
        });

        const url = `${NOMINATIM_API}/reverse?${params}`;
        const response = await fetchWithTimeout(url, API_TIMEOUT);

        // Check if this request was superseded
        if (requestId !== reverseRequestIdRef.current) {
          return '';
        }

        if (!response.ok) {
          throw new Error(`Nominatim API error: ${response.status}`);
        }

        const data = (await response.json()) as { display_name?: string };
        return data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      } catch (err) {
        if (requestId === reverseRequestIdRef.current) {
          const error =
            err instanceof Error
              ? err
              : new Error('Unknown error during reverse geocoding');
          setReverseError(error);
          console.error('Reverse geocoding error:', error);
        }
        // Return coordinates as fallback
        return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      } finally {
        if (requestId === reverseRequestIdRef.current) {
          setReverseLoading(false);
        }
      }
    },
    []
  );

  /**
   * Clear error states
   */
  const clearErrors = useCallback(() => {
    setSearchError(null);
    setReverseError(null);
  }, []);

  return {
    search,
    searchLoading,
    searchError,

    reverseGeocode,
    reverseLoading,
    reverseError,

    clearErrors,
  };
}

/**
 * Standalone utility for one-off geocoding (without React)
 */
export async function geocodeAddress(address: string): Promise<SearchResult | null> {
  try {
    const params = new URLSearchParams({
      ...NOMINATIM_SEARCH_PARAMS,
      q: address + ' UK',
    });

    const url = `${NOMINATIM_API}/search?${params}`;
    const response = await fetchWithTimeout(url, API_TIMEOUT);

    if (!response.ok) {
      console.error(`Nominatim API error: ${response.status}`);
      return null;
    }

    const results = (await response.json()) as SearchResult[];
    return results.length > 0 ? results[0] : null;
  } catch (err) {
    console.error('Geocoding error:', err);
    return null;
  }
}

/**
 * Standalone utility for reverse geocoding (without React)
 */
export async function reverseGeocodeCoordinates(
  lat: number,
  lon: number
): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      ...NOMINATIM_REVERSE_PARAMS,
      lat: lat.toString(),
      lon: lon.toString(),
    });

    const url = `${NOMINATIM_API}/reverse?${params}`;
    const response = await fetchWithTimeout(url, API_TIMEOUT);

    if (!response.ok) {
      console.error(`Nominatim API error: ${response.status}`);
      return null;
    }

    const data = (await response.json()) as { display_name?: string };
    return data.display_name || null;
  } catch (err) {
    console.error('Reverse geocoding error:', err);
    return null;
  }
}
