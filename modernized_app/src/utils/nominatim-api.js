/**
 * Nominatim API Wrapper
 * Geocoding and reverse geocoding using OpenStreetMap Nominatim service
 * Converts between addresses and geographic coordinates
 */

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const LONDON_UK = 'London UK';
const VIEWBOX = '-0.41,51.68,0.29,51.28'; // London bounding box for search results
const TIMEOUT = 5000; // API request timeout in ms

/**
 * Forward geocoding: Convert address to lat/lng
 * @param {string} address - Address to geocode
 * @returns {Promise<Object>} {lat, lng} or null if not found
 */
export async function geocodeAddress(address) {
  if (!address || !address.trim()) return null;

  try {
    const query = `${address.trim()} ${LONDON_UK}`;
    const url = `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=gb`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      if (data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          displayName: data[0].display_name
        };
      }
      return null;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Geocoding timeout');
      }
      throw error;
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Reverse geocoding: Convert lat/lng to address
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string>} Address or empty string if not found
 */
export async function reverseGeocode(lat, lng) {
  if (isNaN(lat) || isNaN(lng)) return '';

  try {
    const url = `${NOMINATIM_BASE}/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      if (data.display_name) {
        // Extract first 4 parts of address (most relevant)
        return data.display_name.split(',').slice(0, 4).join(', ');
      }
      return '';
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Reverse geocoding timeout');
      }
      throw error;
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return '';
  }
}

/**
 * Geocode with fallback to default coordinates
 * Returns default London center if geocoding fails
 * @param {string} address - Address to geocode
 * @param {number} fallbackLat - Default latitude (51.505)
 * @param {number} fallbackLng - Default longitude (-0.09)
 * @returns {Promise<Object>} {lat, lng} guaranteed (may be fallback)
 */
export async function geocodeWithFallback(address, fallbackLat = 51.505, fallbackLng = -0.09) {
  try {
    const result = await geocodeAddress(address);
    if (result) return result;
  } catch (error) {
    console.warn('Geocoding failed, using fallback:', error);
  }

  return { lat: fallbackLat, lng: fallbackLng };
}
