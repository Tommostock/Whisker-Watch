'use strict';

/**
 * Whisker Watch — SLAIN Network
 * Main Application Entry Point
 *
 * Orchestrates all modules and handles initialization.
 * This file replaces the monolithic <script> block from the original index.html.
 */

// ── Styles ──
import './styles/base.css';
import './styles/theme.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/map.css';
import './styles/responsive.css';

// ── Constants ──
import { BOROUGHS } from './constants/boroughs.js';
import { INITIAL_MAP_STATE } from './constants/map-config.js';

// ── Utils ──
import { escapeHtml } from './utils/escape-html.js';
import { ll2px } from './utils/mercator.js';

// ── Modules ──
import { initializeTheme, toggleTheme, getCurrentTheme } from './modules/theme.js';
import { showToast } from './modules/ui-utils.js';
import { saveData, loadData } from './modules/incident-data.js';
import { extractArea, geocodeAddr } from './modules/search.js';
import { initMapEngine, ms, sched, zoomIn, zoomOut, panTo, showPopup, closePopup, drawPins, drawHeat, showHeat, showPins, toggleHeat as mapToggleHeat, togglePins as mapTogglePins } from './modules/map-engine.js';
import { openReport, closeReport, submitReport, handlePhotos, saveIncident } from './modules/incident-form.js';
import { renderList, updateCounts, updateAreaFilter, showDetail, closeDetail, applyFilters, clearFilters, setSort, setupDeleteButton, resolveConfirm, flyTo, getCurrentDetailId } from './modules/incident-list.js';
import { renderStats } from './modules/stats.js';

// ═══════════════════════════════════════════
//  APPLICATION STATE
// ═══════════════════════════════════════════
let incidents = [];
let tileCache = new Map();

// ═══════════════════════════════════════════
//  RENDER ALL (master re-render function)
// ═══════════════════════════════════════════
function renderAll() {
  renderList(incidents);
  updateCounts(incidents);
  updateAreaFilter(incidents);
  renderStats(incidents);
  drawPins(incidents);
  if (showHeat) drawHeat(incidents);
}

