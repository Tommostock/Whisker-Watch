# Whisker Watch Next.js Architecture

## Application Layers

```
┌─────────────────────────────────────────────────────────┐
│                    COMPONENTS                           │
│  Header, Sidebar, Map, ReportPanel, DetailModal, etc.  │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│            CONTEXT & TYPED HOOKS                        │
│  useApp() / useAppIncidents() / useAppTheme() /         │
│  useAppGeocoding()                                      │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│         CORE HOOKS (BUSINESS LOGIC)                     │
├─────────────────────────────────────────────────────────┤
│  useIncidents    │  useTheme    │  useGeocoding        │
│  - CRUD          │  - Toggle    │  - Search addresses │
│  - Filter        │  - Persist   │  - Reverse geocode  │
│  - Sort          │  - DOM sync  │  - Timeout handling │
│  - Search        │              │                     │
│  - Case notes    │              │                     │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│        SUPPORT HOOKS & UTILITIES                        │
├─────────────────────────────────────────────────────────┤
│  useLocalStorage                                        │
│  - Read/write with error handling                       │
│  - Quota exceeded handling                              │
│  - Helpers for non-React code                           │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│         EXTERNAL SERVICES                               │
├─────────────────────────────────────────────────────────┤
│  localStorage    │  Nominatim API  │  Browser APIs     │
│  - Persistence   │  - Geocoding    │  - DOM classList  │
│                  │  - Addresses    │  - Fetch API      │
└─────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Creating an Incident

```
User fills form in ReportPanel
            ↓
Component calls app.createIncident(data)
            ↓
useIncidents.createIncident()
            ↓
Generate ID, set createdAt, extract area
            ↓
Call setIncidents([...incidents, newIncident])
            ↓
useLocalStorage saves to localStorage
            ↓
localStorage.setItem('lckData', JSON.stringify(...))
            ↓
Component re-renders with new incident
```

### Filtering Incidents

```
User selects status filter
            ↓
Component calls app.applyFilters({ status: 'confirmed' })
            ↓
setFiltersState(newFilters)
            ↓
React dependency change detected
            ↓
filteredIncidents useMemo recalculates
            ↓
Filter: keep only confirmed incidents
            ↓
Sort: by date descending
            ↓
Return filtered array
            ↓
Component re-renders with filtered list
```

### Toggling Theme

```
User clicks theme toggle button
            ↓
Component calls app.toggleTheme()
            ↓
useTheme.toggleTheme()
            ↓
Call setThemeState('light' or 'dark')
            ↓
useLocalStorage saves to localStorage
            ↓
useEffect detects theme change
            ↓
Update document.body.classList
            ↓
CSS rules apply: body.light-mode { --bg: var(--bg-light); ... }
            ↓
All CSS variables change automatically
            ↓
Component re-renders (minor)
```

### Searching an Address

```
User types in address search box
            ↓
Component calls app.searchAddress(query)
            ↓
useGeocoding.search(query)
            ↓
Build URL: nominatim.openstreetmap.org/search?q=...&uk
            ↓
Fetch with 5s timeout
            ↓
Parse JSON response
            ↓
Auto-convert lat/lon strings to numbers
            ↓
Return SearchResult[]
            ↓
Component displays results in dropdown
            ↓
User clicks result
            ↓
Component sets form fields: lat, lng, address
```

---

## State Management

### Incidents Data

**Store**: localStorage key `'lckData'`

**Structure**:
```typescript
[
  {
    id: 'INC-ABC123',
    address: '42 Victoria Road, Croydon',
    area: 'Croydon',
    lat: 51.3757,
    lng: -0.0982,
    datetime: '2025-02-27T10:30:00+00:00',
    status: 'confirmed',
    animalType: 'Domestic Cat',
    catName: 'Whiskers',
    animalDesc: 'Black & white tabby',
    age: '5',
    sex: 'Male',
    method: 'Sharp Force',
    severity: 'Critical',
    notes: 'Found near community center...',
    witnessName: 'John Smith',
    witnessContact: 'john@example.com',
    witnessStatement: 'Saw the incident at 10:15...',
    sightedDesc: '',
    photos: [{ name: 'photo1.jpg', data: 'data:image/jpeg;base64,...' }],
    caseNotes: [
      { id: 'cn-ABC', timestamp: '2025-02-27T11:00:00Z', text: '...', author: 'System' }
    ],
    createdAt: '2025-02-27T10:30:00Z',
    updatedAt: '2025-02-27T11:00:00Z'
  }
]
```

### Theme State

**Store**: localStorage key `'slainTheme'`

**Values**:
- `'dark'` - Dark mode (default)
- `'light'` - Light mode

**Synced to**: `document.body.classList`
- Dark mode: class removed
- Light mode: class 'light-mode' added

### Filters State

**Stored in**: React component state (useIncidents)

**Structure**:
```typescript
{
  status: '' | 'unconfirmed' | 'suspected' | 'confirmed' | 'sighted',
  method: 'Blunt Trauma' | 'Sharp Force' | ... | '',
  area: 'Croydon' | 'Peckham' | ... | ''
}
```

### Sort State

**Stored in**: React component state (useIncidents)

**Properties**:
- `sortField: 'date' | 'area' | 'status'`
- `sortDir: 1 | -1` (1 = asc, -1 = desc)

---

## Component Communication Pattern

### Parent Component

```typescript
export function ParentComponent() {
  const app = useApp();

  return (
    <div>
      <ChildComponent
        incident={app.getIncident('INC-123')}
        onUpdate={(data) => app.updateIncident('INC-123', data)}
        onDelete={() => app.deleteIncident('INC-123')}
      />
    </div>
  );
}
```

### Child Component

```typescript
interface ChildProps {
  incident: Incident;
  onUpdate: (data: Partial<Incident>) => void;
  onDelete: () => void;
}

