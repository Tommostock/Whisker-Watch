# Phase 2.3 Summary: Utility Hooks & Context

**Status**: ✅ COMPLETE
**Commit**: `c67c97e` (Hooks: Core state management)
**Date**: 2025-02-27
**Lines of Code**: 1,104 total
- `useLocalStorage.ts`: 143 lines
- `useIncidents.ts`: 380 lines
- `useTheme.ts`: 91 lines
- `useGeocoding.ts`: 260 lines
- `AppContext.tsx`: 180 lines
- `hooks/index.ts`: 10 lines

---

## What Was Done

### 1. `hooks/useLocalStorage.ts` (143 lines)

**Purpose**: Wrapper around localStorage with comprehensive error handling

**Main Hook**: `useLocalStorage<T>(key, initialValue)`
- Returns `[value, setValue, error]` (like useState)
- Auto-loads from localStorage on mount
- Auto-saves to localStorage on change
- Handles quota exceeded errors gracefully
- Still updates state even if storage fails (can use app, just won't persist)
- Catches JSON parse errors on load
- Catches JSON stringify errors on save

**Helper Functions**:
- `getStorageValue<T>(key, default)` - Synchronous read for initialization
- `setStorageValue<T>(key, value)` - Synchronous write for non-React code
- `clearStorage()` - Clear all localStorage
- `removeStorageKey(key)` - Remove specific key
- `getStorageKeys()` - List all keys (debugging)
- `getStorageSize()` - Calculate total size in bytes (debugging)

**Key Features**:
- ✅ Prevents quota exceeded from crashing app
- ✅ Supports function-based updates (setValue(prev => ...))
- ✅ Non-blocking - state updates even if storage fails
- ✅ Useful for testing and non-React code
- ✅ Comprehensive error reporting to console

**Used By**:
- `useIncidents()` for incidents data
- `useTheme()` for theme preference
- Potentially: map bookmarks, user preferences

---

### 2. `hooks/useIncidents.ts` (380 lines)

**Purpose**: Complete CRUD and data management for incidents

**Core Data**:
- `incidents: Incident[]` - All incidents from localStorage
- `filters: FilterState` - Active filters (status, method, area)
- `sortField: 'date' | 'area' | 'status'` - Sort column
- `sortDir: 1 | -1` - Sort direction (1 = ascending, -1 = descending)
- `filteredIncidents: Incident[]` - Memoized filtered/sorted results

**CRUD Operations**:
```typescript
createIncident(data) → Incident
  - Generates ID: 'INC-' + timestamp
  - Sets createdAt automatically
  - Extracts area from address
  - Returns created incident

updateIncident(id, updates)
  - Partial updates allowed
  - Sets updatedAt automatically
  - Prevents ID/createdAt changes

deleteIncident(id)
  - Removes from incidents array

getIncident(id) → Incident | undefined
  - Single incident lookup
```

**Filtering & Sorting**:
```typescript
applyFilters(filters) - Set all filters
clearFilters() - Reset to empty
setSort(field, direction?) - Change sort
  - Same field click = toggle direction
  - Different field = reset direction

Status priority: sighted(0) → confirmed(1) → suspected(2) → unconfirmed(3)
```

**Search**:
```typescript
searchIncidents(query) → Incident[]
  - Searches across fields:
    - id, address, area
    - catName, animalType, animalDesc
    - notes, witnessName, witnessStatement
    - sightedDesc, method, severity
  - Case-insensitive
  - Returns from filteredIncidents only
```

**Case Notes (Intel)**:
```typescript
addCaseNote(incidentId, text)
  - Generates ID: 'cn-' + timestamp
  - Auto-sets timestamp and author
  - Max 500 chars enforced by form, not here
  - Appends to incident.caseNotes

deleteCaseNote(incidentId, noteId)
  - Removes specific note
  - Updates incident updatedAt
```

**Statistics**:
```typescript
getStats() → { total, unconfirmed, suspected, confirmed, sighted }

getAreasList() → string[]
  - Unique areas (excluding 'Unknown')
  - Sorted alphabetically
  - Used for area filter dropdown
```

**Optimization**:
- `filteredIncidents` uses useMemo (recalculates only when dependencies change)
- All methods use useCallback for stable references
- Prevents unnecessary re-renders in child components

**Helper Functions**:
- `extractArea(addr)` - Extract borough from full address
- `generateIncidentId()` - 'INC-' + timestamp
- `generateNoteId()` - 'cn-' + timestamp

---

### 3. `hooks/useTheme.ts` (91 lines)

**Purpose**: Dark/light mode toggle with DOM and localStorage sync

**Main Hook**: `useTheme()`
- Returns `{ theme, isDark, toggleTheme, setTheme }`
- Automatically syncs with `document.body.classList`
- Theme='dark' → removes 'light-mode' class
- Theme='light' → adds 'light-mode' class
- CSS variables automatically switch based on class

**useTheme Return**:
```typescript
theme: 'light' | 'dark'
isDark: boolean
toggleTheme() - Switch to opposite theme
setTheme(theme) - Set specific theme
```

**Side Effect**:
- Updates `document.body.classList` when theme changes
- Original app sets/toggles 'light-mode' class
- CSS variables respond to class (CSS rule: `body.light-mode { --bg: var(--bg-light); ... }`)

**Helper Functions**:
- `getSystemTheme()` - Detect system dark mode preference
- `useSystemThemeListener(callback)` - Listen for system theme changes

**Used By**:
- Header (theme toggle button)
- Entire app (CSS variables)

---

### 4. `hooks/useGeocoding.ts` (260 lines)

**Purpose**: Nominatim API integration for address search and reverse geocoding

**Main Hook**: `useGeocoding()`
- Returns state and methods for address search and reverse geocoding

**Methods**:

```typescript
// Address search
search(query) → Promise<SearchResult[]>
  - Nominatim search API
  - Appends ' UK' to query
  - Returns up to 5 results
  - Auto-converts lat/lon strings to numbers
  - Request timeout: 5 seconds

// Reverse geocoding
reverseGeocode(lat, lon) → Promise<string>
  - Nominatim reverse API
  - Returns address string
  - Fallback: returns coordinates if fails
```

**State**:
```typescript
searchLoading: boolean
searchError: Error | null
reverseLoading: boolean
reverseError: Error | null

clearErrors() - Reset error states
```

**Features**:
- ✅ Race condition prevention (tracks request IDs)
- ✅ Fetch timeout (5 seconds default)
- ✅ User-Agent header for API
- ✅ Request cancellation on supersession
- ✅ Graceful error handling

**Standalone Functions** (for non-React code):
```typescript
geocodeAddress(address) → Promise<SearchResult | null>
  - One-off address search
  - Returns first result or null

reverseGeocodeCoordinates(lat, lon) → Promise<string | null>
  - One-off reverse geocoding
  - Returns address or null
```

**Used By**:
- ReportPanel (address autocomplete)
- Map click handler (reverse geocoding)
- Modal form (address search)

---

### 5. `context/AppContext.tsx` (180 lines)

**Purpose**: Central state management, wires all hooks together

**Components**:
1. `AppContextType` - TypeScript interface of all state
2. `AppContext` - React Context object
3. `AppProvider` - Provider component (wrap app with this)
4. `useApp()` - Hook to access all state
5. `useAppIncidents()` - Typed hook for just incidents
6. `useAppTheme()` - Typed hook for just theme
7. `useAppGeocoding()` - Typed hook for just geocoding

**AppContextType includes**:
- All incident state and methods (from useIncidents)
- All theme state and methods (from useTheme)
- All geocoding state and methods (from useGeocoding)
- Total: ~40 properties and methods

**Usage Pattern**:

```typescript
// In app/layout.tsx or app/page.tsx:
import { AppProvider } from '@/context/AppContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}

// In any component:
import { useApp, useAppIncidents, useAppTheme } from '@/context/AppContext';

export function MyComponent() {
  const app = useApp(); // Full state
  const incidents = useAppIncidents(); // Just incidents
  const theme = useAppTheme(); // Just theme
}
```

**Error Handling**:
- Throws error if `useApp()` used outside `<AppProvider>`
- Forces correct provider setup

---

## Data Flow

```
Component
  ↓
useAppIncidents() / useAppTheme() / useAppGeocoding()
  ↓
useApp() [accesses AppContext]
  ↓
AppContext.Provider
  ↓
Hooks:
  ├─ useIncidents() [uses useLocalStorage]
  ├─ useTheme() [uses useLocalStorage]
  └─ useGeocoding() [standalone, no storage]
  ↓
localStorage
```

---

## Integration with Phase 2.2

**Types Used**:
- `Incident` - Main data type
- `FilterState` - For filters
- `CaseNote` - For intel notes
- `Photo` - For images
- `GeocodeResult` - From Nominatim API

**Constants Used**:
- `STORAGE_KEYS` - localStorage keys
- `BOROUGHS` - For area extraction
- `STATUS_PRIORITY` - For sorting
- `NOMINATIM_*` - API config
- `API_TIMEOUT` - 5 seconds

---

## Safety Features

✅ **Race condition prevention** in geocoding (request IDs)
✅ **Quota exceeded handling** in localStorage
✅ **Fetch timeout** for API calls
✅ **Error states** for user feedback
✅ **Graceful degradation** (state updates even if storage fails)
✅ **SSR safe** (checks for `typeof window`)
✅ **No external dependencies** (uses React only)

---

## Testing Checklist

- [ ] `useLocalStorage` saves and loads correctly
- [ ] localStorage quota error handled gracefully
- [ ] `useIncidents` CRUD operations work
- [ ] Filters and sorting apply correctly
- [ ] Search works across all fields
- [ ] Case notes add/delete correctly
- [ ] `useTheme` toggle updates DOM class
- [ ] Theme persists after page reload
- [ ] Nominatim address search returns results
- [ ] Reverse geocoding works
- [ ] Request timeout cancels slow requests
- [ ] `AppContext` provides all state
- [ ] Error if useApp outside provider
- [ ] Typed sub-hooks return correct properties

---

## Next Phase (2.4)

**Simple UI Components** (~2 hours):
1. `components/Toast.tsx` - Auto-dismissing notifications
2. `components/ConfirmDialog.tsx` - Delete confirmation
3. `components/Lightbox.tsx` - Full-screen image viewer

These don't need hooks, just props and basic state.

Then Phase 2.5: `Header.tsx` component

---

## Files Created

```
hooks/
├── useLocalStorage.ts (143 lines)
├── useIncidents.ts (380 lines)
├── useTheme.ts (91 lines)
├── useGeocoding.ts (260 lines)
└── index.ts (10 lines)

context/
└── AppContext.tsx (180 lines)

Total: 1,104 lines
```

## Commit

```
c67c97e Hooks: Core state management (Phase 2.3)
```

---

**Status: Ready for Phase 2.4 ✅**
