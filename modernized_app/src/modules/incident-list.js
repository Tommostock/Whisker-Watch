/**
 * Incident List, Filtering, Sorting, and Detail View
 * Renders incident cards, handles filters/sort, and shows detail modal
 */

import { escapeHtml } from '../utils/escape-html.js';

// Sort/filter state
let sortField = 'date';
let sortDir = -1;
let filters = { status: '', method: '', area: '' };
let currentDetailId = null;
let confirmResolve = null;

/**
 * Apply filters from filter bar dropdowns
 * @param {Function} renderAllFn - Callback to re-render everything
 */
export function applyFilters(renderAllFn) {
  const fStatus = document.getElementById('fStatus');
  const fMethod = document.getElementById('fMethod');
  const fArea = document.getElementById('fArea');
  filters.status = fStatus ? fStatus.value : '';
  filters.method = fMethod ? fMethod.value : '';
  filters.area = fArea ? fArea.value : '';
  renderAllFn();
}

/**
 * Clear all filters
 * @param {Function} renderAllFn - Callback to re-render everything
 */
export function clearFilters(renderAllFn) {
  ['fStatus', 'fMethod', 'fArea'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  filters = { status: '', method: '', area: '' };
  renderAllFn();
}

/**
 * Set sort field and toggle direction
 * @param {string} field - Sort field ('date', 'area', 'status')
 * @param {HTMLElement} el - Clicked sort option element
 * @param {Function} renderAllFn - Callback to re-render everything
 */
export function setSort(field, el, renderAllFn) {
  if (sortField === field) sortDir *= -1;
  sortField = field;
  document.querySelectorAll('.sort-opt').forEach(e => e.classList.remove('active'));
  if (el) el.classList.add('active');
  renderAllFn();
}

/**
 * Get filtered and sorted incidents
 * @param {Array<Object>} incidents - All incidents
 * @returns {Array<Object>} Filtered and sorted incidents
 */
export function getFiltered(incidents) {
  let d = [...incidents];
  if (filters.status) d = d.filter(i => i.status === filters.status);
  if (filters.method) d = d.filter(i => i.method === filters.method);
  if (filters.area) d = d.filter(i => i.area === filters.area);

  d.sort((a, b) => {
    let av, bv;
    if (sortField === 'date') {
      av = a.datetime ? +new Date(a.datetime) : 0;
      bv = b.datetime ? +new Date(b.datetime) : 0;
    } else {
      av = (a[sortField] || '').toLowerCase();
      bv = (b[sortField] || '').toLowerCase();
    }
    return av < bv ? sortDir : av > bv ? -sortDir : 0;
  });
  return d;
}

/**
 * Render incident list in sidebar
 * @param {Array<Object>} incidents - All incidents
 */
export function renderList(incidents) {
  const filtered = getFiltered(incidents);
  const list = document.getElementById('incList');
  const filteredCount = document.getElementById('filteredCount');

  if (filteredCount) filteredCount.textContent = `${filtered.length}/${incidents.length}`;

  if (!list) return;

  if (!filtered.length) {
    list.innerHTML = `<div class="empty"><div class="empty-icon">${incidents.length ? '🔍' : '📍'}</div><div class="empty-txt">${incidents.length ? 'No incidents match filters.<br>Click ✕ Clear to reset.' : 'No incidents logged yet.<br>Click <strong style="color:var(--accent)">+ Log Incident</strong><br>or tap the map.'}</div></div>`;
    return;
  }

  list.innerHTML = filtered.map(inc => {
    const d = inc.datetime ? new Date(inc.datetime) : null;
    const ds = d && !isNaN(d) ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
    const ts = d && !isNaN(d) ? d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '';
    const sid = inc.id.replace(/'/g, "\\'");
    const animalTitle = inc.catName ? `${escapeHtml(inc.catName)} (${escapeHtml(inc.animalType)})` : escapeHtml(inc.animalType);

    return `<div class="inc-card s-${inc.status}" onclick="showDetail('${sid}')">
      <div class="card-hdr"><span class="card-id">${escapeHtml(inc.id)}</span><span class="sbadge b-${inc.status}">${inc.status === 'suspect' ? 'SUSPECT' : inc.status.toUpperCase()}</span></div>
      <div class="card-animal">${animalTitle}${inc.animalDesc ? ' — ' + escapeHtml(inc.animalDesc) : ''}</div>
      <div class="card-loc">📍 ${escapeHtml(inc.address)}</div>
      <div class="card-meta"><span class="mtag">📅 ${ds} ${ts}</span><span class="mtag">⚡ ${escapeHtml(inc.method)}</span><span class="mtag">☠ ${escapeHtml(inc.severity)}</span>${inc.photos && inc.photos.length ? `<span class="mtag">📷 ${inc.photos.length}</span>` : ''}</div>
    </div>`;
  }).join('');
}

/**
 * Update header counts
 * @param {Array<Object>} incidents - All incidents
 */
export function updateCounts(incidents) {
  const cTotal = document.getElementById('cTotal');
  const cOpen = document.getElementById('cOpen');
  const cClosed = document.getElementById('cClosed');
  if (cTotal) cTotal.textContent = incidents.length;
  if (cOpen) cOpen.textContent = incidents.filter(i => i.status === 'open').length;
  if (cClosed) cClosed.textContent = incidents.filter(i => i.status === 'closed').length;
}

/**
 * Update area filter dropdown with available areas
 * @param {Array<Object>} incidents - All incidents
 */
export function updateAreaFilter(incidents) {
  const areas = [...new Set(incidents.map(i => i.area).filter(a => a && a !== 'Unknown'))].sort();
  const sel = document.getElementById('fArea');
  if (!sel) return;
  const cur = sel.value;
  sel.innerHTML = '<option value="">All Areas</option>' + areas.map(a => `<option value="${escapeHtml(a)}">${escapeHtml(a)}</option>`).join('');
  if (cur && areas.includes(cur)) sel.value = cur;
}

/**
 * Show incident detail modal
 * @param {string} id - Incident ID
 * @param {Array<Object>} incidents - All incidents
 */
export function showDetail(id, incidents) {
  const inc = incidents.find(i => i.id === id);
  if (!inc) return;
  currentDetailId = id;

  const detailTitle = inc.catName
    ? `${inc.catName} (${inc.animalType})`
    : `${inc.animalType}${inc.animalDesc ? ' — ' + inc.animalDesc : ''}`;

  const titleEl = document.getElementById('detailTitle');
  const subEl = document.getElementById('detailSub');
  if (titleEl) titleEl.textContent = detailTitle;
  if (subEl) subEl.textContent = `${inc.id} · ${inc.status === 'suspect' ? 'Suspect Identified' : inc.status.charAt(0).toUpperCase() + inc.status.slice(1)}`;

  const d = inc.datetime ? new Date(inc.datetime) : null;
  const ds = d && !isNaN(d) ? d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + ' at ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—';
  const lat = +inc.lat, lng = +inc.lng;

  const fields = [
    ['Status', `<span class="sbadge b-${inc.status}">${inc.status === 'suspect' ? "SUSPECT ID'D" : inc.status.toUpperCase()}</span>`],
    ['Date & Time', escapeHtml(ds)],
    ['Location', escapeHtml(inc.address)],
    ['Area', escapeHtml(inc.area)],
    ['Coords', (!isNaN(lat) && !isNaN(lng)) ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : '—'],
    ['Animal', escapeHtml(inc.animalType) + (inc.animalDesc ? ' — ' + escapeHtml(inc.animalDesc) : '')],
  ];

  if (inc.catName) fields.push(['Cat Name', escapeHtml(inc.catName)]);

  fields.push(
    ['Age', inc.age ? escapeHtml(inc.age) + ' years' : '<span style="color:var(--text-dim)">Unknown</span>'],
    ['Sex', inc.sex ? escapeHtml(inc.sex) : '<span style="color:var(--text-dim)">Unknown</span>'],
    ['Method', escapeHtml(inc.method)],
    ['Severity', escapeHtml(inc.severity)],
    ['Notes', escapeHtml(inc.notes) || '<span style="color:var(--text-dim)">None</span>'],
    ['Witness', inc.witnessName ? escapeHtml(inc.witnessName) + (inc.witnessContact ? ' · ' + escapeHtml(inc.witnessContact) : '') : '<span style="color:var(--text-dim)">None</span>'],
    ['Statement', escapeHtml(inc.witnessStatement) || '<span style="color:var(--text-dim)">None</span>'],
    ['Logged', escapeHtml(new Date(inc.createdAt).toLocaleString('en-GB'))]
  );

  if (inc.updatedAt) fields.push(['Last Edited', escapeHtml(new Date(inc.updatedAt).toLocaleString('en-GB'))]);

  const photos = inc.photos && inc.photos.length
    ? `<div class="dfield"><div class="dlabel">Photos</div><div class="dval"><div class="dphotos">${inc.photos.map(p => `<img src="${p.data}" title="${escapeHtml(p.name)}" onclick="openLightbox('${p.data.replace(/'/g, "\\'")}');event.stopPropagation();">`).join('')}</div></div></div>`
    : '';

  const flyBtn = (!isNaN(lat) && !isNaN(lng))
    ? `<button class="btn btn-ghost btn-sm" onclick="flyTo('${id.replace(/'/g, "\\'")}')" style="margin-top:12px">📍 Show on Map</button>`
    : '';

  const detailBody = document.getElementById('detailBody');
  if (detailBody) {
    detailBody.innerHTML = fields.map(([l, v]) => `<div class="dfield"><div class="dlabel">${l}</div><div class="dval">${v}</div></div>`).join('') + photos + `<div style="text-align:center">${flyBtn}</div>`;
  }

  // Edit button
  const editBtn = document.getElementById('editBtn');
  if (editBtn) {
    editBtn.onclick = () => {
      closeDetail();
      window.dispatchEvent(new CustomEvent('editIncident', { detail: { id } }));
    };
  }

  const detailOverlay = document.getElementById('detailOverlay');
  if (detailOverlay) detailOverlay.classList.add('open');
}

/**
 * Close detail modal
 */
export function closeDetail() {
  const detailOverlay = document.getElementById('detailOverlay');
  if (detailOverlay) detailOverlay.classList.remove('open');
  currentDetailId = null;
}

/**
 * Get current detail incident ID
 * @returns {string|null}
 */
export function getCurrentDetailId() {
  return currentDetailId;
}

/**
 * Set up delete button with confirm dialog
 * @param {Function} onDelete - Callback after successful delete (receives id)
 */
export function setupDeleteButton(onDelete) {
  const deleteBtn = document.getElementById('deleteBtn');
  if (!deleteBtn) return;

  deleteBtn.addEventListener('click', async () => {
    if (!currentDetailId) return;

    const confirmed = await new Promise(r => {
      confirmResolve = r;
      const confirmOverlay = document.getElementById('confirmOverlay');
      if (confirmOverlay) confirmOverlay.classList.add('open');
    });

    if (!confirmed) return;
    onDelete(currentDetailId);
    closeDetail();
  });
}

/**
 * Resolve confirm dialog
 * @param {boolean} value - true to confirm, false to cancel
 */
export function resolveConfirm(value) {
  const confirmOverlay = document.getElementById('confirmOverlay');
  if (confirmOverlay) confirmOverlay.classList.remove('open');
  if (confirmResolve) {
    confirmResolve(value);
    confirmResolve = null;
  }
}

/**
 * Fly to incident on map
 * @param {string} id - Incident ID
 * @param {Array<Object>} incidents - All incidents
 * @param {Object} mapState - Map state object (ms)
 * @param {Function} schedFn - Schedule render function
 * @param {Function} showPopupFn - Show popup function
 * @param {Function} ll2pxFn - Coordinate conversion function
 */
export function flyTo(id, incidents, mapState, schedFn, showPopupFn, ll2pxFn) {
  const inc = incidents.find(i => i.id === id);
  if (!inc) return;
  const lat = +inc.lat, lng = +inc.lng;
  if (isNaN(lat) || isNaN(lng)) return;

  closeDetail();

  mapState.lat = lat;
  mapState.lng = lng;
  mapState.zoom = 15;
  schedFn();

  setTimeout(() => {
    const pos = ll2pxFn(lat, lng);
    showPopupFn(inc, pos.x, pos.y);
  }, 400);
}
