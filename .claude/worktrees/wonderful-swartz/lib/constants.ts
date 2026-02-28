/**
 * Constants for Whisker Watch
 * Extracted from original single-file app
 */

// ═══════════════════════════════════════════════════════════════
//  GEOGRAPHIC DATA
// ═══════════════════════════════════════════════════════════════

export const BOROUGHS = [
  'Croydon', 'Bromley', 'Sutton', 'Merton', 'Wandsworth', 'Lambeth', 'Southwark',
  'Lewisham', 'Greenwich', 'Bexley', 'Havering', 'Barking', 'Redbridge', 'Newham',
  'Tower Hamlets', 'Hackney', 'Haringey', 'Enfield', 'Barnet', 'Harrow', 'Brent',
  'Ealing', 'Hounslow', 'Richmond', 'Kingston', 'Streatham', 'Brixton', 'Balham',
  'Tooting', 'Wimbledon', 'Clapham', 'Peckham', 'Deptford', 'Woolwich', 'Eltham',
  'Catford', 'Mitcham', 'Morden', 'Thornton Heath', 'Norwood', 'Dulwich', 'Putney',
  'Battersea', 'Camberwell'
];

// Default map center (London)
export const DEFAULT_MAP_LAT = 51.505;
export const DEFAULT_MAP_LNG = -0.09;
export const DEFAULT_MAP_ZOOM = 11;

// Map zoom constraints
export const MIN_ZOOM = 5;
export const MAX_ZOOM = 17;
export const TILE_SIZE = 256;

// UK coordinate boundaries
export const UK_BOUNDS = {
  min_lat: 50,
  max_lat: 59,
  min_lng: -8,
  max_lng: 2,
};

// ═══════════════════════════════════════════════════════════════
//  INCIDENT DATA
// ═══════════════════════════════════════════════════════════════

export const INCIDENT_STATUSES = [
  'unconfirmed',
  'suspected',
  'confirmed',
  'sighted',
] as const;

// Object version for form dropdowns
export const INCIDENT_STATUS = {
  unconfirmed: 'unconfirmed',
  suspected: 'suspected',
  confirmed: 'confirmed',
  sighted: 'sighted',
} as const;

export const STATUS_DISPLAY = {
  unconfirmed: 'Unconfirmed Case',
  suspected: 'Suspected Case',
  confirmed: 'Confirmed Case',
  sighted: 'Suspect Sighted',
} as const;

// Status color mapping (matches CSS variables)
export const STATUS_COLORS: Record<string, string> = {
  confirmed: '#e63946', // --accent (red)
  suspected: '#d4a017', // --yellow
  unconfirmed: '#2d9d6e', // --green
  sighted: '#3b82f6', // --blue
};

// Status priority for sorting (sighted first)
export const STATUS_PRIORITY: Record<string, number> = {
  sighted: 0,
  confirmed: 1,
  suspected: 2,
  unconfirmed: 3,
};

// ═══════════════════════════════════════════════════════════════
//  ANIMAL DATA
// ═══════════════════════════════════════════════════════════════

export const ANIMAL_TYPES = [
  'Domestic Cat',
  'Kitten',
  'Feral Cat',
  'Other',
] as const;

export const AGE_OPTIONS = [
  '',
  '< 1',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20+',
] as const;

export const SEX_OPTIONS = [
  '',
  'Unknown',
  'Male',
  'Female',
  'Neutered Male',
  'Spayed Female',
] as const;

// ═══════════════════════════════════════════════════════════════
//  INCIDENT METHOD (CAUSE)
// ═══════════════════════════════════════════════════════════════

export const METHODS = [
  'Blunt Trauma',
  'Sharp Force',
  'Strangulation',
  'Poisoning',
  'Decapitation',
  'Roadkill',
  'Accident',
  'Other / Unknown',
] as const;

// Array version for form dropdowns (alias for METHODS)
export const INCIDENT_METHODS = METHODS;

// ═══════════════════════════════════════════════════════════════
//  SEVERITY LEVELS
// ═══════════════════════════════════════════════════════════════

export const SEVERITY_OPTIONS = [
  'Fatal',
  'Critical',
  'Injured — Survived',
  'Suspected',
] as const;

// Array version for form dropdowns (alias for SEVERITY_OPTIONS)
export const INCIDENT_SEVERITY = SEVERITY_OPTIONS;

export const SEVERITY_PRIORITY: Record<string, number> = {
  'Fatal': 0,
  'Critical': 1,
  'Injured — Survived': 2,
  'Suspected': 3,
};

// ═══════════════════════════════════════════════════════════════
//  MAP TILES & IMAGERY
// ═══════════════════════════════════════════════════════════════

