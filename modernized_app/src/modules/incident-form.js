/**
 * Incident Form Management
 * Handles form opening, closing, submission, and validation
 */

import { getCachedElement } from '../utils/dom-cache.js';
import { createISOWithTimezone } from '../utils/date-formatter.js';
import { reverseGeocode } from '../utils/nominatim-api.js';
import { extractArea } from './search.js';
import { showValidationError, hideValidationError, showToast } from './ui-utils.js';

let editingIncidentId = null;
let storedPhotos = [];

/**
 * Open report modal (new incident or edit existing)
 * @param {number} lat - Optional latitude for new incident
 * @param {number} lng - Optional longitude for new incident
 * @param {string} incidentId - Optional ID for editing existing incident
 */
export function openReport(lat, lng, incidentId) {
  editingIncidentId = incidentId || null;
  storedPhotos = [];

  const photoPrev = getCachedElement('photoPrev');
  if (photoPrev) photoPrev.innerHTML = '';

  const reportOverlay = getCachedElement('reportOverlay');
  if (!reportOverlay) return;

  if (editingIncidentId) {
    // Edit mode - pre-fill with existing data
    setupEditMode(editingIncidentId);
  } else {
    // New incident mode
    setupNewMode(lat, lng);
  }

  hideValidationError();
  reportOverlay.classList.add('open');
}

/**
 * Set up form for editing existing incident
 * @param {string} incidentId - Incident ID
 */
function setupEditMode(incidentId) {
  const titleEl = getCachedElement('reportModalTitle');
  const subEl = getCachedElement('reportSub');
  const submitBtn = getCachedElement('reportSubmitBtn');

  if (titleEl) titleEl.textContent = 'Edit Incident';
  if (submitBtn) submitBtn.textContent = 'SAVE CHANGES';
  if (subEl) subEl.textContent = `Editing incident ${incidentId}`;

  // Pre-fill form with incident data
  // Note: Actual incident loading would come from parent component
}

/**
 * Set up form for new incident
 * @param {number} lat - Optional latitude
 * @param {number} lng - Optional longitude
 */
