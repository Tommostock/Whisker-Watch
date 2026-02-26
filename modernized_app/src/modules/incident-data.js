/**
 * Incident Data Management
 * localStorage persistence and data CRUD operations
 */

const STORAGE_KEY = 'lckData';

/**
 * Save incidents to localStorage
 * @param {Array<Object>} incidents - Array of incident objects
 */
export function saveData(incidents) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(incidents));
  } catch (error) {
    console.error('Failed to save data:', error);
    // Handle quota exceeded error
    if (error.name === 'QuotaExceededError') {
      alert('Storage limit exceeded. Cannot save more incidents.');
    }
  }
}

/**
 * Load incidents from localStorage
 * @returns {Array<Object>} Array of incidents or empty array if none exist
 */
export function loadData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load data:', error);
    return [];
  }
}

/**
 * Clear all incident data from localStorage
 * WARNING: This deletes all stored incidents permanently
 */
export function clearAllData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear data:', error);
  }
}

/**
 * Export incidents as JSON file
 * @param {Array<Object>} incidents - Incidents to export
 * @param {string} filename - Output filename (default: whisker-watch-backup.json)
 */
export function exportData(incidents, filename = 'whisker-watch-backup.json') {
  try {
    const json = JSON.stringify(incidents, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export failed:', error);
  }
}

/**
 * Import incidents from JSON file
 * @param {File} file - JSON file to import
 * @returns {Promise<Array<Object>>} Imported incidents array
 */
export function importData(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!Array.isArray(data)) {
          throw new Error('Invalid format: expected array of incidents');
        }
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON format'));
      }
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsText(file);
  });
}

/**
 * Get incident by ID
 * @param {Array<Object>} incidents - Incidents array
 * @param {string} id - Incident ID
 * @returns {Object|null} Incident object or null
 */
export function getIncidentById(incidents, id) {
  return incidents.find(i => i.id === id) || null;
}

/**
 * Delete incident by ID
 * @param {Array<Object>} incidents - Incidents array
 * @param {string} id - Incident ID to delete
 * @returns {Array<Object>} Updated incidents array
 */
export function deleteIncident(incidents, id) {
  return incidents.filter(i => i.id !== id);
}

/**
 * Get incident statistics
 * @param {Array<Object>} incidents - Incidents array
 * @returns {Object} Statistics object {total, open, suspect, closed}
 */
export function getIncidentStats(incidents) {
  return {
    total: incidents.length,
    open: incidents.filter(i => i.status === 'open').length,
    suspect: incidents.filter(i => i.status === 'suspect').length,
    closed: incidents.filter(i => i.status === 'closed').length
  };
}
