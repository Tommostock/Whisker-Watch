# Whisker Watch: Single-File HTML → Next.js Migration

## Pre-Migration Snapshot (Baseline)

**Date**: 2026-02-27
**Current Version**: Single HTML file
**Repository**: https://github.com/Tommostock/Whisker-Watch

### Codebase Metrics

| Metric | Value |
|--------|-------|
| **Total Lines** | 3,262 |
| **HTML Lines** | ~670 |
| **CSS Lines** | ~659 |
| **JavaScript Lines** | ~2,238 |
| **File Size** | 157 KB |
| **Functions** | 108 unique functions |
| **State Variables** | 227 constants |
| **Mutable Variables** | 43 let/var variables |
| **External Dependencies** | 0 (no npm packages) |
| **Git Commits** | 82 total commits |

### File Structure
```
/c/Users/Tom/Desktop/Apps I Built/Whisker Watch/
├── index.html (3,262 lines, 157 KB)
├── true-lies.ttf (62 KB custom font)
├── vercel.json (deployment config)
└── .git/
```

### Backup Points

| Item | Type | Location |
|------|------|----------|
| **Full Code** | Git Branch | `backup/original-single-file-html` on GitHub |
| **Tagged Version** | Git Tag | `v1-original-html` on GitHub |
| **Archived Copy** | File | `whisker-watch-v1-original.html` in repo |
| **Vercel Deploy** | Live Site | https://whisker-watch.vercel.app |

**Recovery Instructions**: To revert to original at any time:
```bash
git checkout backup/original-single-file-html
git push -f origin main
# or
git reset --hard v1-original-html
```

---

## Features to Verify

### Map & Navigation
- [ ] Canvas-based map rendering with pan/zoom
- [ ] Mercator projection calculations
- [ ] Pin clustering at zoom levels
- [ ] Heatmap visualization
- [ ] Tile layer switching (street/satellite)
- [ ] Address geocoding (Nominatim)
- [ ] Reverse geocoding
- [ ] Geolocation
- [ ] Touch gestures (pinch zoom, drag)

### Data Management
- [ ] Incident CRUD operations
- [ ] localStorage persistence (key: `lckData`)
- [ ] Theme persistence (key: `slainTheme`)
- [ ] Data import (JSON)
- [ ] Data import (CSV)
- [ ] Data export
- [ ] Duplicate detection
- [ ] Photo storage (base64 encoding)

### Features
- [ ] Dark mode / Light mode toggle
- [ ] Search functionality (text + address)
- [ ] Filtering (status, method, area)
- [ ] Sorting (date, status, area)
- [ ] Intel/case notes (timestamped notes)
- [ ] Photo gallery + lightbox
- [ ] Side-by-side comparison view
- [ ] Statistics dashboard (8+ chart types)
- [ ] Timeline view

### UI Components
- [ ] Header with stat pills
- [ ] Sidebar with 3 tabs
- [ ] Report modal (create/edit incidents)
- [ ] Detail modal (incident view)
- [ ] Confirm dialog (delete)
- [ ] Toast notifications
- [ ] Search dropdown
- [ ] Import modal
- [ ] Lightbox overlay

### Responsive Design
- [ ] Desktop (1280px+) layout
- [ ] Tablet (768px) layout
- [ ] Mobile (375px) layout
- [ ] Touch gestures work
- [ ] Sidebar swipe gesture

### Data Structures

**Incident Object**:
```javascript
{
  id: string,
  address: string,
  lat: number,
  lng: number,
  datetime: string (ISO 8601),
  status: 'unconfirmed' | 'suspected' | 'confirmed' | 'sighted',
  animalType: string,
  catName: string | null,
  animalDesc: string,
  age: string,
  sex: string,
  method: string,
  severity: string,
  notes: string,
  witnessName: string,
  witnessContact: string,
  witnessStatement: string,
  area: string,
  createdAt: string (ISO 8601),
  updatedAt: string (ISO 8601),
  photos: string[] (base64 encoded),
  caseNotes: Array<{
    id: string,
    timestamp: string (ISO 8601),
    text: string,
    author: string
  }>
}
```

**localStorage Keys**:
- `lckData`: JSON string of incidents array
- `slainTheme`: 'dark' | 'light'

### CSS Variables
```css
--text: #1a1a1a (light) / #e0e0e0 (dark)
--text-muted: #666
--text-dim: #999
--surface: #fff (light) / #1a1a1a (dark)
--surface2: #f5f5f5 (light) / #2a2a2a (dark)
--border: #ddd (light) / #333 (dark)
--accent: #e83935
--green: #43a047
--orange: #fb8c00
--blue: #1e88e5
--purple: #8e24aa
```

