/**
 * Date Formatting Utilities
 * Consistent date/time formatting across the application
 * Handles timezone-aware formatting for incident timestamps
 */

/**
 * Format ISO datetime string for display
 * Shows date and time in readable format with timezone
 * @param {string} isoString - ISO 8601 datetime string
 * @returns {string} Formatted datetime (e.g., "Jan 15, 2025 14:30 UTC")
 */
export function formatDateTime(isoString) {
  if (!isoString) return 'Unknown';

  try {
    const date = new Date(isoString);
    if (isNaN(date)) return 'Invalid';

    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    };

    return date.toLocaleString('en-GB', options) + ' UTC';
  } catch {
    return 'Invalid';
  }
}

/**
 * Format ISO datetime for date input (datetime-local)
 * Converts UTC ISO string to local datetime-local format
 * @param {string} isoString - ISO 8601 datetime string
 * @returns {string} Format: "2025-01-15T14:30"
 */
export function formatDateTimeLocal(isoString) {
  if (!isoString) return '';

  try {
    const date = new Date(isoString);
    if (isNaN(date)) return '';

    // Adjust for timezone offset to get local time
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 16);
  } catch {
    return '';
  }
}

/**
 * Format date only (no time)
 * @param {string} isoString - ISO 8601 datetime string
 * @returns {string} Formatted date (e.g., "Jan 15, 2025")
 */
export function formatDate(isoString) {
  if (!isoString) return 'Unknown';

  try {
    const date = new Date(isoString);
    if (isNaN(date)) return 'Invalid';

    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    };

    return date.toLocaleString('en-GB', options);
  } catch {
    return 'Invalid';
  }
}

/**
 * Format time only
 * @param {string} isoString - ISO 8601 datetime string
 * @returns {string} Formatted time (e.g., "14:30")
 */
export function formatTime(isoString) {
  if (!isoString) return 'Unknown';

  try {
    const date = new Date(isoString);
    if (isNaN(date)) return 'Invalid';

    const options = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    };

    return date.toLocaleString('en-GB', options);
  } catch {
    return 'Invalid';
  }
}

/**
 * Get timezone offset string
 * @returns {string} Timezone offset (e.g., "+00:00" or "-05:00")
 */
export function getTimezoneOffset() {
  const now = new Date();
  const offsetMs = -now.getTimezoneOffset();
  const sign = offsetMs >= 0 ? '+' : '-';
  const hours = String(Math.floor(Math.abs(offsetMs) / 60)).padStart(2, '0');
  const minutes = String(Math.abs(offsetMs) % 60).padStart(2, '0');
  return `${sign}${hours}:${minutes}`;
}

/**
 * Create ISO datetime string with timezone
 * Takes a datetime-local input and adds timezone offset
 * @param {string} datetimeLocal - Format: "2025-01-15T14:30"
 * @returns {string} ISO datetime with timezone (e.g., "2025-01-15T14:30:00+00:00")
 */
export function createISOWithTimezone(datetimeLocal) {
  if (!datetimeLocal) return '';

  try {
    // Parse the datetime-local input
    const date = new Date(datetimeLocal + ':00'); // Add seconds
    if (isNaN(date)) return '';

    // Get timezone offset
    const offset = -date.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const hours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
    const minutes = String(Math.abs(offset) % 60).padStart(2, '0');
    const tzStr = `${sign}${hours}:${minutes}`;

    // Return ISO string with timezone
    return `${datetimeLocal}:00${tzStr}`;
  } catch {
    return '';
  }
}

/**
 * Check if a date is recent (within last N hours)
 * @param {string} isoString - ISO 8601 datetime string
 * @param {number} hours - Number of hours to check
 * @returns {boolean} True if date is within the last N hours
 */
export function isRecent(isoString, hours = 24) {
  if (!isoString) return false;

  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours >= 0 && diffHours <= hours;
  } catch {
    return false;
  }
}
