/**
 * Map Engine
 * Self-contained slippy map with tile caching and canvas rendering
 * Mercator projection, tile loading, and map control
 */

import { TILE_SZ, MIN_Z, MAX_Z, INITIAL_MAP_STATE, TILE_CACHE_LIMIT, MAP_BG_DARK } from '../constants/map-config.js';
import { lng2x, lat2y, x2lng, y2lat, ll2px } from '../utils/mercator.js';
import { escapeHtml } from '../utils/escape-html.js';

// Map state
export const ms = { ...INITIAL_MAP_STATE };

// Canvas and context references
let mapC = null;
let heatC = null;
let mctx = null;
let hctx = null;

// Map control state
let dragging = false;
let dragStart = null;
let renderPending = false;
let tileCache = new Map();

// Visualization toggles
export let showHeat = true;
export let showPins = true;

/**
 * Initialize map engine
 * Must be called once on app startup with canvas and heat canvas elements
 * @param {HTMLCanvasElement} mapCanvas - Main map rendering canvas
 * @param {HTMLCanvasElement} heatCanvas - Heatmap overlay canvas
 */
export function initMapEngine(mapCanvas, heatCanvas) {
  mapC = mapCanvas;
  heatC = heatCanvas;
  mctx = mapC.getContext('2d');
  hctx = heatC.getContext('2d');

  if (!mapC || !heatC || !mctx || !hctx) {
    console.error('Failed to initialize map engine: missing canvas elements');
    return;
  }

  setupMapInteraction();
}

/**
 * Get tile URL for given tile coordinates
 * Supports CartoDB tiles with theme switching
 * @param {number} tx - Tile x coordinate
 * @param {number} ty - Tile y coordinate
 * @param {number} z - Zoom level
 * @returns {string} Tile image URL
 */
function getTile(tx, ty, z) {
  const maxT = Math.pow(2, z);
  const wx = ((tx % maxT) + maxT) % maxT;
  const wy = Math.max(0, Math.min(maxT - 1, ty));
  const s = ['a', 'b', 'c', 'd'][(tx + ty + z) % 4];

  // Theme switching: Use light tiles in light mode
  const isLightMode = document.body.classList.contains('light-mode');
  const tileType = isLightMode ? 'light_all' : 'dark_all';

  return `https://${s}.basemaps.cartocdn.com/${tileType}/${z}/${wx}/${wy}.png`;
}

/**
 * Load tile image with caching and fallback
 * @param {string} url - Tile image URL
 * @returns {Promise<Image|null>} Loaded image or null if failed
 */
function loadTileImg(url) {
  if (tileCache.has(url)) {
    return tileCache.get(url);
  }

  const p = new Promise(res => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => res(img);

    img.onerror = () => {
      // Try OSM fallback
      const f = new Image();
      f.crossOrigin = 'anonymous';

      f.onload = () => res(f);
      f.onerror = () => res(null);

      const parts = url.match(/\/(\d+)\/(\d+)\/(\d+)\.png$/);
      if (parts) {
        f.src = `https://tile.openstreetmap.org/${parts[1]}/${parts[2]}/${parts[3]}.png`;
      } else {
        res(null);
      }
    };

    img.src = url;
  });

  tileCache.set(url, p);

  // Limit cache size
  if (tileCache.size > TILE_CACHE_LIMIT) {
    const firstKey = tileCache.keys().next().value;
    if (firstKey) tileCache.delete(firstKey);
  }

  return p;
}

/**
 * Schedule a map render on next animation frame
 * Prevents multiple renders per frame
 */
export function sched() {
  if (!renderPending) {
    renderPending = true;
    requestAnimationFrame(render);
  }
}

/**
 * Render map tiles, pins, and heatmap
 * Main rendering function called each animation frame
 */