// ═══════════════════════════════════════════
//  SAMPLE DATA
// ═══════════════════════════════════════════
function loadSamples() {
  if (incidents.length) return;
  incidents = [
    { id: 'INC-DEMO1', address: 'Croydon, South London', area: 'Croydon', lat: 51.3757, lng: -0.0982, datetime: '2024-11-14T22:30:00+00:00', status: 'open', animalType: 'Domestic Cat', catName: 'Mittens', animalDesc: 'Black & white, male', age: '3', sex: 'Male', method: 'Blunt Trauma', severity: 'Fatal', notes: 'Found in rear garden. Injuries consistent with series.', witnessName: 'M. Davies', witnessContact: '07700900001', witnessStatement: 'Heard loud noise at ~22:30.', photos: [], createdAt: '2024-11-14T23:10:00Z' },
    { id: 'INC-DEMO2', address: 'Bromley, South East London', area: 'Bromley', lat: 51.4069, lng: 0.0161, datetime: '2024-11-20T19:00:00+00:00', status: 'suspect', animalType: 'Domestic Cat', catName: 'Luna', animalDesc: 'Tabby, female', age: '5', sex: 'Spayed Female', method: 'Sharp Force', severity: 'Fatal', notes: 'Third incident in this postcode. CCTV under review.', witnessName: '', witnessContact: '', witnessStatement: '', photos: [], createdAt: '2024-11-20T20:00:00Z' },
    { id: 'INC-DEMO3', address: 'Sutton, South London', area: 'Sutton', lat: 51.3618, lng: -0.1945, datetime: '2024-12-01T21:00:00+00:00', status: 'open', animalType: 'Domestic Cat', catName: 'Shadow', animalDesc: 'Grey Persian', age: '8', sex: 'Female', method: 'Blunt Trauma', severity: 'Fatal', notes: 'Owner found cat on front path. No road trauma signs.', witnessName: '', witnessContact: '', witnessStatement: '', photos: [], createdAt: '2024-12-01T22:00:00Z' },
    { id: 'INC-DEMO4', address: 'Merton, South West London', area: 'Merton', lat: 51.4098, lng: -0.1772, datetime: '2024-12-10T20:30:00+00:00', status: 'closed', animalType: 'Domestic Cat', catName: 'Ginger', animalDesc: 'Orange tabby, male', age: '2', sex: 'Neutered Male', method: 'Sharp Force', severity: 'Fatal', notes: 'Referred to Metropolitan Police. File #MPS-2024-112233.', witnessName: 'S. Patel', witnessContact: '07700900002', witnessStatement: 'Saw a figure near alley at 20:15.', photos: [], createdAt: '2024-12-10T21:30:00Z' },
    { id: 'INC-DEMO5', address: 'Streatham, South London', area: 'Streatham', lat: 51.4271, lng: -0.1238, datetime: '2024-12-18T23:00:00+00:00', status: 'open', animalType: 'Domestic Cat', catName: '', animalDesc: 'Black, sex unknown', age: '', sex: '', method: 'Decapitation', severity: 'Fatal', notes: 'Significant mutilation. Decapitation case.', witnessName: '', witnessContact: '', witnessStatement: '', photos: [], createdAt: '2024-12-18T23:45:00Z' },
    { id: 'INC-DEMO6', address: 'Thornton Heath, Croydon', area: 'Croydon', lat: 51.398, lng: -0.105, datetime: '2025-01-05T01:30:00+00:00', status: 'open', animalType: 'Kitten', catName: 'Whiskers', animalDesc: 'White & brown, female', age: '< 1', sex: 'Female', method: 'Roadkill', severity: 'Fatal', notes: 'Found on A23. Appears to be hit by vehicle.', witnessName: '', witnessContact: '', witnessStatement: '', photos: [], createdAt: '2025-01-05T09:00:00Z' },
    { id: 'INC-DEMO7', address: 'Catford, Lewisham', area: 'Lewisham', lat: 51.4451, lng: -0.0194, datetime: '2025-01-12T22:00:00+00:00', status: 'suspect', animalType: 'Domestic Cat', catName: 'Bella', animalDesc: 'Tortoiseshell, female', age: '12', sex: 'Spayed Female', method: 'Strangulation', severity: 'Fatal', notes: 'Only strangulation case. Suspect description circulated locally.', witnessName: 'T. Okonkwo', witnessContact: '07700900003', witnessStatement: 'Man in dark clothing near bins ~22:00.', photos: [], createdAt: '2025-01-12T23:15:00Z' },
    { id: 'INC-DEMO8', address: 'Peckham, Southwark', area: 'Southwark', lat: 51.4729, lng: -0.0694, datetime: '2025-01-22T20:45:00+00:00', status: 'open', animalType: 'Domestic Cat', catName: 'Oscar', animalDesc: 'Siamese mix', age: '6', sex: 'Neutered Male', method: 'Accident', severity: 'Fatal', notes: 'Fell from third-floor balcony.', witnessName: '', witnessContact: '', witnessStatement: '', photos: [], createdAt: '2025-01-22T21:30:00Z' },
  ];
  saveData(incidents);
}

// ═══════════════════════════════════════════
//  SEARCH LOGIC
// ═══════════════════════════════════════════
let searchTimer;
const searchIn = document.getElementById('searchIn');
const searchDrop = document.getElementById('searchDrop');

