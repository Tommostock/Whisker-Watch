/**
 * Demo Incidents
 * Sample data for testing and demonstration
 * In production, all incidents are created through the incident form and stored in localStorage
 */

// Empty demo incidents array (can be populated for testing)
export const DEMO_INCIDENTS = [];

/**
 * Create sample incident data (for testing/demo purposes)
 * Structure matches the actual incident object schema
 * @param {Object} overrides - Override default values
 * @returns {Object} Incident object
 */
export function createDemoIncident(overrides = {}) {
  const now = new Date().toISOString();
  const id = `INC-${Date.now().toString(36).toUpperCase().slice(-6)}`;

  return {
    id,
    address: 'London, UK',
    area: 'Unknown',
    lat: 51.505,
    lng: -0.09,
    datetime: now,
    status: 'open',
    animalType: 'Domestic Cat',
    catName: '',
    animalDesc: '',
    age: '',
    sex: '',
    method: 'Blunt Trauma',
    severity: 'Fatal',
    notes: '',
    witnessName: '',
    witnessContact: '',
    witnessStatement: '',
    photos: [],
    createdAt: now,
    ...overrides
  };
}

/**
 * Load sample incidents for testing
 * Optionally populates localStorage with demo data
 * @param {Array} incidents - Existing incidents array
 * @param {boolean} overwrite - Whether to clear existing data first
 * @returns {Array} Merged incidents array
 */
export function loadDemoData(incidents = [], overwrite = false) {
  const demoIncidents = [
    createDemoIncident({
      catName: 'Fluffy',
      address: 'Croydon, London',
      area: 'Croydon',
      lat: 51.361,
      lng: -0.106,
      severity: 'Fatal',
      status: 'closed'
    }),
    createDemoIncident({
      catName: 'Whiskers',
      address: 'Bromley, London',
      area: 'Bromley',
      lat: 51.406,
      lng: 0.019,
      severity: 'Critical',
      status: 'open'
    })
  ];

  return overwrite ? demoIncidents : [...incidents, ...demoIncidents];
}