export function ChildComponent({ incident, onUpdate, onDelete }: ChildProps) {
  return (
    <div>
      <h3>{incident.address}</h3>
      <button onClick={() => onUpdate({ status: 'confirmed' })}>
        Mark Confirmed
      </button>
      <button onClick={onDelete}>Delete</button>
    </div>
  );
}
```

---

## localStorage Keys

| Key | Type | Initial | Description |
|-----|------|---------|-------------|
| `lckData` | `Incident[]` | `[]` | All incidents |
| `slainTheme` | `'light' \| 'dark'` | `'dark'` | Theme preference |
| `mapBookmarks` | `MapBookmark[]` | `[]` | Saved map views (future) |
| `whiskerWatchPrefs` | `object` | `{}` | User settings (future) |

---

## Error Handling

### localStorage Quota Exceeded

```typescript
try {
  localStorage.setItem(key, JSON.stringify(value));
} catch (err) {
  if (err.name === 'QuotaExceededError') {
    console.error('Storage quota exceeded');
    setError(new Error('Storage quota exceeded'));
  }
  // State still updates, just doesn't persist
}
```

### API Timeout

```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000);

try {
  const response = await fetch(url, { signal: controller.signal });
} finally {
  clearTimeout(timeoutId);
}
```

### Race Conditions

```typescript
// Each request gets an ID
const searchRequestIdRef = useRef<number>(0);

const search = async (query: string) => {
  const requestId = ++searchRequestIdRef.current;
  const results = await api.search(query);

  // Only update state if this is the latest request
  if (requestId === searchRequestIdRef.current) {
    setResults(results);
  }
};
```

---

## Performance Optimizations

### Memoization

**filteredIncidents** uses useMemo:
```typescript
const filteredIncidents = useMemo(() => {
  // Apply filters and sorting
  return result;
}, [incidents, filters, sortField, sortDir]);
```
- Only recalculates when dependencies change
- Prevents unnecessary filtering on every render

### Callback Stability

All methods use useCallback:
```typescript
const createIncident = useCallback((data) => {
  // Create incident
}, [incidents, setIncidents]);
```
- Stable function references
- Prevents child re-renders

### Lazy Loading

Not yet implemented, but planned for:
- Large incident lists (100+ items)
- Photo loading in detail modal
- Chart rendering in stats

---

## Testing Strategy

### Unit Testing

```typescript
// Test useIncidents hook
describe('useIncidents', () => {
  test('creates incident with correct fields', () => {
    const { result } = renderHook(() => useIncidents());
    const incident = result.current.createIncident({...});
    expect(incident.id).toMatch(/^INC-/);
  });
});
```

### Integration Testing

```typescript
// Test component with AppProvider
render(
  <AppProvider>
    <MyComponent />
  </AppProvider>
);
```

### E2E Testing

```typescript
// Test user flow in browser
cy.visit('/');
cy.get('[data-testid=search]').type('Croydon');
cy.get('[data-testid=search-result]').first().click();
cy.get('[data-testid=incident-detail]').should('be.visible');
```

---

## Future Enhancements

1. **Undo/Redo** - Use immer.js for immutable state
2. **Real-time Sync** - WebSockets for multi-user
3. **Offline Mode** - Service Worker caching
4. **Performance** - Code splitting, lazy loading
5. **Accessibility** - ARIA labels, keyboard navigation
6. **Analytics** - Track user actions
7. **Error Boundaries** - Catch render errors

---

## Files by Responsibility

```
Core State Management:
  lib/types.ts          - Data structures
  lib/constants.ts      - Configuration
  hooks/useLocalStorage.ts    - Persistence
  hooks/useIncidents.ts       - Incident logic
  hooks/useTheme.ts           - Theme logic
  hooks/useGeocoding.ts       - Geocoding logic
  context/AppContext.tsx      - State provider

UI Components (Phase 2.4+):
  components/Header.tsx       - Top navigation
  components/Sidebar.tsx      - Left sidebar
  components/Map/             - Map interface
  components/ReportPanel.tsx  - Incident form
  components/DetailModal.tsx  - Incident detail view
  components/Toast.tsx        - Notifications
  components/ConfirmDialog.tsx - Delete confirmation
  components/Lightbox.tsx     - Image viewer

App Shell:
  app/layout.tsx        - HTML wrapper
  app/page.tsx          - Main page
  app/globals.css       - All styles
```
