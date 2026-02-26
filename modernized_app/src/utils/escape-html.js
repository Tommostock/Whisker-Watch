/**
 * HTML Escaping Utility
 * Prevents XSS attacks by escaping HTML special characters
 * Used when displaying user-generated content
 */

/**
 * Escape HTML special characters
 * Converts dangerous characters to HTML entities
 * @param {string|*} str - String to escape (coerced to string)
 * @returns {string} Escaped HTML-safe string
 */
export function escapeHtml(str) {
  const s = String(str || '');
  return s
    .replace(/&/g, '&amp;')   // & -> &amp;
    .replace(/</g, '&lt;')    // < -> &lt;
    .replace(/>/g, '&gt;')    // > -> &gt;
    .replace(/"/g, '&quot;')  // " -> &quot;
    .replace(/'/g, '&#39;');  // ' -> &#39;
}

/**
 * Safely set element text content (prevents injection)
 * Always use this instead of innerHTML for user content
 * @param {HTMLElement} element - Target element
 * @param {string} text - Text content to set
 */
export function setTextSafely(element, text) {
  if (!element) return;
  element.textContent = text;
}

/**
 * Create a safe HTML element with sanitized text
 * @param {string} tag - HTML tag name
 * @param {string} text - Text content (will be escaped)
 * @param {string} className - Optional CSS class
 * @returns {HTMLElement} Created element
 */
export function createElementSafe(tag, text, className = '') {
  const el = document.createElement(tag);
  el.textContent = text;
  if (className) el.className = className;
  return el;
}

/**
 * Check if string contains potentially dangerous HTML
 * @param {string} str - String to check
 * @returns {boolean} True if string contains HTML/script tags
 */
export function containsHtml(str) {
  const s = String(str || '');
  return /<[^>]*>|<script|javascript:/i.test(s);
}

/**
 * Sanitize URL for use in href attribute
 * Prevents javascript: and data: protocol attacks
 * @param {string} url - URL to sanitize
 * @returns {string} Safe URL or empty string
 */
export function sanitizeUrl(url) {
  const trimmed = String(url || '').trim();

  // Allow only http, https, and relative URLs
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
    return trimmed;
  }

  // Disallow javascript:, data:, and other dangerous protocols
  if (/^(javascript|data|vbscript|file|about):/i.test(trimmed)) {
    return '';
  }

  // Allow relative URLs
  if (!trimmed.includes('://')) {
    return trimmed;
  }

  return '';
}
