# Header Component Design

## Visual Layout

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                                                                                │
│  🐱 Whisker Watch        │ Total │ Unconf │ Suspect │ Confirm │  ☀️ Login  + Log  │
│     SLAIN Network    12345│   5   │   3    │   2     │   4     │            │
│     Incident Tracker v2   │                                     │              │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

## Breakdown by Section

### 1. Logo Section (Left)

```
┌──────────────────────────────────┐
│ 🐱 Whisker Watch                 │
│    SLAIN Network • Tracker v2    │
└──────────────────────────────────┘
```

**Contains**:
- SVG cat icon (scalable)
- Title: "Whisker Watch" (24px bold)
- Subtitle: "SLAIN Network • Incident Tracker v2" (11px muted)
- Link to GitHub repo

**Styling**:
- Flexbox row alignment
- Gap between icon and text
- Icon: 48x48px
- Muted colors for subtitle
- "v2" link in accent color

### 2. Stats Section (Center)

```
┌──────────────────────────────────────────────────────┐
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│ │ Total  │ │Unconf. │ │Suspect │ │Confirm │       │
│ │  1234  │ │  234   │ │  456   │ │  890   │       │
│ └────────┘ └────────┘ └────────┘ └────────┘       │
└──────────────────────────────────────────────────────┘
```

**Stats Pills**:
- Width: auto (fits content)
- Height: ~32px
- Padding: 5px 12px
- Border-radius: 20px (pill shape)
- Border: 1px solid `var(--border)`
- Background: `var(--surface2)`

**Each Pill Contains**:
- Label: "Total", "Unconfirmed", "Suspected", "Confirmed" (12px, muted)
- Count: number (bold, colored)

**Count Colors**:
- Total: `var(--text)` (white/dark)
- Unconfirmed: `#2d9d6e` (green)
- Suspected: `#d4a017` (yellow)
- Confirmed: `#e63946` (red)

**Spacing**:
- Gap between pills: 8px
- Left margin: 30px (from logo)
- Right margin: auto (pushes actions to right)

### 3. Right Actions (Right)

```
┌──────────────────────────────────┐
│  ☀️  │  Login  │  + Log Incident │
└──────────────────────────────────┘
```

**Buttons**:

1. **Theme Toggle**
   - Type: Icon button (`.btn-icon`)
   - Icon: ☀️ (light mode) or 🌙 (dark mode)
   - Width/Height: 36x36px
   - Border: 1px solid `var(--border)`
   - Background: `var(--surface2)`
   - Hover: border changes to `var(--accent)`, text changes to accent

2. **Login Button**
   - Type: Ghost button (`.btn btn-ghost`)
   - Text: "Login"
   - Padding: 9px 16px
   - Border: 1px solid `var(--border)`
   - Text color: `var(--text-muted)`
   - Hover: border and text change to `var(--accent)`
   - Status: Placeholder (shows "coming soon" toast)