function runSearch(q) {
  if (!q) return;
  const viewbox = '-0.5,51.3,0.3,51.7';
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=10&countrycodes=gb&viewbox=${viewbox}&bounded=0`)
    .then(r => r.json()).then(data => {
      searchDrop.innerHTML = data.length
        ? data.map(d => {
          const l = d.display_name.split(',').slice(0, 3).join(', ');
          return `<div class="search-item" data-lat="${+d.lat}" data-lng="${+d.lon}" data-label="${escapeHtml(l)}">${l}</div>`;
        }).join('')
        : '<div class="search-item" style="color:var(--text-dim)">No results found</div>';
      searchDrop.style.display = 'block';
    }).catch(() => {
      searchDrop.innerHTML = '<div class="search-item" style="color:var(--text-dim)">Search unavailable</div>';
      searchDrop.style.display = 'block';
    });
}

// Search dropdown click handler
searchDrop.addEventListener('click', e => {
  const item = e.target.closest('.search-item');
  if (!item || !item.dataset.lat) return;
  const lat = +item.dataset.lat, lng = +item.dataset.lng;
  ms.lat = lat; ms.lng = lng; ms.zoom = 15;
  sched();
  searchDrop.style.display = 'none';
  searchIn.value = '';
  openReport(lat, lng, null);
});

searchIn.addEventListener('input', function () {
  clearTimeout(searchTimer);
  const q = this.value.trim();
  if (q.length < 3) { searchDrop.style.display = 'none'; return; }
  searchTimer = setTimeout(() => runSearch(q), 400);
});
searchIn.addEventListener('keydown', e => {
  if (e.key === 'Enter') runSearch(searchIn.value.trim());
  if (e.key === 'Escape') searchDrop.style.display = 'none';
});

// ═══════════════════════════════════════════
//  MODAL ADDRESS AUTOCOMPLETE
// ═══════════════════════════════════════════
const modalAddrIn = document.getElementById('fAddr');
const modalAddrDrop = document.getElementById('modalAddrDrop');
let modalSearchTimer;

modalAddrIn.addEventListener('input', function () {
  clearTimeout(modalSearchTimer);
  const q = this.value.trim();
  if (q.length < 3) { modalAddrDrop.style.display = 'none'; return; }
  modalSearchTimer = setTimeout(() => runModalSearch(q), 400);
});
modalAddrIn.addEventListener('keydown', e => { if (e.key === 'Escape') modalAddrDrop.style.display = 'none'; });

function runModalSearch(q) {
  if (!q) return;
  const viewbox = '-0.5,51.3,0.3,51.7';
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=10&countrycodes=gb&viewbox=${viewbox}&bounded=0`)
    .then(r => r.json()).then(data => {
      modalAddrDrop.innerHTML = data.length
        ? data.map(d => {
          const l = d.display_name.split(',').slice(0, 3).join(', ');
          return `<div class="search-item" data-lat="${+d.lat}" data-lng="${+d.lon}" data-full="${escapeHtml(d.display_name)}">${l}</div>`;
        }).join('')
        : '<div class="search-item" style="color:var(--text-dim)">No results found</div>';
      modalAddrDrop.style.display = 'block';
    }).catch(() => {
      modalAddrDrop.innerHTML = '<div class="search-item" style="color:var(--text-dim)">Search unavailable</div>';
      modalAddrDrop.style.display = 'block';
    });
}

modalAddrDrop.addEventListener('click', e => {
  const item = e.target.closest('.search-item');
  if (!item || !item.dataset.lat) return;
  const lat = +item.dataset.lat, lng = +item.dataset.lng;
  document.getElementById('fAddr').value = item.dataset.full;
  document.getElementById('fLat').value = lat.toFixed(5);
  document.getElementById('fLng').value = lng.toFixed(5);
  document.getElementById('geoStatus').textContent = '✓ Location set';
  document.getElementById('geoStatus').style.color = 'var(--green)';
  modalAddrDrop.style.display = 'none';
  ms.lat = lat; ms.lng = lng; ms.zoom = 15; sched();
});

// Close dropdowns on outside click
document.addEventListener('click', e => {
  if (!e.target.closest('.search-wrap')) searchDrop.style.display = 'none';
  if (!e.target.closest('#fAddr') && !e.target.closest('#modalAddrDrop')) modalAddrDrop.style.display = 'none';
});

