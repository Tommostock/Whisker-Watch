/**
 * DOM Element Cache
 * Caches frequently accessed DOM elements to avoid repeated queries
 * Improves performance by reducing document.getElementById calls
 */

/**
 * DOM element cache (id -> element)
 * @type {Map<string, HTMLElement>}
 */
const elementCache = new Map();

/**
 * Get cached element or query and cache it
 * @param {string} id - Element ID
 * @returns {HTMLElement|null} Element or null if not found
 */
export function getCachedElement(id) {
  if (elementCache.has(id)) {
    return elementCache.get(id);
  }

  const el = document.getElementById(id);
  if (el) {
    elementCache.set(id, el);
  }
  return el;
}

/**
 * Invalidate cache entry (call when DOM changes)
 * @param {string} id - Element ID to remove from cache
 */
export function invalidateCache(id) {
  elementCache.delete(id);
}

/**
 * Clear entire cache
 * Call this after major DOM restructuring
 */
export function clearCache() {
  elementCache.clear();
}

/**
 * Cache size (for debugging)
 * @returns {number} Number of cached elements
 */
export function getCacheSize() {
  return elementCache.size;
}

/**
 * Preload cache with common elements
 * Call once on application start
 * @param {string[]} ids - Array of element IDs to cache
 */
export function preloadCache(ids) {
  ids.forEach(id => getCachedElement(id));
}

/**
 * Quick access functions for commonly used elements
 * These call getCachedElement internally
 */

export const DOM = {
  // Map and canvas
  mapCanvas: () => getCachedElement('mapCanvas'),
  heatCanvas: () => getCachedElement('heatCanvas'),
  mapWrap: () => getCachedElement('mapWrap'),
  markerLayer: () => getCachedElement('markerLayer'),

  // Sidebar
  sidebar: () => getCachedElement('sidebar'),
  incList: () => getCachedElement('incList'),
  searchInput: () => getCachedElement('searchInput'),
  searchDrop: () => getCachedElement('searchDrop'),

  // Report modal
  reportOverlay: () => getCachedElement('reportOverlay'),
  reportModalTitle: () => getCachedElement('reportModalTitle'),
  reportSub: () => getCachedElement('reportSub'),
  reportSubmitBtn: () => getCachedElement('reportSubmitBtn'),

  // Form fields
  fAddr: () => getCachedElement('fAddr'),
  fLat: () => getCachedElement('fLat'),
  fLng: () => getCachedElement('fLng'),
  fDatetime: () => getCachedElement('fDatetime'),
  fStatus2: () => getCachedElement('fStatus2'),
  fAnimalType: () => getCachedElement('fAnimalType'),
  fCatName: () => getCachedElement('fCatName'),
  fAnimalDesc: () => getCachedElement('fAnimalDesc'),
  fAge: () => getCachedElement('fAge'),
  fSex: () => getCachedElement('fSex'),
  fMethod2: () => getCachedElement('fMethod2'),
  fSeverity: () => getCachedElement('fSeverity'),
  fNotes: () => getCachedElement('fNotes'),
  fWitName: () => getCachedElement('fWitName'),
  fWitContact: () => getCachedElement('fWitContact'),
  fWitStatement: () => getCachedElement('fWitStatement'),

  // Status messages
  geoStatus: () => getCachedElement('geoStatus'),
  valMsg: () => getCachedElement('valMsg'),
  photoPrev: () => getCachedElement('photoPrev'),

  // Detail view
  detailOverlay: () => getCachedElement('detailOverlay'),
  detailList: () => getCachedElement('detailList'),

  // Map controls
  mapPopup: () => getCachedElement('mapPopup'),
  mapLegend: () => getCachedElement('mapLegend'),

  // Stats
  statsWrap: () => getCachedElement('statsWrap'),
  filteredCount: () => getCachedElement('filteredCount'),

  // Filters
  fStatus: () => getCachedElement('fStatus'),
  fMethod: () => getCachedElement('fMethod'),
  fArea: () => getCachedElement('fArea')
};
