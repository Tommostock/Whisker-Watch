/**
 * Map Configuration
 * Centralizes all map engine parameters and initial state
 */

// Tile size for slippy map (OSM standard)
export const TILE_SZ = 256;

// Zoom level constraints
export const MIN_Z = 9;  // Minimum zoom (most zoomed out, citywide view)
export const MAX_Z = 17; // Maximum zoom (most zoomed in, street detail)

// Initial map state (London center)
export const INITIAL_MAP_STATE = {
  lat: 51.505,    // London latitude
  lng: -0.09,     // London longitude
  zoom: 11        // Default zoom level (borough level)
};

// CartoDB tile servers (rotating through a, b, c, d for load balancing)
export const TILE_SERVERS = ['a', 'b', 'c', 'd'];

// CartoDB tile URL template (supports light_all and dark_all themes)
export const TILE_BASE_URL = 'https://{server}.basemaps.cartocdn.com/{theme}/{z}/{x}/{y}.png';

// Fallback OSM tile URL
export const OSM_FALLBACK_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

// Tile cache size limit (max number of tiles to keep in memory)
export const TILE_CACHE_LIMIT = 400;

// Map canvas background color (dark mode default)
export const MAP_BG_DARK = '#1a1f2a';
export const MAP_BG_LIGHT = '#e5e7eb';
