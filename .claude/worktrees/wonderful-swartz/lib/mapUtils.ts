/**
 * Map Utilities
 * Helper functions for tile management, touch events, and optimizations
 */

import { Incident } from '@/lib/types';
import { STATUS_COLORS } from '@/lib/constants';

/**
 * Tile cache with priority queue
 * Prioritizes tiles in viewport over off-screen tiles
 */
export class PrioritizedTileCache {
  private cache = new Map<string, Promise<HTMLImageElement>>();
  private maxSize = 400;
  private viewportTiles = new Set<string>();

  set(key: string, promise: Promise<HTMLImageElement>) {
    this.cache.set(key, promise);
    this.evictIfNeeded();
  }

  get(key: string): Promise<HTMLImageElement> | undefined {
    return this.cache.get(key);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  setViewportTiles(keys: Set<string>) {
    this.viewportTiles = keys;
  }

  private evictIfNeeded() {
    if (this.cache.size <= this.maxSize) return;

    // Remove non-viewport tiles first (LRU)
    const toRemove = this.cache.size - this.maxSize;
    let removed = 0;

    for (const [key] of this.cache) {
      if (!this.viewportTiles.has(key) && removed < toRemove) {
        this.cache.delete(key);
        removed++;
      }
    }

    // If still too large, remove oldest viewport tiles
    for (const key of this.cache.keys()) {
      if (removed >= toRemove) break;
      this.cache.delete(key);
      removed++;
    }
  }

  clear() {
    this.cache.clear();
    this.viewportTiles.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Calculate cluster size based on incident count
 */
export function getClusterSize(count: number): number {
  const baseSize = 20;
  return baseSize + Math.log(count) * 5;
}

/**
 * Get color for cluster (weighted by incident statuses)
 */
export function getClusterColor(incidents: Incident[]): string {
  const statusCounts = {
    confirmed: 0,
    suspected: 0,
    unconfirmed: 0,
    sighted: 0,
  };

  incidents.forEach((inc) => {
    if (inc.status in statusCounts) {
      statusCounts[inc.status as keyof typeof statusCounts]++;
    }
  });

  // Priority: confirmed > suspected > unconfirmed > sighted
  if (statusCounts.confirmed > 0) return STATUS_COLORS.confirmed || '#e63946';
  if (statusCounts.suspected > 0) return STATUS_COLORS.suspected || '#d4a017';
  if (statusCounts.unconfirmed > 0) return STATUS_COLORS.unconfirmed || '#2d9d6e';
  return STATUS_COLORS.sighted || '#3b82f6';
}

/**
 * Touch event utilities
 */
export interface TouchData {
  x: number;
  y: number;
  distance?: number;
  angle?: number;
}

export function getTouchCentroid(touches: TouchList): TouchData {
  let x = 0;
  let y = 0;

  for (let i = 0; i < touches.length; i++) {
    x += touches[i].clientX;
    y += touches[i].clientY;
  }

  return {
    x: x / touches.length,
    y: y / touches.length,
  };
}

export function getTouchDistance(touches: TouchList): number {
  if (touches.length < 2) return 0;

  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;

  return Math.sqrt(dx * dx + dy * dy);
}

export function getTouchAngle(touches: TouchList): number {
  if (touches.length < 2) return 0;

  const dx = touches[1].clientX - touches[0].clientX;
  const dy = touches[1].clientY - touches[0].clientY;

  return Math.atan2(dy, dx);
}

/**
 * Map state serialization (for localStorage)
 */
export interface SerializedMapState {
  lat: number;
  lng: number;
  zoom: number;
  timestamp: number;
}

export function serializeMapState(lat: number, lng: number, zoom: number): SerializedMapState {
  return {
    lat: Math.round(lat * 100000) / 100000,
    lng: Math.round(lng * 100000) / 100000,
    zoom: Math.round(zoom * 10) / 10,
    timestamp: Date.now(),
  };
}

export function deserializeMapState(data: SerializedMapState | null) {
  if (!data || typeof data.lat !== 'number') {
    return null;
  }
  return {
    lat: data.lat,
    lng: data.lng,
    zoom: Math.max(5, Math.min(17, data.zoom)),
  };
}

/**
 * Heatmap density calculation
 * Returns grid of incident densities for optimized rendering
 */
export interface HeatmapGrid {
  grid: number[][];
  cellSize: number;
  minDensity: number;
  maxDensity: number;
}

export function calculateHeatmapDensity(
  pixels: Array<{ x: number; y: number }>,
  width: number,
  height: number,
  cellSize: number = 50
): HeatmapGrid {
  const cols = Math.ceil(width / cellSize);
  const rows = Math.ceil(height / cellSize);
  const grid: number[][] = Array(rows).fill(null).map(() => Array(cols).fill(0));

  // Count incidents in each cell
  pixels.forEach(({ x, y }) => {
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    if (col >= 0 && col < cols && row >= 0 && row < rows) {
      grid[row][col]++;
    }
  });

  // Smooth with Gaussian blur
  const smoothed = smoothGrid(grid);

  // Find min/max for normalization
  let minDensity = Infinity;
  let maxDensity = -Infinity;

  smoothed.forEach((row) => {
    row.forEach((val) => {
      minDensity = Math.min(minDensity, val);
      maxDensity = Math.max(maxDensity, val);
    });
  });

  return {
    grid: smoothed,
    cellSize,
    minDensity: minDensity === Infinity ? 0 : minDensity,
    maxDensity: maxDensity === -Infinity ? 0 : maxDensity,
  };
}

/**
 * Simple Gaussian blur for heatmap grid
 */
function smoothGrid(grid: number[][]): number[][] {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const result: number[][] = Array(rows).fill(null).map(() => Array(cols).fill(0));

  const kernel = [
    [1, 2, 1],
    [2, 4, 2],
    [1, 2, 1],
  ];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let sum = 0;
      let weight = 0;

      for (let ky = 0; ky < 3; ky++) {
        for (let kx = 0; kx < 3; kx++) {
          const py = y - 1 + ky;
          const px = x - 1 + kx;

          if (py >= 0 && py < rows && px >= 0 && px < cols) {
            sum += grid[py][px] * kernel[ky][kx];
            weight += kernel[ky][kx];
          }
        }
      }

      result[y][x] = weight > 0 ? sum / weight : 0;
    }
  }

  return result;
}

/**
 * Debounce utility for render scheduling
 */
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle utility for frequent events
 */
export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}