export const MAP_TILES = {
  // CARTO basemaps (light/dark mode)
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',

  // ArcGIS satellite imagery
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',

  // OpenStreetMap fallback
  osm: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
};

export const CARTO_VARIANTS = {
  dark: 'dark_all',
  light: 'light_all',
};

// Tile server subdomains for load balancing
export const TILE_SUBDOMAINS = ['a', 'b', 'c', 'd'] as const;

// Map attribution
export const MAP_ATTRIBUTION = '© OpenStreetMap contributors © CARTO';

// ═══════════════════════════════════════════════════════════════
//  RENDER LOOP & PERFORMANCE
// ═══════════════════════════════════════════════════════════════

// Render intervals (milliseconds)
export const RENDER_INTERVALS = {
  active: 16, // ~60fps when user interacting
  idle_desktop: 500, // When idle on desktop
  idle_mobile: 1000, // When idle on mobile (save battery)
};

// User interaction timeout before switching to idle render
export const INTERACTION_TIMEOUT = 500;

// Tile cache settings
export const TILE_CACHE_LIMIT = 400;

// Heatmap clustering
export const HEATMAP_RADIUS = 25;
export const HEATMAP_BLUR = 15;
export const HEATMAP_MAX = 1.0;

// Pin clustering
export const CLUSTER_ZOOM_THRESHOLD = 12;
export const CLUSTER_RADIUS = 60; // pixels

// Mobile detection
export const MOBILE_WIDTH_BREAKPOINT = 768;

// ═══════════════════════════════════════════════════════════════
//  GEOCODING & SEARCH
// ═══════════════════════════════════════════════════════════════

// Nominatim API endpoints
export const NOMINATIM_API = 'https://nominatim.openstreetmap.org';

// Nominatim search defaults
export const NOMINATIM_SEARCH_PARAMS = {
  format: 'json',
  limit: 5,
  countrycodes: 'gb', // UK only
  zoom: 16,
  addressdetails: 1,
};

// Nominatim reverse geocoding defaults
export const NOMINATIM_REVERSE_PARAMS = {
  format: 'json',
  zoom: 16,
  addressdetails: 1,
};

// API request timeout (milliseconds)
export const API_TIMEOUT = 5000;

// ═══════════════════════════════════════════════════════════════
//  LOCAL STORAGE KEYS
// ═══════════════════════════════════════════════════════════════

export const STORAGE_KEYS = {
  incidents: 'lckData', // Main incident data
  theme: 'slainTheme', // Dark/light mode preference
  mapBookmarks: 'mapBookmarks', // Saved map views
  mapState: 'whiskerWatchMapState', // Current map view (zoom, center)
  userPreferences: 'whiskerWatchPrefs', // Other user settings
};

// ═══════════════════════════════════════════════════════════════
//  UI CONFIGURATION
// ═══════════════════════════════════════════════════════════════

// Sidebar width (pixels)
export const SIDEBAR_WIDTH = 330;

// Header height (pixels)
export const HEADER_HEIGHT = 64;

// Toast notification duration (milliseconds)
export const TOAST_DURATION = 4000;

// Modal/overlay z-index layers
export const Z_INDEX = {
  sidebar: 50,
  header: 100,
  modal: 200,
  lightbox: 300,
  toast: 400,
};

// Animation durations (milliseconds)
export const ANIMATIONS = {
  sidebar_toggle: 250,
  modal_open: 150,
  modal_close: 150,
  toast_fade: 300,
};

// ═══════════════════════════════════════════════════════════════
//  VALIDATION RULES
// ═══════════════════════════════════════════════════════════════

export const VALIDATION = {
  minLatitude: 50,
  maxLatitude: 59,
  minLongitude: -8,
  maxLongitude: 2,
  maxNoteLength: 500,
  maxPhotoSize: 5242880, // 5MB
  maxPhotoCount: 10,
};

export const COORDINATE_BOUNDS = {
  minLat: VALIDATION.minLatitude,
  maxLat: VALIDATION.maxLatitude,
  minLng: VALIDATION.minLongitude,
  maxLng: VALIDATION.maxLongitude,
};

// ═══════════════════════════════════════════════════════════════
//  DATE & TIME
// ═══════════════════════════════════════════════════════════════

export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
};

export const TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

// ═══════════════════════════════════════════════════════════════
//  CHART COLORS
// ═══════════════════════════════════════════════════════════════

export const CHART_COLORS = {
  accent: '#e63946', // Red
  accent2: '#ff6b35', // Orange
  green: '#2d9d6e', // Green
  yellow: '#d4a017', // Yellow
  blue: '#3b82f6', // Blue
  muted: '#9ca3af', // Gray
};
