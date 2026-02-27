/**
 * Test Utilities
 * Common testing helpers and mocks
 */

import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AppProvider } from '@/context/AppContext'

/**
 * Custom render function that includes providers
 */
function AllTheProviders({ children }: { children: React.ReactNode }) {
  return <AppProvider>{children}</AppProvider>
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllTheProviders, ...options })
}

export * from '@testing-library/react'
export { customRender as render }

/**
 * Mock incident data
 */
export const mockIncident = {
  id: 'incident-1',
  address: '123 Test Street, London',
  area: 'Southwark',
  lat: 51.5,
  lng: -0.1,
  datetime: '2024-02-27T10:00:00Z',
  status: 'confirmed' as const,
  animalType: 'Domestic Cat',
  age: 'Unknown',
  sex: 'Unknown',
  method: 'Blunt Trauma',
  severity: 'Critical',
  notes: 'Test incident notes',
  witnessName: 'John Doe',
  witnessContact: '07700 123456',
  witnessStatement: 'I saw the incident',
  sightedDesc: 'Sighted near the park',
  photos: [],
  caseNotes: [
    {
      id: 'cn-1',
      timestamp: '2024-02-27T10:05:00Z',
      text: 'Initial report',
      author: 'Test User',
    },
  ],
  createdAt: '2024-02-27T10:00:00Z',
  updatedAt: '2024-02-27T10:05:00Z',
}

export const mockIncidents = [
  mockIncident,
  {
    ...mockIncident,
    id: 'incident-2',
    address: '456 Another Street, London',
    area: 'Croydon',
    status: 'suspected' as const,
    lat: 51.4,
    lng: -0.15,
  },
  {
    ...mockIncident,
    id: 'incident-3',
    address: '789 Third Street, London',
    area: 'Lewisham',
    status: 'unconfirmed' as const,
    lat: 51.45,
    lng: -0.05,
  },
]

/**
 * Mock validation data
 */
export const validFormData = {
  address: '123 Test Street',
  lat: 51.5,
  lng: -0.1,
  datetime: '2024-02-27T10:00',
  status: 'confirmed',
  method: 'Blunt Trauma',
  severity: 'Critical',
  animalType: 'Domestic Cat',
  age: 'Unknown',
  sex: 'Unknown',
  notes: 'Test notes',
  witnessName: '',
  witnessContact: '',
  witnessStatement: '',
  sightedDesc: '',
}

export const invalidFormData = {
  address: '', // Required
  lat: 100, // Out of bounds
  lng: 10, // Out of bounds
  datetime: '', // Required
  status: '', // Required
  method: '', // Required
  severity: '', // Required
  animalType: '', // Required
  age: 'Unknown',
  sex: 'Unknown',
  notes: 'x'.repeat(5001), // Too long
  witnessName: '',
  witnessContact: '',
  witnessStatement: '',
  sightedDesc: '',
}

/**
 * Wait utilities for async testing
 */
export const waitFor = async (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Mock geolocation
 */
export const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
}

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
})

/**
 * Mock fetch
 */
export const mockFetch = (response: any, ok = true) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    })
  ) as jest.Mock
}

/**
 * Reset all mocks
 */
export const resetAllMocks = () => {
  jest.clearAllMocks()
  localStorage.getItem.mockClear()
  localStorage.setItem.mockClear()
  localStorage.removeItem.mockClear()
}
