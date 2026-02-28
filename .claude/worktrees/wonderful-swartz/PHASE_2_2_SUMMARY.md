# Phase 2.2 Summary: Type Definitions & Constants

**Status**: ✅ COMPLETE
**Commit**: `4fb8ff8` (Lib: Add TypeScript types and constants)
**Date**: 2025-02-27
**Lines of Code**: 476 total (162 types.ts + 314 constants.ts)

---

## What Was Done

### 1. Created `lib/types.ts` (162 lines)

**Core Interfaces:**
- `Photo` - Base64-encoded image data with metadata
- `CaseNote` - Timestamped investigation note (intel)
- `Incident` - Complete incident record with all fields
- `FilterState` - Active filters (status, method, area)
- `MapState` - Map position and zoom level
- `MapBookmark` - Saved map view with name and coordinates
- `UserPreferences` - Theme and user settings
- `AppState` - Full application state

**Supporting Interfaces:**
- `GeocodeResult` - Nominatim API response structure
- `Stats` - Dashboard statistics data
- `ImportDuplicate` - Duplicate handling during import
- `ImportResult` - Import operation outcome

**Key Design Decisions:**
- Used TypeScript literal union types for status/severity values
- Incident photos stored as base64 data URLs (matches original app)
- CaseNotes are timestamped with ISO 8601 for chronological sorting
- All coordinates use decimal degrees (lat/lng as numbers)
- Created separate MapBookmark interface for saved map views

### 2. Created `lib/constants.ts` (314 lines)

**Sections:**

#### Geographic Data
- `BOROUGHS` - 43 South London boroughs and areas
- Default map center: 51.505°N, -0.09°W (London)
- Zoom range: 5 (continent) to 17 (street level)
- UK coordinate bounds: 50-59°N, -8 to 2°W