// ═══════════════════════════════════════════
//  SIDEBAR TABS
// ═══════════════════════════════════════════
function switchTab(name) {
  const ns = ['inc', 'stats'];
  document.querySelectorAll('.tab').forEach((t, i) => t.classList.toggle('active', ns[i] === name));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  const pane = document.getElementById('pane-' + name);
  if (pane) pane.classList.add('active');
}

// ═══════════════════════════════════════════
//  TOAST (original implementation)
// ═══════════════════════════════════════════
function toast(msg, col) {
  const t = document.getElementById('toast');
  t.style.borderColor = col || 'var(--green)';
  t.style.color = col || 'var(--green)';
  document.getElementById('toastMsg').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
}

// ═══════════════════════════════════════════
//  LIGHTBOX
// ═══════════════════════════════════════════
function openLightbox(imageSrc) {
  const lightbox = document.getElementById('lightbox');
  document.getElementById('lightboxImg').src = imageSrc;
  lightbox.classList.add('open');
  lightbox.onclick = e => { if (e.target === lightbox) closeLightbox(); };
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
}

// ═══════════════════════════════════════════
//  MAP CONTROLS
// ═══════════════════════════════════════════
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
}

function toggleHeat() {
  mapToggleHeat();
  const btn = document.getElementById('btnHeat');
  if (btn) {
    btn.classList.toggle('on');
    btn.textContent = btn.classList.contains('on') ? '🌡 HEATMAP ON' : '🌡 HEATMAP OFF';
  }
  drawHeat(incidents);
}

function toggleMarkers() {
  mapTogglePins();
  const btn = document.getElementById('btnMarkers');
  if (btn) {
    btn.classList.toggle('on');
    btn.textContent = btn.classList.contains('on') ? '📍 MARKERS ON' : '📍 MARKERS OFF';
  }
  drawPins(incidents);
}

function fitAll() {
  if (!incidents.length) return;
  let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
  incidents.forEach(i => {
    const lat = +i.lat, lng = +i.lng;
    if (isNaN(lat) || isNaN(lng)) return;
    minLat = Math.min(minLat, lat); maxLat = Math.max(maxLat, lat);
    minLng = Math.min(minLng, lng); maxLng = Math.max(maxLng, lng);
  });
  ms.lat = (minLat + maxLat) / 2;
  ms.lng = (minLng + maxLng) / 2;
  ms.zoom = 11;
  closePopup(); sched();
}

function resetView() {
  ms.lat = INITIAL_MAP_STATE.lat;
  ms.lng = INITIAL_MAP_STATE.lng;
  ms.zoom = INITIAL_MAP_STATE.zoom;
  closePopup(); sched();
}

// ═══════════════════════════════════════════
//  CANVAS RESIZE
// ═══════════════════════════════════════════
function resizeCvs() {
  const mapCanvas = document.getElementById('mapCanvas');
  const heatCanvas = document.getElementById('heatCanvas');
  const wrap = document.getElementById('mapWrap');
  if (!wrap || !mapCanvas || !heatCanvas) return;
  mapCanvas.width = wrap.clientWidth;
  mapCanvas.height = wrap.clientHeight;
  heatCanvas.width = wrap.clientWidth;
  heatCanvas.height = wrap.clientHeight;
  sched();
}

// ═══════════════════════════════════════════
//  SUSPECT DESCRIPTION FIELD TOGGLE
// ═══════════════════════════════════════════
function updateFormForStatus() {
  const status = document.getElementById('fStatus2');
  const suspectGroup = document.getElementById('suspectDescGroup');
  if (!status || !suspectGroup) return;

  if (status.value === 'suspect') {
    suspectGroup.style.display = 'block';
  } else {
    suspectGroup.style.display = 'none';
  }
}

