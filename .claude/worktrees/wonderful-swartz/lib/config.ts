/**
 * Application Configuration
 * Centralized configuration from environment variables
 * Provides type-safe access to env vars with validation
 */

// ═══════════════════════════════════════════════════════════════
// API & External Services
// ═══════════════════════════════════════════════════════════════

export const config = {
  /**
   * Nominatim Geocoding API
   * Public OSM service for address searching
   */
  geocoding: {
    apiUrl: process.env.NEXT_PUBLIC_NOMINATIM_API || 'https://nominatim.openstreetmap.org',
    timeout: 5000, // 5 seconds
  },

  /**
   * Map Tiles (CARTO)
   * Public CartoDB service for base map tiles
   */
  mapTiles: {
    apiUrl: process.env.NEXT_PUBLIC_CARTO_API || 'https://cartodb-basemaps-a.global.ssl.fastly.net',
  },

  /**
   * Application environment
   */
  env: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isStaging: process.env.NODE_ENV === 'staging',
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  /**
   * Debug settings
   */
  debug: {
    enabled: process.env.NEXT_PUBLIC_DEBUG === 'true',
  },

  /**
   * Feature flags
   * Controls optional features
   */
  features: {
    photosEnabled: process.env.NEXT_PUBLIC_PHOTOS_ENABLED !== 'false',
    caseNotesEnabled: process.env.NEXT_PUBLIC_CASE_NOTES_ENABLED !== 'false',
    exportEnabled: process.env.NEXT_PUBLIC_EXPORT_ENABLED !== 'false',
  },

  /**
   * Vercel deployment info
   */
  vercel: {
    environment: process.env.VERCEL_ENV as 'production' | 'preview' | 'development' | undefined,
    url: process.env.VERCEL_URL,
  },

  /**
   * Analytics (optional)
   */
  analytics: {
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID,
  },

  /**
   * Error tracking (optional)
   */
  sentry: {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    authToken: process.env.SENTRY_AUTH_TOKEN,
  },
} as const;

/**
 * Type-safe config access
 * Use this in your app instead of directly accessing process.env
 */
export type Config = typeof config;

/**
 * Validate configuration on app start
 * Ensures all required env vars are set
 */
export function validateConfig(): string[] {
  const errors: string[] = [];

  // Validate required external services
  if (!config.geocoding.apiUrl) {
    errors.push('NEXT_PUBLIC_NOMINATIM_API is not configured');
  }

  if (!config.mapTiles.apiUrl) {
    errors.push('NEXT_PUBLIC_CARTO_API is not configured');
  }

  return errors;
}

/**
 * Log configuration (safe for client-side, no secrets)
 */
export function logConfig(): void {
  if (config.debug.enabled) {
    console.log('[Config] Environment:', config.env.nodeEnv);
    console.log('[Config] Geocoding API:', config.geocoding.apiUrl);
    console.log('[Config] Features:', config.features);
    if (config.vercel.url) {
      console.log('[Config] Vercel URL:', config.vercel.url);
    }
  }
}