async function render() {
  renderPending = false;

  if (!mapC || !mctx || mapC.width === 0 || mapC.height === 0) {
    sched();
    return;
  }

  const W = mapC.width;
  const H = mapC.height;

  // Clear canvas with background color
  mctx.fillStyle = MAP_BG_DARK;
  mctx.fillRect(0, 0, W, H);

  // Calculate visible tiles
  const z = ms.zoom;
  const cx = W / 2;
  const cy = H / 2;
  const ox = lng2x(ms.lng, z);
  const oy = lat2y(ms.lat, z);

  const stx = Math.floor((ox - cx) / TILE_SZ) - 1;
  const sty = Math.floor((oy - cy) / TILE_SZ) - 1;
  const etx = Math.ceil((ox + cx) / TILE_SZ) + 1;
  const ety = Math.ceil((oy + cy) / TILE_SZ) + 1;

  // Load all visible tiles
  const jobs = [];
  for (let ty = sty; ty <= ety; ty++) {
    for (let tx = stx; tx <= etx; tx++) {
      const url = getTile(tx, ty, z);
      const px = tx * TILE_SZ - ox + cx;
      const py = ty * TILE_SZ - oy + cy;
      jobs.push(loadTileImg(url).then(img => ({ img, px, py })));
    }
  }

  // Draw loaded tiles
  const tiles = await Promise.all(jobs);
  tiles.forEach(({ img, px, py }) => {
    if (img) {
      try {
        mctx.drawImage(img, Math.round(px), Math.round(py), TILE_SZ, TILE_SZ);
      } catch (e) {
        console.warn('Failed to draw tile:', e);
      }
    } else {
      mctx.fillStyle = MAP_BG_DARK;
      mctx.fillRect(px, py, TILE_SZ, TILE_SZ);
    }
  });

  // Draw overlays
  drawPins();
  if (showHeat) drawHeat();

  // Keep rendering for late-loading tiles
  sched();
}

/**
 * Draw incident pins on the map
 * @param {Array<Object>} incidents - Incidents to draw
 */
export function drawPins(incidents = []) {
  const layer = document.getElementById('markerLayer');
  if (!layer) return;

  layer.innerHTML = '';
  if (!showPins || !mapC) return;

  incidents.forEach(inc => {
    const lat = +inc.lat;
    const lng = +inc.lng;

    if (isNaN(lat) || isNaN(lng)) return;

    const { x, y } = ll2px(lat, lng, ms, mapC.width, mapC.height);

    // Only draw pins within view bounds (with margin)
    if (x < -20 || x > mapC.width + 20 || y < -20 || y > mapC.height + 20) return;

    // Color by status
    const colors = {
      open: '#2d9d6e',
      suspect: '#d4a017',
      closed: '#e63946'
    };
    const color = colors[inc.status] || '#e63946';

    // Create pin element
    const pin = document.createElement('div');
    pin.style.cssText = `
      position: absolute;
      left: ${x - 9}px;
      top: ${y - 18}px;
      width: 18px;
      height: 18px;
      background: ${color};
      border: 2px solid rgba(255, 255, 255, 0.85);
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 0 10px ${color}99, 0 2px 6px rgba(0, 0, 0, 0.7);
      cursor: pointer;
      pointer-events: all;
      transition: transform 0.12s;
      z-index: 10;
    `;

    pin.addEventListener('click', e => {
      e.stopPropagation();
      // Dispatch custom event for incident selection
      window.dispatchEvent(new CustomEvent('selectIncident', { detail: { id: inc.id } }));
    });

    pin.addEventListener('mouseenter', () => {
      pin.style.transform = 'rotate(-45deg) scale(1.35)';
    });

    pin.addEventListener('mouseleave', () => {
      pin.style.transform = 'rotate(-45deg)';
    });

    layer.appendChild(pin);
  });
}

/**
 * Draw heatmap overlay
 * @param {Array<Object>} incidents - Incidents for heatmap
 */
