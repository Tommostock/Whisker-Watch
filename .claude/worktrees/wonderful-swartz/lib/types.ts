/**
 * TypeScript Type Definitions for Whisker Watch
 * Extracted from original single-file app data structures
 */

/**
 * Photo data stored as base64 data URL
 */
export interface Photo {
  name: string;
  data: string; // base64 data URL
}

/**
 * Timestamped investigation note attached to an incident
 */
export interface CaseNote {
  id: string; // 'cn-' + timestamp
  timestamp: string; // ISO 8601 timestamp
  text: string; // Note content (max 500 chars)
  author: string; // Author name (default: 'System')
}

/**
 * Core incident record
 */
export interface Incident {
  // Identification
  id: string; // 'INC-' + timestamp (e.g., 'INC-ABC123')
  createdAt: string; // ISO 8601 timestamp
  updatedAt?: string; // ISO 8601 timestamp

  // Location
  address: string; // Address or location description
  area: string; // Extracted borough/area name
  lat: number; // Latitude (decimal)
  lng: number; // Longitude (decimal)

  // Incident details
  datetime: string; // ISO 8601 with timezone (e.g., '2025-02-27T10:30:00+00:00')
  status: 'unconfirmed' | 'suspected' | 'confirmed' | 'sighted'; // Case status
  method: string; // How it happened (Blunt Trauma, Sharp Force, etc.)
  severity: string; // Impact level (Fatal, Critical, Injured — Survived, Suspected)

  // Animal information
  animalType: string; // 'Domestic Cat', 'Kitten', 'Feral Cat', 'Other'
  catName: string; // Name if known
  animalDesc: string; // Physical description
  age: string; // Age in years or unknown
  sex: string; // Male, Female, Neutered Male, Spayed Female, Unknown

  // Incident notes and investigation
  notes: string; // Scene description and observations
  sightedDesc: string; // For sighted cases, description of suspect
  caseNotes: CaseNote[]; // Timestamped investigation notes (intel)

  // Witness information
  witnessName: string; // Witness name if provided
  witnessContact: string; // Phone or email
  witnessStatement: string; // What was witnessed or heard

  // Media
  photos: Photo[]; // Attached photos as base64
}

/**
 * Filter state for incidents
 */
export interface FilterState {
  status: '' | 'unconfirmed' | 'suspected' | 'confirmed' | 'sighted';
  method: string; // Method filter value
  area: string; // Area/borough filter value
}

/**
 * Map state (zoom, center, etc.)
 */
export interface MapState {
  lat: number; // Center latitude
  lng: number; // Center longitude
  zoom: number; // Zoom level (5-17)
}

/**
 * Saved map bookmark
 */
export interface MapBookmark {
  id: string; // 'bm-' + timestamp
  name: string; // User-friendly name
  lat: number; // Latitude
  lng: number; // Longitude
  zoom: number; // Zoom level
  createdAt: string; // ISO 8601 timestamp
}

/**
 * User preferences (theme, etc.)
 */
export interface UserPreferences {
  theme: 'light' | 'dark';
}

/**
 * Application context state
 */
export interface AppState {
  incidents: Incident[];
  filters: FilterState;
  sortField: 'date' | 'area' | 'status';
  sortDir: 1 | -1;
  mapState: MapState;
  preferences: UserPreferences;
}

/**
 * Search result from Nominatim geocoding API
 */
export interface GeocodeResult {
  lat: string;
  lon: string;
  display_name: string;
  address: {
    city?: string;
    county?: string;
    postcode?: string;
  };
}

/**
 * Statistics data for dashboard
 */
export interface Stats {
  total: number;
  unconfirmed: number;
  suspected: number;
  confirmed: number;
  sighted: number;
  by_method: Record<string, number>;
  by_severity: Record<string, number>;
  by_area: Record<string, number>;
  by_date: Record<string, number>;
}

/**
 * Duplicate incident during import
 */
export interface ImportDuplicate {
  id: string;
  existing: Incident;
  incoming: Incident;
  action?: 'skip' | 'update' | 'create_new';
}

/**
 * Import operation result
 */
export interface ImportResult {
  success: number;
  skipped: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}