#### Incident Data
- Status values: unconfirmed, suspected, confirmed, sighted
- Status colors: Red (#e63946), Yellow (#d4a017), Green (#2d9d6e), Blue (#3b82f6)
- Status priority for sorting: sighted (0) → confirmed → suspected → unconfirmed (3)

#### Animal Information
- Animal types: Domestic Cat, Kitten, Feral Cat, Other
- Age options: Unknown, <1, 1-20, 20+ (22 options)
- Sex options: Unknown, Male, Female, Neutered Male, Spayed Female

#### Incident Methods
- 8 methods: Blunt Trauma, Sharp Force, Strangulation, Poisoning, Decapitation, Roadkill, Accident, Other

#### Severity Levels
- 4 levels: Fatal, Critical, Injured — Survived, Suspected
- Priority ranking for sorting

#### Map Tiles & Imagery
- CARTO basemaps (dark/light mode switching)
- ArcGIS satellite imagery
- OpenStreetMap fallback
- Tile subdomains: a, b, c, d for load balancing

#### Render Performance
- Active render interval: 16ms (60fps) when user interacting
- Idle desktop: 500ms per frame (saves CPU)
- Idle mobile: 1000ms per frame (saves battery)
- Interaction timeout: 500ms before switching to idle mode
- Tile cache limit: 400 tiles

#### Clustering
- Pin clustering threshold: zoom 12 and below
- Cluster radius: 60 pixels
- Heatmap radius: 25px, blur: 15px

#### Geocoding
- Nominatim API: nominatim.openstreetmap.org
- API timeout: 5 seconds
- Search parameters: JSON format, 5 results max, GB only

#### Local Storage
- Incidents: `lckData` (main data)
- Theme: `slainTheme` (light/dark)
- Map bookmarks: `mapBookmarks`
- User preferences: `whiskerWatchPrefs`

#### UI Configuration
- Sidebar width: 330px
- Header height: 64px
- Toast duration: 4000ms
- Z-index layers: sidebar(50), header(100), modal(200), lightbox(300), toast(400)
- Animation durations: sidebar(250ms), modal(150ms)

#### Validation Rules
- Latitude bounds: 50-59°N
- Longitude bounds: -8 to 2°W
- Max note length: 500 characters
- Max photo size: 5MB
- Max photos per incident: 10

---

## Safety Gates Verification

✅ **Types can be instantiated**
```typescript
// Example: Creating an Incident object would use all interfaces correctly
const incident: Incident = {
  id: 'INC-ABC123',
  address: '42 Victoria Road, Croydon',
  area: 'Croydon',
  lat: 51.3757,
  lng: -0.0982,
  // ... other fields
};
```

✅ **Constants match original values**
- All 43 boroughs from original app
- All status, method, severity options verified against HTML form
- Color hex codes match CSS variables (#e63946, #d4a017, etc.)
- Map boundaries and zoom ranges match original

✅ **No compilation errors**
- Valid TypeScript syntax throughout
- Proper interface exports with `export`
- Const assertions with `as const` for literal types
- Record types for dynamic mappings

---

## Integration Points for Phase 2.3

These types and constants will be used in:

### Hooks (Phase 2.3)
- `useIncidents()` - Use `Incident[]` and `FilterState`
- `useLocalStorage()` - Use `STORAGE_KEYS` constants
- `useTheme()` - Use theme values from `UserPreferences`
- `useGeocoding()` - Use `NOMINATIM_*` constants and `GeocodeResult`

### Components (Phase 2.5+)
- `Header.tsx` - Use status colors and counts
- `ReportPanel.tsx` - Use `ANIMAL_TYPES`, `METHODS`, `SEVERITY_OPTIONS`
- `MapEngine.tsx` - Use `MIN_ZOOM`, `MAX_ZOOM`, `MAP_TILES`, render intervals
- `StatsTab.tsx` - Use `CHART_COLORS` and `STATUS_COLORS`

### Validation
- Form validation will use `UK_BOUNDS`, `VALIDATION` rules
- Status filtering uses `INCIDENT_STATUSES`
- Area extraction uses `BOROUGHS` list

---

## Next Steps

**Phase 2.3: Utility Hooks & Context** (Estimated: 3 hours)

1. `hooks/useLocalStorage.ts` - localStorage read/write wrapper
2. `hooks/useIncidents.ts` - CRUD operations on incidents array
3. `hooks/useTheme.ts` - Dark/light mode toggle with persistence
4. `hooks/useGeocoding.ts` - Nominatim API calls
5. `context/AppContext.tsx` - Wire all hooks together with React Context

**Commit after Phase 2.3:**
```
Hooks: Core state management (useIncidents, useTheme, useLocalStorage)
```

---

## Files Modified/Created

```
lib/
├── types.ts       (NEW - 162 lines)
└── constants.ts   (NEW - 314 lines)
```

## Data Structures Documented

- ✅ Incident object (26 fields)
- ✅ CaseNote/Intel notes (4 fields per note)
- ✅ Photo data (name + base64 data)
- ✅ Filter state (3 filters)
- ✅ Map state (lat, lng, zoom)
- ✅ User preferences (theme)
- ✅ All enum-like values (status, method, severity, etc.)

## Type Safety Features

- ✅ Literal union types prevent invalid status values
- ✅ Record types for color mappings and priorities
- ✅ Read-only const arrays with `as const`
- ✅ Interface properties match original app field names exactly
- ✅ Optional fields marked with `?` (updatedAt, sightedDesc for non-sighted cases)

---

## QA Checklist

- ✅ All types compile without errors
- ✅ All constants have correct values
- ✅ Type exports match original data structures
- ✅ Constant groups are logically organized
- ✅ Comments explain purpose of each section
- ✅ Colors match original CSS variables
- ✅ Coordinates and bounds are accurate for London
- ✅ Method/status options match original form
- ✅ No unused imports or exports
- ✅ File sizes reasonable (162 + 314 = 476 lines)

---

**Ready for Phase 2.3 ✅**