3. **Log Incident Button**
   - Type: Primary button (`.btn btn-primary`)
   - Text: "+ Log Incident"
   - Padding: 9px 16px
   - Background: `var(--accent)` (red #e63946)
   - Text color: white
   - Hover: darker red
   - Status: Functional (triggers callback to open report panel)

**Spacing**:
- Gap between buttons: 10px
- Right padding: 20px (from edge)

---

## Data Flow

### Stats Updates

```
Incident Created/Updated/Deleted
        ↓
useIncidents hook updates state
        ↓
localStorage updated
        ↓
useIncidents dependency change detected
        ↓
getStats() recalculated
        ↓
Header receives new stats via useAppIncidents()
        ↓
Component re-renders with updated counts
```

### Theme Toggle

```
User clicks theme icon
        ↓
handleThemeToggle() called
        ↓
toggleTheme() from useAppTheme()
        ↓
Theme state changes ('dark' ↔ 'light')
        ↓
useLocalStorage saves to localStorage
        ↓
useEffect watches theme change
        ↓
document.body.classList updated
        ↓
CSS: body.light-mode { --bg: var(--bg-light); ... }
        ↓
All CSS variables switch
        ↓
showToast() displays "Switched to Dark/Light mode"
        ↓
Component re-renders with new icon
```

### Log Incident Click

```
User clicks "+ Log Incident"
        ↓
onLogIncidentClick() callback triggered
        ↓
Parent component state updated
        ↓
ReportPanel opened
        ↓
User fills form
        ↓
submitReport() called
        ↓
useAppIncidents.createIncident() called
        ↓
Incident saved to state and localStorage
        ↓
Header stats automatically update
        ↓
Toast shows "Incident INC-ABC logged"
```

---

## Responsive Behavior

### Desktop (>640px)

```
[Logo] [Stats Pills..................] [Theme] [Login] [+ Log Incident]
```

Full layout with all elements visible.

### Tablet (640-1024px)

```
[Logo] [Stats Pills........] [Theme] [Login] [Log]
```

Stats pills may wrap or compress depending on space.

### Mobile (<640px)

Expected behavior (when Sidebar collapses):
- Logo might shrink to just icon
- Stats pills may become smaller or stack
- Buttons might be reorganized (possible hamburger menu)

**Note**: Full responsive implementation depends on Sidebar/Main layout.

---

## Theme Switching Examples

### Dark Mode (Default)

```
Header Background: var(--surface) = #0f1117
Logo Text: var(--text) = #e8eaf0
Stats Pills: var(--surface2) = #161a22
Button Text: var(--text-muted) = #9ca3af
```

### Light Mode

```
Header Background: var(--surface-light) = #f9fafb
Logo Text: var(--text-light) = #111827
Stats Pills: var(--surface2-light) = #f3f4f6
Button Text: var(--text-muted-light) = #6b7280
```

All colors automatically switch via CSS variables.

---

## Stats Color Mapping

| Status | Count Color | Hex | CSS Variable |
|--------|-------------|-----|--------------|
| Total | Text color | - | `var(--text)` |
| Unconfirmed | Green | #2d9d6e | Hardcoded |
| Suspected | Yellow | #d4a017 | Hardcoded |
| Confirmed | Red | #e63946 | `var(--accent)` |

Hardcoded colors (green, yellow) are used to maintain consistency with the original app's design.

---

## Interaction States

### Theme Toggle Button

```
Normal:
  Border: var(--border)
  Color: var(--text-muted)
  Icon: ☀️ (in dark mode) or 🌙 (in light mode)

Hover:
  Border: var(--accent)
  Color: var(--accent)
  Icon: Same (icon doesn't change on hover)

Active/Focused:
  Same as hover
```

### Login Button

```
Normal:
  Border: var(--border)
  Color: var(--text-muted)
  Background: transparent

Hover:
  Border: var(--accent)
  Color: var(--accent)
  Background: transparent

Active/Focused:
  Same as hover

Disabled (if authenticated):
  Opacity: 0.5
  Cursor: not-allowed
```

### Log Incident Button

```
Normal:
  Background: var(--accent)
  Color: white
  Border: none

Hover:
  Background: #c1121f (darker red)
  Color: white
  Border: none

Active/Focused:
  Same as hover

Disabled:
  Opacity: 0.5
  Cursor: not-allowed
```

---

## Accessibility Features

✅ **Semantic HTML**: Uses `<header>` element
✅ **Icon Alt Text**: `aria-label="Toggle theme"` on icon button
✅ **Title Attributes**: All buttons have `title` for tooltips
✅ **Keyboard Navigation**: All buttons are keyboard accessible
✅ **Focus Visible**: Buttons show focus state
✅ **Color Not Alone**: Text labels alongside colors
✅ **ARIA Live Region**: Toast notifications have proper roles

---

## Performance Considerations

- **Stats Calculation**: Memoized in `useIncidents()`, only recalcs when incidents change
- **Theme Toggle**: Instant (DOM class update only)
- **Toast**: Lightweight, auto-dismisses
- **Re-renders**: Only when stats, theme, or Toast state changes
- **SVG Icon**: Inline (no extra HTTP request)

---

## Browser Compatibility

✅ Modern browsers (Chrome, Firefox, Safari, Edge)
✅ CSS custom properties (variables) supported
✅ Flexbox layout
✅ Media queries for responsive design
✅ SVG inline support

---

## Original App Comparison

**Feature** | **Original** | **New**
-----------|-------------|--------
Logo | HTML + CSS | React component
Stats Pills | HTML hardcoded | Dynamic from context
Stats Update | Manual | Real-time
Theme Toggle | Vanilla JS | React hook
Icons | Emoji text | Emoji + SVG
Toast | Custom HTML | Reusable component
Button Styling | Original CSS | Original CSS classes
Responsive | CSS media queries | CSS media queries

---

## Testing Guidance

### Unit Tests
```typescript
test('Header renders all stat pills', () => {
  render(<Header />, { wrapper: AppProvider });
  expect(screen.getByText('Total')).toBeInTheDocument();
  expect(screen.getByText('Unconfirmed')).toBeInTheDocument();
});

test('Theme toggle updates isDark state', () => {
  render(<Header />, { wrapper: AppProvider });
  const toggle = screen.getByLabelText('Toggle theme');
  fireEvent.click(toggle);
  expect(document.body.classList.contains('light-mode')).toBe(true);
});

test('Log Incident button calls callback', () => {
  const mockCallback = jest.fn();
  render(<Header onLogIncidentClick={mockCallback} />);
  fireEvent.click(screen.getByText('+ Log Incident'));
  expect(mockCallback).toHaveBeenCalled();
});
```

### Visual Tests
- Compare Header with original app at different viewport sizes
- Check stats colors match original
- Verify theme toggle icon changes
- Confirm button hover states

---

**Header Component: Foundation for Main App Layout ✅**
