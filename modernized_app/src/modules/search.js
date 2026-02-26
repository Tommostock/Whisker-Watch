/**
 * Search & Geocoding
 * Address search, geocoding, and search result display
 */

import { geocodeAddress, reverseGeocode, geocodeWithFallback } from '../utils/nominatim-api.js';
import { getCachedElement } from '../utils/dom-cache.js';
import { escapeHtml } from '../utils/escape-html.js';

/**
 * Handle address geocoding from modal form
 * Updates latitude/longitude fields based on address input
 */
export function geocodeAddr() {
  const addrInput = getCachedElement('fAddr');
  const statusEl = getCachedElement('geoStatus');

  if (!addrInput || !statusEl) return;

  const addr = addrInput.value.trim();
  if (!addr) return;

  statusEl.textContent = 'Searching…';
  statusEl.style.color = 'var(--text-muted)';

  geocodeAddress(addr)
    .then(result => {
      if (result) {
        const latInput = getCachedElement('fLat');
        const lngInput = getCachedElement('fLng');
        if (latInput) latInput.value = result.lat.toFixed(5);
        if (lngInput) lngInput.value = result.lng.toFixed(5);
        statusEl.textContent = '✓ Found';
        statusEl.style.color = 'var(--green)';
      } else {
        statusEl.textContent = '✗ Not found';
        statusEl.style.color = 'var(--accent)';
      }
    })
    .catch(error => {
      console.error('Geocoding error:', error);
      statusEl.textContent = '✗ Error';
      statusEl.style.color = 'var(--accent)';
    });
}

/**
 * Handle reverse geocoding from map coordinates
 * Updates address field based on lat/lng
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 */
export async function reverseGeocodePin(lat, lng) {
  const addrInput = getCachedElement('fAddr');
  if (!addrInput) return;

  try {
    const address = await reverseGeocode(lat, lng);
    if (address) {
      addrInput.value = address;
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error);
  }
}

/**
 * Show search results dropdown
 * Displays found addresses as selectable items
 * @param {Array<Object>} results - Search results
 */
export function showSearchResults(results) {
  const dropdown = getCachedElement('searchDrop');
  if (!dropdown) return;

  dropdown.innerHTML = '';

  if (results.length === 0) {
    const item = document.createElement('div');
    item.className = 'search-item';
    item.textContent = 'No results found';
    item.style.cursor = 'default';
    dropdown.appendChild(item);
  } else {
    results.forEach((result, idx) => {
      const item = document.createElement('div');
      item.className = 'search-item';
      item.textContent = result.display_name || result;
      item.onclick = () => selectSearchResult(result, idx);
      dropdown.appendChild(item);
    });
  }

  dropdown.classList.add('open');
}

/**
 * Handle search result selection
 * Updates map and form with selected location
 * @param {Object} result - Selected result object
 * @param {number} index - Result index
 */
export function selectSearchResult(result, index) {
  const dropdown = getCachedElement('searchDrop');
  if (dropdown) {
    dropdown.classList.remove('open');
  }

  if (!result || !result.lat || !result.lon) return;

  // Update map state (assuming global ms object)
  if (window.ms) {
    window.ms.lat = parseFloat(result.lat);
    window.ms.lng = parseFloat(result.lon);
    window.ms.zoom = Math.max(window.ms.zoom, 13);
  }

  // Trigger map render if available
  if (window.sched) {
    window.sched();
  }
}

/**
 * Handle search form submission
 * Geocodes address if needed and pans map to location
 * @param {string} address - Address to search
 */
export async function submitSearch(address) {
  if (!address || !address.trim()) return;

  const result = await geocodeWithFallback(address.trim());

  if (window.ms && window.sched) {
    window.ms.lat = result.lat;
    window.ms.lng = result.lng;
    window.ms.zoom = Math.max(window.ms.zoom || 11, 13);
    window.sched();
  }
}

/**
 * Extract area name from address using borough list
 * @param {string} addr - Full address string
 * @param {Array<string>} boroughs - List of borough names
 * @returns {string} Extracted area or 'Unknown'
 */
export function extractArea(addr, boroughs) {
  if (!addr) return 'Unknown';

  const parts = addr.split(',').map(p => p.trim());
  const match = parts.find(p => boroughs.some(b => p.toLowerCase().includes(b.toLowerCase())));

  if (match) {
    // Remove postal codes (UK format: XY1 1AB)
    return match.replace(/\b[A-Z]{1,2}\d[\dA-Z]?\s?\d[A-Z]{2}\b/gi, '').trim() || match;
  }

  return parts[0] || 'Unknown';
}

/**
 * Escape address for safe display
 * @param {string} addr - Address to escape
 * @returns {string} Escaped address
 */
export function escapeAddress(addr) {
  return escapeHtml(addr);
}
