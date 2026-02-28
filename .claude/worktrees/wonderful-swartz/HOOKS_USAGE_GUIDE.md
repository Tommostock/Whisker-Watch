# Hooks Usage Guide

Quick reference for using the hooks in components.

## Setup

### 1. Wrap App with AppProvider

In `app/layout.tsx` or `app/page.tsx`:

```typescript
import { AppProvider } from '@/context/AppContext';

export default function RootLayout({ children }) {
  return (
    <AppProvider>
      {children}
    </AppProvider>
  );
}
```

### 2. Use Hooks in Components

```typescript
'use client';

import { useApp, useAppIncidents, useAppTheme } from '@/context/AppContext';

export function MyComponent() {
  const app = useApp(); // Full state
  const incidents = useAppIncidents(); // Just incidents
  const theme = useAppTheme(); // Just theme

  // Use as needed
}
```

---

## Common Patterns

### Display Incident List

```typescript
export function IncidentList() {
  const { filteredIncidents } = useAppIncidents();

  return (
    <ul>
      {filteredIncidents.map(incident => (
        <li key={incident.id}>
          {incident.address} - {incident.status}
        </li>
      ))}
    </ul>
  );
}
```

### Create Incident

```typescript
export function CreateForm() {
  const { createIncident } = useAppIncidents();

  const handleSubmit = (formData) => {
    const incident = createIncident({
      address: formData.address,
      lat: 51.3757,
      lng: -0.0982,
      datetime: new Date().toISOString(),
      status: 'unconfirmed',
      animalType: 'Domestic Cat',
      // ... other fields
      caseNotes: [],
      photos: [],
      catName: '',
      animalDesc: '',
      age: '',
      sex: '',
      method: '',
      severity: '',
      notes: '',
      witnessName: '',
      witnessContact: '',
      witnessStatement: '',
      sightedDesc: '',
    });

    console.log('Created:', incident.id);
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Update Incident

```typescript
export function EditForm({ incidentId }) {
  const { getIncident, updateIncident } = useAppIncidents();
  const incident = getIncident(incidentId);

  const handleSubmit = (updates) => {
    updateIncident(incidentId, {
      status: updates.status,
      method: updates.method,
      // Only provide fields that changed
    });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Delete with Confirmation

```typescript
export function DeleteButton({ incidentId }) {
  const { deleteIncident } = useAppIncidents();

  const handleDelete = () => {
    if (window.confirm('Are you sure?')) {
      deleteIncident(incidentId);
    }
  };

  return <button onClick={handleDelete}>Delete</button>;
}
```

### Filter Incidents

```typescript
export function FilterPanel() {
  const { applyFilters, getAreasList } = useAppIncidents();
  const areas = getAreasList();

  const handleStatusChange = (status) => {
    applyFilters({
      status: status as any,
      method: '',
      area: '',
    });
  };

  return (
    <div>
      <select onChange={(e) => handleStatusChange(e.target.value)}>
        <option value="">All Statuses</option>
        <option value="unconfirmed">Unconfirmed</option>
        <option value="suspected">Suspected</option>
        <option value="confirmed">Confirmed</option>
        <option value="sighted">Sighted</option>
      </select>

      <select onChange={(e) => applyFilters({ status: '', method: e.target.value, area: '' })}>
        <option value="">All Methods</option>
        {/* Add methods */}
      </select>

      <select onChange={(e) => applyFilters({ status: '', method: '', area: e.target.value })}>
        <option value="">All Areas</option>
        {areas.map(area => (
          <option key={area} value={area}>{area}</option>
        ))}
      </select>
    </div>
  );
}
```

### Search Incidents

```typescript
export function SearchBox() {
  const [query, setQuery] = useState('');
  const { searchIncidents } = useAppIncidents();
  const results = query ? searchIncidents(query) : [];

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by ID, address, cat name..."
      />
      <div>
        Found {results.length} results
      </div>
    </div>
  );
}
```

### Add Case Note (Intel)

```typescript
export function AddNoteForm({ incidentId }) {
  const [text, setText] = useState('');
  const { addCaseNote } = useAppIncidents();

  const handleSubmit = () => {
    if (text.trim().length > 0) {
      addCaseNote(incidentId, text);
      setText(''); // Clear form
    }
  };

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={500}
        placeholder="Add investigation note..."
      />
      <button onClick={handleSubmit}>Add Note</button>
      <span>{text.length}/500</span>
    </div>
  );
}
```

### Display Case Notes

```typescript
export function CaseNotesList({ incident }) {
  const { deleteCaseNote } = useAppIncidents();

  return (
    <div>
      {incident.caseNotes?.map(note => (
        <div key={note.id}>
          <div style={{ fontSize: '12px', color: '#999' }}>
            {new Date(note.timestamp).toLocaleString()}
          </div>
          <div>{note.text}</div>
          <button onClick={() => deleteCaseNote(incident.id, note.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Toggle Theme

```typescript
export function ThemeToggle() {
  const { theme, toggleTheme } = useAppTheme();

  return (
    <button onClick={toggleTheme}>
      {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}
```

### Search Address

```typescript
export function AddressSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const { searchAddress, searchAddressLoading, searchAddressError } = useAppGeocoding();

  const handleSearch = async (q) => {
    setQuery(q);
    const res = await searchAddress(q);
    setResults(res);
  };

  const handleSelectResult = (result) => {
    // Use result.lat, result.lon, result.display_name
  };

  return (
    <div>
      <input
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Enter address..."
      />
      {searchAddressLoading && <div>Searching...</div>}
      {searchAddressError && <div>Error: {searchAddressError.message}</div>}
      <ul>
        {results.map(result => (
          <li key={result.display_name} onClick={() => handleSelectResult(result)}>
            {result.display_name}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Reverse Geocode (Get Address from Coords)

```typescript
export function ReverseGeocodeExample() {
  const { reverseGeocode, reverseGeoLoading } = useAppGeocoding();
  const [address, setAddress] = useState('');

  const handleMapClick = async (lat, lng) => {
    const addr = await reverseGeocode(lat, lng);
    setAddress(addr);
  };

  return (
    <div>
      <button onClick={() => handleMapClick(51.3757, -0.0982)}>
        Get Address for Croydon
      </button>
      {reverseGeoLoading && <div>Loading...</div>}
      {address && <div>Address: {address}</div>}
    </div>
  );
}
```

### Get Statistics

```typescript
export function Stats() {
  const { getStats } = useAppIncidents();
  const stats = getStats();

  return (
    <div>
      <p>Total: {stats.total}</p>
      <p>Confirmed: {stats.confirmed}</p>
      <p>Suspected: {stats.suspected}</p>
      <p>Unconfirmed: {stats.unconfirmed}</p>
      <p>Sighted: {stats.sighted}</p>
    </div>
  );
}
```

---

## Tips

### ✅ Use typed sub-hooks when you only need specific data

```typescript
// ✅ GOOD - Only access what you need
const { incidents, createIncident } = useAppIncidents();

// ❌ LESS EFFICIENT - Accessing entire app state
const app = useApp();
const incidents = app.incidents;
const createIncident = app.createIncident;
```

### ✅ Use callbacks to keep references stable

```typescript
const handleSort = useCallback((field) => {
  setSort(field);
}, [setSort]);

return <SortButton onClick={handleSort} />; // Stable reference
```

### ✅ Extract areas for filters

```typescript
const areas = getAreasList();
// Use in dropdown
```

### ✅ Handle errors from geocoding

```typescript
const { searchAddress, searchAddressError } = useAppGeocoding();

if (searchAddressError) {
  console.error('Search failed:', searchAddressError.message);
  // Show error UI
}
```

### ❌ Don't modify incident objects directly

```typescript
// ❌ BAD - Direct mutation
const incident = getIncident('INC-123');
incident.status = 'confirmed'; // Won't trigger update

// ✅ GOOD - Use updateIncident
updateIncident('INC-123', { status: 'confirmed' });
```

### ❌ Don't store incidents in local component state

```typescript
// ❌ BAD - Out of sync with global state
const [incident, setIncident] = useState();

// ✅ GOOD - Get from global state
const incident = getIncident(id);
```

---

## Type Safety

All hooks are fully typed:

```typescript
// Incident type
type Incident = {
  id: string;
  address: string;
  lat: number;
  lng: number;
  // ... etc
};

// Filter type
type FilterState = {
  status: '' | 'unconfirmed' | 'suspected' | 'confirmed' | 'sighted';
  method: string;
  area: string;
};

// Theme type
type Theme = 'light' | 'dark';
```

TypeScript will catch errors at compile time:

```typescript
// ✅ OK
updateIncident(id, { status: 'confirmed' });

// ❌ ERROR - Invalid status
updateIncident(id, { status: 'invalid' });

// ❌ ERROR - Unknown field
updateIncident(id, { foo: 'bar' });
```

---

## Performance Tips

### 1. Memoize components that use large lists

```typescript
import { memo } from 'react';

export const IncidentListItem = memo(function IncidentListItem({ incident }) {
  return <div>{incident.address}</div>;
});
```

### 2. Use searchIncidents for instant search

```typescript
// Much faster than making API call
const results = searchIncidents(query);
```

### 3. Use getAreasList() before rendering dropdowns

```typescript
const areas = getAreasList();
// Memoized, won't recalculate unless incidents change
```

### 4. Debounce search input

```typescript
const [query, setQuery] = useState('');
const debouncedSearch = useCallback(
  debounce((q) => {
    setQuery(q);
  }, 300),
  []
);

return <input onChange={(e) => debouncedSearch(e.target.value)} />;
```

---

## Error Handling

### localStorage Errors

```typescript
const { createIncident } = useAppIncidents();

try {
  const incident = createIncident(data);
} catch (err) {
  console.error('Failed to create incident:', err);
  // Show error to user
}
```

### Geocoding Errors

```typescript
const { searchAddress, searchAddressError } = useAppGeocoding();

if (searchAddressError) {
  console.error('Address search failed:', searchAddressError.message);
  // Fall back to manual coordinate entry
}
```

### Outside Provider Error

```typescript
// ❌ This will throw:
export function BadComponent() {
  const app = useApp(); // ERROR: must be inside AppProvider
}

// ✅ Wrap parent with AppProvider first
<AppProvider>
  <BadComponent /> {/* Now OK */}
</AppProvider>
```

---

## Next Steps

Once these hooks are stable, components can be built:
1. **Phase 2.4**: Toast, ConfirmDialog, Lightbox
2. **Phase 2.5**: Header component
3. **Phase 2.6**: Map engine (largest component)
4. **Phase 2.7**: Sidebar + tabs
5. **Phase 2.8**: Forms + modals