export function drawHeat(incidents = []) {
  if (!heatC || !hctx) return;

  const W = heatC.width;
  const H = heatC.height;

  hctx.clearRect(0, 0, W, H);
  if (!incidents.length || !mapC) return;

  const r = Math.max(24, Math.min(70, ms.zoom * 4.5));

  incidents.forEach(inc => {
    const lat = +inc.lat;
    const lng = +inc.lng;

    if (isNaN(lat) || isNaN(lng)) return;

    const { x, y } = ll2px(lat, lng, ms, heatC.width, heatC.height);

    // Skip if outside view
    if (x < -r || x > W + r || y < -r || y > H + r) return;

    // Create radial gradient
    const g = hctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(230, 57, 70, 0.6)');
    g.addColorStop(0.4, 'rgba(255, 107, 53, 0.3)');
    g.addColorStop(1, 'rgba(230, 57, 70, 0)');

    hctx.beginPath();
    hctx.arc(x, y, r, 0, Math.PI * 2);
    hctx.fillStyle = g;
    hctx.fill();
  });
}

/**
 * Show popup with incident information
 * @param {Object} inc - Incident object
 * @param {number} x - Canvas x coordinate
 * @param {number} y - Canvas y coordinate
 */
export function showPopup(inc, x, y) {
  const pop = document.getElementById('mapPopup');
  if (!pop || !mapC) return;

  const d = inc.datetime ? new Date(inc.datetime) : null;
  const ds = d && !isNaN(d)
    ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  pop.innerHTML = `
    <button class="popup-close" onclick="window.closeMapPopup && window.closeMapPopup()">✕</button>
    <div class="popup-title">${escapeHtml(inc.animalType)}${inc.animalDesc ? ' — ' + escapeHtml(inc.animalDesc) : ''}</div>
    <div class="popup-sub">📍 ${escapeHtml(inc.address)}</div>
    <div class="popup-sub">📅 ${ds} · ☠ ${escapeHtml(inc.severity)}</div>
    <div class="popup-sub">⚡ ${escapeHtml(inc.method)}</div>
    <button class="popup-btn" onclick="window.showDetailFromPopup && window.showDetailFromPopup('${inc.id.replace(/'/g, "\\'")}')">Full Detail →</button>
  `;

  const pW = 220;
  let left = x - pW / 2;
  left = Math.max(8, Math.min(mapC.width - pW - 8, left));
  const top = Math.max(8, y - 175);

  pop.style.left = left + 'px';
  pop.style.top = top + 'px';
  pop.style.display = 'block';
}

/**
 * Close popup
 */
export function closePopup() {
  const pop = document.getElementById('mapPopup');
  if (pop) pop.style.display = 'none';
}

/**
 * Set up map interaction (drag, zoom)
 */
function setupMapInteraction() {
  if (!mapC) return;

  mapC.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    dragging = true;
    dragStart = {
      x: e.clientX,
      y: e.clientY,
      lat: ms.lat,
      lng: ms.lng
    };
    mapC.classList.add('grabbing');
  });

  window.addEventListener('mousemove', e => {
    if (!dragging || !dragStart) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    ms.lat = y2lat(lat2y(dragStart.lat, ms.zoom) - dy, ms.zoom);
    ms.lng = x2lng(lng2x(dragStart.lng, ms.zoom) - dx, ms.zoom);

    closePopup();
    sched();
  });

  window.addEventListener('mouseup', () => {
    dragging = false;
    if (mapC) mapC.classList.remove('grabbing');
  });
}

/**
 * Zoom in
 */
export function zoomIn() {
  ms.zoom = Math.min(MAX_Z, ms.zoom + 1);
  closePopup();
  sched();
}

/**
 * Zoom out
 */
export function zoomOut() {
  ms.zoom = Math.max(MIN_Z, ms.zoom - 1);
  closePopup();
  sched();
}

/**
 * Pan map to location
 * @param {number} lat - Target latitude
 * @param {number} lng - Target longitude
 * @param {number} zoom - Target zoom level
 */
export function panTo(lat, lng, zoom = ms.zoom) {
  ms.lat = lat;
  ms.lng = lng;
  if (zoom !== undefined) {
    ms.zoom = Math.max(MIN_Z, Math.min(MAX_Z, zoom));
  }
  closePopup();
  sched();
}

/**
 * Toggle heat map visibility
 */
export function toggleHeat() {
  showHeat = !showHeat;
  sched();
}

/**
 * Toggle pins visibility
 */
export function togglePins() {
  showPins = !showPins;
  sched();
}
