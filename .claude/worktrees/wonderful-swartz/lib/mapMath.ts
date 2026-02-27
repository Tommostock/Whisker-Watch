/**
 * Map Math Utilities
 * Mercator projection, tile calculations, clustering
 * Based on Web Mercator standard (EPSG:3857)
 */

import { TILE_SIZE, MIN_ZOOM, MAX_ZOOM } from '@/lib/constants';

/**
 * Web Mercator projection functions
 * Convert between lat/lng and pixel coordinates
 */

export const lng2x = (lng: number, z: number): number => {
  return ((lng + 180) / 360) * Math.pow(2, z) * TILE_SIZE;
};

export const lat2y = (lat: number, z: number): number => {
  const r = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) *
    Math.pow(2, z) *
    TILE_SIZE;
};

export const x2lng = (x: number, z: number): number => {
  return (x / (Math.pow(2, z) * TILE_SIZE)) * 360 - 180;
};

export const y2lat = (y: number, z: number): number => {
  const n = Math.PI - (2 * Math.PI * y) / (Math.pow(2, z) * TILE_SIZE);
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
};

/**
 * Pixel coordinates relative to canvas
 */
export interface PixelCoords {
  x: number;
  y: number;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface MapState {
  lat: number;
  lng: number;
  zoom: number;
}

/**
 * Convert lat/lng to canvas pixel coordinates
 * given current map state
 */
export function latLngToPixel(
  lat: number,
  lng: number,
  mapState: MapState,
  canvasWidth: number,
  canvasHeight: number
): PixelCoords {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  const x =
    lng2x(lng, mapState.zoom) -
    lng2x(mapState.lng, mapState.zoom) +
    centerX;
  const y =
    lat2y(lat, mapState.zoom) -
    lat2y(mapState.lat, mapState.zoom) +
    centerY;

  return { x, y };
}

/**
 * Convert canvas pixel coordinates to lat/lng
 */
export function pixelToLatLng(
  x: number,
  y: number,
  mapState: MapState,
  canvasWidth: number,
  canvasHeight: number
): LatLng {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  const lat = y2lat(
    lat2y(mapState.lat, mapState.zoom) + (y - centerY),
    mapState.zoom
  );
  const lng = x2lng(
    lng2x(mapState.lng, mapState.zoom) + (x - centerX),
    mapState.zoom
  );

  return { lat, lng };
}

/**
 * Get tile coordinates from lat/lng
 */
export interface TileCoords {
  x: number;
  y: number;
  z: number;
}

export function getTileCoords(
  lat: number,
  lng: number,
  z: number
): TileCoords {
  const x = Math.floor((lng2x(lng, z) / TILE_SIZE) % Math.pow(2, z));
  const y = Math.floor((lat2y(lat, z) / TILE_SIZE) % Math.pow(2, z));
  return { x, y, z };
}

/**
 * Get all tile coordinates needed to cover canvas
 */
export function getTilesToLoad(
  mapState: MapState,
  canvasWidth: number,
  canvasHeight: number
): TileCoords[] {
  const tiles: TileCoords[] = [];
  const z = mapState.zoom;

  // Get tiles for corners of canvas
  const topLeft = pixelToLatLng(0, 0, mapState, canvasWidth, canvasHeight);
  const bottomRight = pixelToLatLng(
    canvasWidth,
    canvasHeight,
    mapState,
    canvasWidth,
    canvasHeight
  );

  // Get tile range
  const minTile = getTileCoords(bottomRight.lat, topLeft.lng, z);
  const maxTile = getTileCoords(topLeft.lat, bottomRight.lng, z);

  // Iterate through tile grid
  for (let y = Math.max(0, minTile.y); y <= maxTile.y; y++) {
    for (let x = minTile.x; x <= maxTile.x; x++) {
      const wrappedX = ((x % Math.pow(2, z)) + Math.pow(2, z)) % Math.pow(2, z);
      tiles.push({ x: wrappedX, y, z });
    }
  }

  return tiles;
}

/**
 * Calculate tile URL (wrap to handle world bounds)
 */
export function getTileUrl(
  x: number,
  y: number,
  z: number,
  variant: 'dark_all' | 'light_all' | 'satellite'
): string {
  const maxT = Math.pow(2, z);
  const wrappedX = ((x % maxT) + maxT) % maxT;
  const clampedY = Math.max(0, Math.min(maxT - 1, y));

  if (variant === 'satellite') {
    return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${clampedY}/${wrappedX}`;
  }

  const subdomains = ['a', 'b', 'c', 'd'];
  const subdomain = subdomains[(x + y + z) % 4];
  return `https://${subdomain}.basemaps.cartocdn.com/${variant}/${z}/${wrappedX}/${clampedY}.png`;
}

/**
 * Distance calculation (approximate, for clustering)
 * Returns distance in pixels on canvas
 */
export function pixelDistance(
  p1: PixelCoords,
  p2: PixelCoords
): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Geographic distance (Haversine formula)
 * Returns distance in kilometers
 */
export function geoDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Validate zoom level
 */
export function clampZoom(zoom: number): number {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
}

/**
 * Smooth zoom animation
 * Returns intermediate zoom level between start and end
 */
export function easeZoom(
  fromZoom: number,
  toZoom: number,
  progress: number
): number {
  // Ease in-out cubic
  const t = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
  return fromZoom + (toZoom - fromZoom) * t;
}

/**
 * Pan animation
 * Returns intermediate position
 */
export function easePosition(
  from: LatLng,
  to: LatLng,
  progress: number
): LatLng {
  // Ease in-out cubic (same as zoom)
  const t = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
  return {
    lat: from.lat + (to.lat - from.lat) * t,
    lng: from.lng + (to.lng - from.lng) * t,
  };
}

/**
 * Clustering algorithm (simple grid-based)
 * Groups incidents within cluster radius
 */
export interface Cluster {
  lat: number;
  lng: number;
  count: number;
  incidents: string[]; // incident IDs
}

export function clusterIncidents(
  incidents: Array<{ id: string; lat: number; lng: number }>,
  mapState: MapState,
  canvasWidth: number,
  canvasHeight: number,
  clusterRadius: number
): (Cluster | typeof incidents[0])[] {
  // Only cluster at zoom levels 12 and below
  if (mapState.zoom > 12) {
    return incidents;
  }

  const clustered: Cluster[] = [];
  const processed = new Set<string>();

  for (const incident of incidents) {
    if (processed.has(incident.id)) continue;

    const pixelPos = latLngToPixel(
      incident.lat,
      incident.lng,
      mapState,
      canvasWidth,
      canvasHeight
    );

    const nearby = incidents.filter((other) => {
      if (processed.has(other.id)) return false;

      const otherPixel = latLngToPixel(
        other.lat,
        other.lng,
        mapState,
        canvasWidth,
        canvasHeight
      );

      const dist = pixelDistance(pixelPos, otherPixel);
      return dist < clusterRadius;
    });

    if (nearby.length > 1) {
      // Create cluster
      const cluster: Cluster = {
        lat: nearby.reduce((sum, i) => sum + i.lat, 0) / nearby.length,
        lng: nearby.reduce((sum, i) => sum + i.lng, 0) / nearby.length,
        count: nearby.length,
        incidents: nearby.map((i) => i.id),
      };
      clustered.push(cluster);
      nearby.forEach((i) => processed.add(i.id));
    } else {
      // Single incident, add as-is
      clustered.push(incident);
      processed.add(incident.id);
    }
  }

  return clustered;
}

/**
 * Fit all incidents in view
 * Calculate zoom and center to show all points
 */
export function fitBounds(
  points: Array<{ lat: number; lng: number }>,
  canvasWidth: number,
  canvasHeight: number,
  padding: number = 50
): { lat: number; lng: number; zoom: number } {
  if (points.length === 0) {
    return { lat: 51.505, lng: -0.09, zoom: 11 }; // Default London
  }

  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  // Calculate zoom to fit bounds
  let zoom = 2;
  let fit = false;

  while (zoom < MAX_ZOOM && !fit) {
    const nw = latLngToPixel(
      maxLat,
      minLng,
      { lat: centerLat, lng: centerLng, zoom },
      canvasWidth,
      canvasHeight
    );
    const se = latLngToPixel(
      minLat,
      maxLng,
      { lat: centerLat, lng: centerLng, zoom },
      canvasWidth,
      canvasHeight
    );

    const width = se.x - nw.x;
    const height = se.y - nw.y;

    if (
      width < canvasWidth - padding * 2 &&
      height < canvasHeight - padding * 2
    ) {
      fit = true;
    } else {
      zoom++;
    }
  }

  return {
    lat: centerLat,
    lng: centerLng,
    zoom: clampZoom(zoom),
  };
}
