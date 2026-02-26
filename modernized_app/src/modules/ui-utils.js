/**
 * UI Utilities
 * Toast notifications, lightbox, modal tabs, and other UI helpers
 */

import { getCachedElement } from '../utils/dom-cache.js';

/**
 * Show toast notification (temporary message)
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds (default 3000)
 */
export function showToast(message, duration = 3000) {
  // Create toast element if it doesn't exist
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 12px 16px;
      border-radius: 6px;
      z-index: 9999;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      opacity: 0;
      transition: opacity 0.3s;
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = '1';

  clearTimeout(toast.timeoutId);
  toast.timeoutId = setTimeout(() => {
    toast.style.opacity = '0';
  }, duration);
}

/**
 * Show/hide lightbox (image viewer)
 * @param {string} imageSrc - Image source URL
 * @param {boolean} show - True to show, false to hide
 */
export function toggleLightbox(imageSrc, show = true) {
  let lightbox = document.getElementById('lightbox');

  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.8);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 300;
      padding: 16px;
    `;

    const img = document.createElement('img');
    img.id = 'lightboxImage';
    img.style.cssText = `
      max-width: 90%;
      max-height: 90%;
      border-radius: 8px;
    `;

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      background: var(--surface);
      border: none;
      color: var(--text);
      font-size: 24px;
      cursor: pointer;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    closeBtn.onclick = () => toggleLightbox('', false);

    lightbox.appendChild(img);
    lightbox.appendChild(closeBtn);
    document.body.appendChild(lightbox);
  }

  const img = document.getElementById('lightboxImage');
  if (show && imageSrc) {
    img.src = imageSrc;
    lightbox.style.display = 'flex';
  } else {
    lightbox.style.display = 'none';
  }
}

/**
 * Switch between sidebar tabs
 * @param {string} tabName - Tab name ('incidents' or 'stats')
 */
export function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab').forEach(tab => {
    if (tab.dataset.tab === tabName) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // Update tab content
  document.querySelectorAll('.tab-pane').forEach(pane => {
    if (pane.dataset.pane === tabName) {
      pane.classList.add('active');
    } else {
      pane.classList.remove('active');
    }
  });
}

/**
 * Close all open overlays/modals
 * Called when pressing ESC key
 */
export function closeAllOverlays() {
  // Close report modal
  const reportOverlay = getCachedElement('reportOverlay');
  if (reportOverlay) {
    reportOverlay.classList.remove('open');
  }

  // Close detail view
  const detailOverlay = getCachedElement('detailOverlay');
  if (detailOverlay) {
    detailOverlay.classList.remove('open');
  }

  // Close lightbox
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    lightbox.style.display = 'none';
  }

  // Close search dropdown
  const searchDrop = getCachedElement('searchDrop');
  if (searchDrop) {
    searchDrop.classList.remove('open');
  }
}

/**
 * Show validation error message
 * @param {string} message - Error message to display
 */
export function showValidationError(message) {
  const valMsg = getCachedElement('valMsg');
  if (valMsg) {
    valMsg.textContent = message;
    valMsg.style.display = 'block';
  }
}

/**
 * Hide validation error message
 */
export function hideValidationError() {
  const valMsg = getCachedElement('valMsg');
  if (valMsg) {
    valMsg.style.display = 'none';
  }
}
