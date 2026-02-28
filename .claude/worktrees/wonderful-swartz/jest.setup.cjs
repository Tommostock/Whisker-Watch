require('@testing-library/jest-dom')

// Mock localStorage with real implementation
const localStorageMock = (() => {
  let store = {}

  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString()
    }),
    removeItem: jest.fn((key) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: jest.fn((index) => {
      const keys = Object.keys(store)
      return keys[index] || null
    }),
    // For compatibility with for...in loops
    [Symbol.iterator]: function* () {
      yield* Object.keys(store)
    },
  }
})()

// Support hasOwnProperty and enumeration
localStorageMock[Symbol.hasOwnProperty] = jest.fn((key) => key in localStorageMock)

// Intercept property access for for...in compatibility
Object.defineProperty(localStorageMock, '__getKeys__', {
  value: jest.fn(() => {
    // Build store dynamically from localStorage state
    const keys = []
    for (let i = 0; i < localStorageMock.length; i++) {
      const key = localStorageMock.key(i)
      if (key) keys.push(key)
    }
    return keys
  }),
})

global.localStorage = localStorageMock

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Suppress console errors in tests (optional)
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