// ═══════════════════════════════════════════
//  HANDLE INCIDENT SAVE (from form module)
// ═══════════════════════════════════════════
function doSave(addr, lat, lng, dt) {
  const off = -new Date(dt).getTimezoneOffset();
  const tzStr = (off >= 0 ? '+' : '-') + String(Math.floor(Math.abs(off) / 60)).padStart(2, '0') + ':' + String(Math.abs(off) % 60).padStart(2, '0');

  const incidentData = {
    address: addr, area: extractArea(addr, BOROUGHS), lat, lng,
    datetime: dt + ':00' + tzStr, status: document.getElementById('fStatus2').value,
    animalType: document.getElementById('fAnimalType').value,
    catName: document.getElementById('fCatName').value.trim(),
    animalDesc: document.getElementById('fAnimalDesc').value.trim(),
    age: document.getElementById('fAge').value,
    sex: document.getElementById('fSex').value,
    method: document.getElementById('fMethod2').value,
    severity: document.getElementById('fSeverity').value,
    notes: document.getElementById('fNotes').value.trim(),
    witnessName: document.getElementById('fWitName').value.trim(),
    witnessContact: document.getElementById('fWitContact').value.trim(),
    witnessStatement: document.getElementById('fWitStatement').value.trim(),
    photos: []
  };

  // Check if editing
  const editId = window._editingIncidentId;
  if (editId) {
    const idx = incidents.findIndex(i => i.id === editId);
    if (idx !== -1) {
      incidents[idx] = { ...incidents[idx], ...incidentData, updatedAt: new Date().toISOString() };
      saveData(incidents); closeReport(); renderAll();
      toast('Incident ' + editId + ' updated');
      ms.lat = lat; ms.lng = lng; ms.zoom = Math.max(ms.zoom, 13); sched();
    }
  } else {
    const id = 'INC-' + Date.now().toString(36).toUpperCase().slice(-6);
    incidents.push({ id, ...incidentData, createdAt: new Date().toISOString() });
    saveData(incidents); closeReport(); renderAll();
    toast('Incident ' + id + ' logged');
    ms.lat = lat; ms.lng = lng; ms.zoom = Math.max(ms.zoom, 13); sched();
  }
}