function setupNewMode(lat, lng) {
  const titleEl = getCachedElement('reportModalTitle');
  const subEl = getCachedElement('reportSub');
  const submitBtn = getCachedElement('reportSubmitBtn');

  if (titleEl) titleEl.textContent = 'Log New Incident';
  if (submitBtn) submitBtn.textContent = 'SUBMIT INCIDENT';

  // Set default datetime to now
  const now = new Date();
  const fDatetime = getCachedElement('fDatetime');
  if (fDatetime) {
    fDatetime.value = new Date(now - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }

  // Clear input fields
  ['fAddr', 'fLat', 'fLng', 'fNotes', 'fWitName', 'fWitContact', 'fWitStatement', 'fAnimalDesc', 'fCatName'].forEach(id => {
    const el = getCachedElement(id);
    if (el) el.value = '';
  });

  // Set defaults
  const fStatus = getCachedElement('fStatus2');
  if (fStatus) fStatus.value = 'open';
  const fAnimalType = getCachedElement('fAnimalType');
  if (fAnimalType) fAnimalType.value = 'Domestic Cat';
  const fMethod = getCachedElement('fMethod2');
  if (fMethod) fMethod.value = 'Blunt Trauma';
  const fSeverity = getCachedElement('fSeverity');
  if (fSeverity) fSeverity.value = 'Fatal';

  // Handle pre-filled coordinates
  if (lat !== null && lat !== undefined && !isNaN(lat) && lng !== undefined && !isNaN(lng)) {
    const fLat = getCachedElement('fLat');
    const fLng = getCachedElement('fLng');
    if (fLat) fLat.value = lat.toFixed(5);
    if (fLng) fLng.value = lng.toFixed(5);

    if (subEl) {
      subEl.textContent = `📍 ${lat.toFixed(4)}, ${lng.toFixed(4)} — reverse geocoding…`;
    }

    // Attempt reverse geocode
    reverseGeocode(lat, lng)
      .then(addr => {
        if (addr) {
          const fAddr = getCachedElement('fAddr');
          if (fAddr) fAddr.value = addr;
        }
      })
      .catch(() => {
        // Silently fail - user can enter address manually
      });
  } else {
    if (subEl) {
      subEl.textContent = 'Click the map to pin a location, or enter an address below';
    }
  }
}

/**
 * Close report modal
 */
export function closeReport() {
  const reportOverlay = getCachedElement('reportOverlay');
  if (reportOverlay) {
    reportOverlay.classList.remove('open');
  }
  editingIncidentId = null;
}

/**
 * Handle photo uploads
 * @param {HTMLInputElement} input - File input element
 */
export function handlePhotos(input) {
  storedPhotos = [];
  const photoPrev = getCachedElement('photoPrev');
  if (photoPrev) photoPrev.innerHTML = '';

  if (!input.files) return;

  Array.from(input.files).forEach(f => {
    const reader = new FileReader();
    reader.onload = e => {
      storedPhotos.push({
        name: f.name,
        data: e.target.result
      });

      const img = document.createElement('img');
      img.src = e.target.result;
      if (photoPrev) photoPrev.appendChild(img);
    };
    reader.readAsDataURL(f);
  });
}

/**
 * Validate and submit incident form
 * Builds incident object and dispatches custom event for parent to handle
 */
export function submitReport() {
  const addr = getCachedElement('fAddr');
  const latEl = getCachedElement('fLat');
  const lngEl = getCachedElement('fLng');
  const dtEl = getCachedElement('fDatetime');

  const addrVal = addr ? addr.value.trim() : '';
  const latVal = latEl ? latEl.value.trim() : '';
  const lngVal = lngEl ? lngEl.value.trim() : '';
  const dtVal = dtEl ? dtEl.value : '';

  // Validation
  if (!dtVal) {
    showValidationError('⚠ Please enter the date and time.');
    return;
  }

  if (!addrVal && !latVal) {
    showValidationError('⚠ Please enter an address or click the map.');
    return;
  }

  const lat = parseFloat(latVal);
  const lng = parseFloat(lngVal);
  const hasCoords = !isNaN(lat) && !isNaN(lng);

  if (!hasCoords && addrVal) {
    showValidationError('🔄 Geocoding address…');
    // Dispatch event for parent to geocode
    window.dispatchEvent(new CustomEvent('geocodeAndSaveIncident', {
      detail: { address: addrVal, datetime: dtVal }
    }));
    return;
  }

  saveIncident(addrVal || `${lat.toFixed(4)},${lng.toFixed(4)}`, lat || 51.505, lng || -0.09, dtVal);
}

/**
 * Save incident (create or update)
 * Builds incident object and dispatches event for parent to handle persistence
 * @param {string} addr - Address
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} dt - Datetime string
 */
export function saveIncident(addr, lat, lng, dt) {
  const incidentData = {
    address: addr,
    area: extractArea(addr, []), // Will be properly set by parent
    lat,
    lng,
    datetime: createISOWithTimezone(dt),
    status: getCachedElementValue('fStatus2', 'open'),
    animalType: getCachedElementValue('fAnimalType', 'Domestic Cat'),
    catName: getCachedElementValue('fCatName', ''),
    animalDesc: getCachedElementValue('fAnimalDesc', ''),
    age: getCachedElementValue('fAge', ''),
    sex: getCachedElementValue('fSex', ''),
    method: getCachedElementValue('fMethod2', 'Blunt Trauma'),
    severity: getCachedElementValue('fSeverity', 'Fatal'),
    notes: getCachedElementValue('fNotes', ''),
    witnessName: getCachedElementValue('fWitName', ''),
    witnessContact: getCachedElementValue('fWitContact', ''),
    witnessStatement: getCachedElementValue('fWitStatement', ''),
    photos: [...storedPhotos]
  };

  // Dispatch event for parent to handle save/update
  if (editingIncidentId) {
    window.dispatchEvent(new CustomEvent('updateIncident', {
      detail: { id: editingIncidentId, data: incidentData }
    }));
  } else {
    window.dispatchEvent(new CustomEvent('createIncident', {
      detail: { data: incidentData }
    }));
  }

  closeReport();
}

/**
 * Get cached element value
 * @param {string} id - Element ID
 * @param {*} defaultValue - Default if element not found or empty
 * @returns {string} Element value or default
 */
function getCachedElementValue(id, defaultValue = '') {
  const el = getCachedElement(id);
  return el ? el.value.trim() || defaultValue : defaultValue;
}

/**
 * Get current editing incident ID
 * @returns {string|null} Incident ID or null
 */
export function getEditingIncidentId() {
  return editingIncidentId;
}

/**
 * Get stored photos
 * @returns {Array} Array of photo objects {name, data}
 */
export function getStoredPhotos() {
  return storedPhotos;
}
