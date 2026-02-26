/**
 * Mercator Projection Math
 * Core coordinate transformation functions for the slippy map engine
 * Converts between lat/lng (geographic) and x/y (tile) coordinates
 */

import { TILE_SZ } from '../constants/map-config.js';

/**
 * Convert longitude to tile x coordinate
 * @param {number} lng - Longitude (-180 to 180)
 * @param {number} z - Zoom level
 * @returns {number} X coordinate in pixels
 */
export function lng2x(lng, z) {
  return ((lng + 180) / 360) * Math.pow(2, z) * TILE_SZ;
}

/**
 * Convert latitude to tile y coordinate
 * Web Mercator projection formula
 * @param {number} lat - Latitude (-85 to 85)
 * @param {number} z - Zoom level
 * @returns {number} Y coordinate in pixels
 */
export function lat2y(lat, z) {
  const r = lat * Math.PI / 180;
  return (1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * Math.pow(2, z) * TILE_SZ;
}

/**
 * Convert tile x coordinate back to longitude
 * @param {number} x - X coordinate in pixels
 * @param {number} z - Zoom level
 * @returns {number} Longitude (-180 to 180)
 */
export function x2lng(x, z) {
  return (x / (Math.pow(2, z) * TILE_SZ)) * 360 - 180;
}

/**
 * Convert tile y coordinate back to latitude
 * Inverse Web Mercator projection
 * @param {number} y - Y coordinate in pixels
 * @param {number} z - Zoom level
 * @returns {number} Latitude (-85 to 85)
 */
export function y2lat(y, z) {
  const n = Math.PI - 2 * Math.PI * y / (Math.pow(2, z) * TILE_SZ);
  return 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

/**
 * Convert lat/lng to canvas pixel coordinates
 * Relative to current map viewport
 * @param {number} lat - Target latitude
 * @param {number} lng - Target longitude
 * @param {Object} mapState - Current map state {lat, lng, zoom}
 * @param {number} canvasWidth - Canvas width in pixels
 * @param {number} canvasHeight - Canvas height in pixels
 * @returns {Object} {x, y} pixel coordinates relative to canvas
 */
export function ll2px(lat, lng, mapState, canvasWidth, canvasHeight) {
  const z = mapState.zoom;
  const cx = canvasWidth / 2;
  const cy = canvasHeight / 2;

  return {
    x: lng2x(lng, z) - lng2x(mapState.lng, z) + cx,
    y: lat2y(lat, z) - lat2y(mapState.lat, z) + cy
  };
}

/**
 * Convert canvas pixel coordinates to lat/lng
 * Inverse of ll2px
 * @param {number} x - Canvas pixel x
 * @param {number} y - Canvas pixel y
 * @param {Object} mapState - Current map state {lat, lng, zoom}
 * @param {number} canvasWidth - Canvas width in pixels
 * @param {number} canvasHeight - Canvas height in pixels
 * @returns {Object} {lat, lng} geographic coordinates
 */
export function px2ll(x, y, mapState, canvasWidth, canvasHeight) {
  const z = mapState.zoom;
  const cx = canvasWidth / 2;
  const cy = canvasHeight / 2;

  return {
    lat: y2lat(lat2y(mapState.lat, z) + (y - cy), z),
    lng: x2lng(lng2x(mapState.lng, z) + (x - cx), z)
  };
}

/**
 * Calculate Haversine distance between two geographic points
 * @param {number} lat1 - First point latitude
 * @param {number} lng1 - First point longitude
 * @param {number} lat2 - Second point latitude
 * @param {number} lng2 - Second point longitude
 * @returns {number} Distance in kilometers
 */
export function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLng = (lng2 - lng1) * toRad;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.asin(Math.sqrt(a));
  return R * c;
}