function handleSubmitReport() {
  const addr = document.getElementById('fAddr').value.trim();
  const latV = document.getElementById('fLat').value.trim();
  const lngV = document.getElementById('fLng').value.trim();
  const dt = document.getElementById('fDatetime').value;
  const vm = document.getElementById('valMsg');
  vm.style.display = 'none';

  if (!dt) { vm.textContent = '⚠ Please enter the date and time.'; vm.style.display = 'block'; return; }
  if (!addr && !latV) { vm.textContent = '⚠ Please enter an address or click the map.'; vm.style.display = 'block'; return; }

  const lat = parseFloat(latV), lng = parseFloat(lngV);
  const hasCoords = !isNaN(lat) && !isNaN(lng);

  if (!hasCoords && addr) {
    vm.textContent = '🔄 Geocoding address…'; vm.style.display = 'block';
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr + ' London UK')}&limit=1&countrycodes=gb`)
      .then(r => r.json()).then(d => { doSave(addr, d.length ? +d[0].lat : 51.505, d.length ? +d[0].lon : -0.09, dt); })
      .catch(() => doSave(addr, 51.505, -0.09, dt));
    return;
  }
  doSave(addr || `${lat.toFixed(4)},${lng.toFixed(4)}`, lat || 51.505, lng || -0.09, dt);
}

// ═══════════════════════════════════════════
//  MAP CLICK → NEW INCIDENT
// ═══════════════════════════════════════════
let t0 = null;
const mapCanvas = document.getElementById('mapCanvas');

mapCanvas.addEventListener('mousedown', () => { t0 = Date.now(); });
mapCanvas.addEventListener('mouseup', e => {
  if (!t0 || Date.now() - t0 > 300) return; // Ignore drags
  t0 = null;
  const rect = mapCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left, y = e.clientY - rect.top;
  const canvasWidth = mapCanvas.width, canvasHeight = mapCanvas.height;

  // Check if clicking near an existing pin first
  // (pins handle their own click events via stopPropagation)

  // Convert pixel to lat/lng for new incident
  const { lat, lng } = (() => {
    const { lng2x, lat2y, x2lng, y2lat } = (() => {
      const TILE_SZ = 256;
      return {
        lng2x: (lng, z) => ((lng + 180) / 360) * Math.pow(2, z) * TILE_SZ,
        lat2y: (lat, z) => { const r = lat * Math.PI / 180; return (1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * Math.pow(2, z) * TILE_SZ; },
        x2lng: (x, z) => x / (Math.pow(2, z) * TILE_SZ) * 360 - 180,
        y2lat: (y, z) => { const n = Math.PI - 2 * Math.PI * y / (Math.pow(2, z) * TILE_SZ); return 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))); }
      };
    })();
    const z = ms.zoom, cx = canvasWidth / 2, cy = canvasHeight / 2;
    return {
      lat: y2lat(lat2y(ms.lat, z) + (y - cy), z),
      lng: x2lng(lng2x(ms.lng, z) + (x - cx), z)
    };
  })();

  openReport(lat, lng, null);
});

// Mouse wheel zoom
mapCanvas.addEventListener('wheel', e => {
  e.preventDefault();
  const nz = Math.max(9, Math.min(17, ms.zoom + (e.deltaY < 0 ? 1 : -1)));
  if (nz !== ms.zoom) { ms.zoom = nz; closePopup(); sched(); }
}, { passive: false });

// Touch support
let lastTouch = null;
mapCanvas.addEventListener('touchstart', e => {
  if (e.touches.length === 1) {
    lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY, lat: ms.lat, lng: ms.lng };
    e.preventDefault();
  }
}, { passive: false });
mapCanvas.addEventListener('touchmove', e => {
  if (!lastTouch || e.touches.length !== 1) return;
  e.preventDefault();
  const dx = e.touches[0].clientX - lastTouch.x;
  const dy = e.touches[0].clientY - lastTouch.y;
  const TILE_SZ = 256;
  const lat2y = (lat, z) => { const r = lat * Math.PI / 180; return (1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * Math.pow(2, z) * TILE_SZ; };
  const y2lat = (y, z) => { const n = Math.PI - 2 * Math.PI * y / (Math.pow(2, z) * TILE_SZ); return 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))); };
  const lng2x = (lng, z) => ((lng + 180) / 360) * Math.pow(2, z) * TILE_SZ;
  const x2lng = (x, z) => x / (Math.pow(2, z) * TILE_SZ) * 360 - 180;
  ms.lat = y2lat(lat2y(lastTouch.lat, ms.zoom) - dy, ms.zoom);
  ms.lng = x2lng(lng2x(lastTouch.lng, ms.zoom) - dx, ms.zoom);
  closePopup(); sched();
}, { passive: false });
mapCanvas.addEventListener('touchend', () => { lastTouch = null; });

// ═══════════════════════════════════════════
//  GLOBAL FUNCTION BINDINGS (for onclick attrs in HTML)
// ═══════════════════════════════════════════
window.showDetail = (id) => showDetail(id, incidents);
window.closeDetail = closeDetail;
window.flyTo = (id) => {
  const inc = incidents.find(i => i.id === id);
  if (!inc) return;
  const lat = +inc.lat, lng = +inc.lng;
  if (isNaN(lat) || isNaN(lng)) return;
  closeDetail();
  ms.lat = lat; ms.lng = lng; ms.zoom = 15;
  sched();
  setTimeout(() => {
    const mapC = document.getElementById('mapCanvas');
    const pos = ll2px(lat, lng, ms, mapC.width, mapC.height);
    showPopup(inc, pos.x, pos.y);
  }, 400);
};
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.closeMapPopup = closePopup;
window.showDetailFromPopup = (id) => showDetail(id, incidents);
window.resolveConfirm = resolveConfirm;

// ═══════════════════════════════════════════
//  EVENT LISTENERS
// ═══════════════════════════════════════════

// Header buttons
document.getElementById('themeToggle').addEventListener('click', () => {
  toggleTheme();
  const isLight = getCurrentTheme() === 'light';
  document.getElementById('themeToggle').textContent = isLight ? '☀️' : '🌙';
  // Clear tile cache for theme-switched tiles
  tileCache.clear();
  sched();
});

document.getElementById('loginBtn').addEventListener('click', () => {
  toast('Authentication coming soon - stay tuned!', 'var(--yellow)');
});

document.getElementById('logIncidentBtn').addEventListener('click', () => openReport(null, null, null));

// Sidebar tabs
document.getElementById('tabInc').addEventListener('click', () => switchTab('inc'));
document.getElementById('tabStats').addEventListener('click', () => switchTab('stats'));

// Filters
document.getElementById('fStatus').addEventListener('change', () => applyFilters(renderAll));
document.getElementById('fMethod').addEventListener('change', () => applyFilters(renderAll));
document.getElementById('fArea').addEventListener('change', () => applyFilters(renderAll));
document.getElementById('clearFiltersBtn').addEventListener('click', () => clearFilters(renderAll));

// Sort
document.getElementById('sortDate').addEventListener('click', function () { setSort('date', this, renderAll); });
document.getElementById('sortArea').addEventListener('click', function () { setSort('area', this, renderAll); });
document.getElementById('sortStatus').addEventListener('click', function () { setSort('status', this, renderAll); });

// Map controls
document.getElementById('toggleSidebarBtn').addEventListener('click', toggleSidebar);
document.getElementById('btnHeat').addEventListener('click', toggleHeat);
document.getElementById('btnMarkers').addEventListener('click', toggleMarkers);
document.getElementById('btnFitAll').addEventListener('click', fitAll);
document.getElementById('btnReset').addEventListener('click', resetView);
document.getElementById('zoomInBtn').addEventListener('click', zoomIn);
document.getElementById('zoomOutBtn').addEventListener('click', zoomOut);

// Report modal
document.getElementById('closeReportBtn').addEventListener('click', closeReport);
document.getElementById('cancelReportBtn').addEventListener('click', closeReport);
document.getElementById('reportSubmitBtn').addEventListener('click', handleSubmitReport);
document.getElementById('geocodeBtn').addEventListener('click', geocodeAddr);
document.getElementById('fPhotos').addEventListener('change', function () { handlePhotos(this); });
document.getElementById('fStatus2').addEventListener('change', updateFormForStatus);

// Detail modal
document.getElementById('closeDetailBtn').addEventListener('click', closeDetail);
document.getElementById('closeDetailBtn2').addEventListener('click', closeDetail);

// Delete with confirm
setupDeleteButton((id) => {
  incidents = incidents.filter(i => i.id !== id);
  saveData(incidents);
  renderAll();
  toast('Incident deleted', 'var(--yellow)');
});

document.getElementById('confirmCancelBtn').addEventListener('click', () => resolveConfirm(false));
document.getElementById('confirmNoBtn').addEventListener('click', () => resolveConfirm(false));
document.getElementById('confirmYesBtn').addEventListener('click', () => resolveConfirm(true));

// Lightbox
document.getElementById('closeLightboxBtn').addEventListener('click', closeLightbox);

// Edit incident event
window.addEventListener('editIncident', e => {
  openReport(null, null, e.detail.id);
});

// Incident selection from map pin
window.addEventListener('selectIncident', e => {
  showDetail(e.detail.id, incidents);
});

// Canvas resize observer
new ResizeObserver(resizeCvs).observe(document.getElementById('mapWrap'));

// ═══════════════════════════════════════════
//  INITIALIZATION
// ═══════════════════════════════════════════
initializeTheme();
initMapEngine(document.getElementById('mapCanvas'), document.getElementById('heatCanvas'));
incidents = loadData();
loadSamples();
renderAll();
resizeCvs();
sched();