/**
 * Calculate if point is within bounds
 */
export function isPointInBounds(
  x: number,
  y: number,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number
): boolean {
  return x >= minX && x <= maxX && y >= minY && y <= maxY;
}

/**
 * Calculate viewport bounds in geographic coordinates
 */
export interface GeographicBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export function getViewportBounds(
  canvasWidth: number,
  canvasHeight: number,
  pixelToLatLng: (x: number, y: number) => { lat: number; lng: number }
): GeographicBounds {
  const topLeft = pixelToLatLng(0, 0);
  const bottomRight = pixelToLatLng(canvasWidth, canvasHeight);

  return {
    minLat: Math.min(topLeft.lat, bottomRight.lat),
    maxLat: Math.max(topLeft.lat, bottomRight.lat),
    minLng: Math.min(topLeft.lng, bottomRight.lng),
    maxLng: Math.max(topLeft.lng, bottomRight.lng),
  };
}

/**
 * Check if incident is visible in viewport
 */
export function isIncidentVisible(
  incident: Incident,
  bounds: GeographicBounds
): boolean {
  return (
    incident.lat >= bounds.minLat &&
    incident.lat <= bounds.maxLat &&
    incident.lng >= bounds.minLng &&
    incident.lng <= bounds.maxLng
  );
}