### External APIs (No Auth Required)
- **Nominatim**: `https://nominatim.openstreetmap.org/` (geocoding)
- **Carto**: `https://basemaps.cartocdn.com/` (map tiles)
- **OpenStreetMap**: `https://tile.openstreetmap.org/` (fallback tiles)
- **ArcGIS**: `https://server.arcgisonline.com/` (satellite imagery)

### Performance Baseline
- Initial load: < 2 seconds
- Map rendering: < 500ms
- Incident list render: < 200ms (for 100 incidents)
- Search response: < 100ms
- Filter/sort: < 150ms

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Android)

### Known Quirks
- Nominatim API has rate limiting (one request per second)
- Photos stored as base64 in localStorage (size limited to ~5-10MB)
- Canvas-based map doesn't support vector layers
- Timeline view uses horizontal scroll on mobile

---

## Migration Progress

### Phase 0: Backup & Preparation
- [x] Create backup branch: `backup/original-single-file-html`
- [x] Create tag: `v1-original-html`
- [x] Archive original file: `whisker-watch-v1-original.html`
- [x] Document current state (this file)
- [x] Create feature branch: `feature/nextjs-migration`

### Phase 1: Next.js Setup
- [ ] Create Next.js project (`whisker-watch-v2`)
- [ ] Copy assets (fonts, etc.)
- [ ] Initialize git with separate repo
- [ ] Commit initial Next.js scaffold

### Phase 2: Core Implementation
- [ ] CSS migration (659 lines)
- [ ] Type definitions & constants
- [ ] Utility hooks (useIncidents, useTheme, useLocalStorage)
- [ ] Context provider
- [ ] Simple UI components (Toast, Lightbox, ConfirmDialog)
- [ ] Header component
- [ ] Map engine (CRITICAL PHASE)
- [ ] Sidebar & tabs
- [ ] Report panel & detail modal
- [ ] Integration & wiring

### Phase 3: Testing & Verification
- [ ] Functional test checklist (40+ items)
- [ ] Visual regression testing
- [ ] Data integrity verification
- [ ] Performance benchmarking

### Phase 4: Deployment
- [ ] Production build
- [ ] Deploy to Vercel
- [ ] Monitor for errors
- [ ] Keep original version available during transition

### Phase 5: Cleanup (Post-Migration)
- [ ] Deprecate original after N months
- [ ] Migrate all users to Next.js version
- [ ] Archive original repository

---

## Rollback Checklist

If any critical issues occur, follow this procedure:

### Immediate Rollback (< 5 minutes)
```bash
# Method 1: Revert to backup branch
git checkout backup/original-single-file-html
git push -f origin main

# Method 2: Revert to tag
git reset --hard v1-original-html
git push -f origin main

# Method 3: Redeploy original via Vercel dashboard
# (Select v1-original-html tag, deploy)
```

### Partial Rollback (specific component)
```bash
# Revert specific commit
git revert <commit-hash>
git push origin feature/nextjs-migration

# This keeps other components, reverts just the broken one
```

### Data Recovery
If any incident data is lost:
1. Check browser localStorage (not deleted)
2. Check GitHub for recent incident exports
3. Use archived incidents from backup branch
4. Never delete data, only restore from backups

---

## Success Criteria

When migration is complete, verify:

- [ ] All 40+ functional tests pass
- [ ] Visual design matches original pixel-for-pixel
- [ ] No console errors in DevTools
- [ ] Mobile responsive at 375px, 768px, 1280px
- [ ] Dark mode and light mode both work
- [ ] localStorage persistence works
- [ ] Performance is equal or better than original
- [ ] All incidents data preserved
- [ ] Map rendering identical
- [ ] All modals/forms functional
- [ ] Search and filter working
- [ ] No memory leaks

---

## Questions & Troubleshooting

**Q: What if the map looks different in Next.js?**
A: Check Mercator projection functions, canvas render loop, and clustering radius values. Compare with original at `whisker-watch-v1-original.html`.

**Q: How do I verify data wasn't lost?**
A: Export incidents from original, import to Next.js, count should match. localStorage key names remain the same.

**Q: Can I run both versions simultaneously?**
A: Yes! Original at `/Whisker Watch/index.html`, Next.js at `/whisker-watch-v2/`. Both can be tested in parallel.

**Q: What if I need to revert mid-migration?**
A: Git branches and tags allow reverting any commit. Detailed rollback procedures in "Rollback Checklist" section above.

---

**Created**: 2026-02-27
**Last Updated**: 2026-02-27
**Status**: Pre-migration (Phase 0 complete)
