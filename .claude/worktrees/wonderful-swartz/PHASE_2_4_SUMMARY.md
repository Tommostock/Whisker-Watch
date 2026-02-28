# Phase 2.4 Summary: Simple UI Components

**Status**: ✅ COMPLETE
**Commit**: `68af2bd` (Components: Add Toast, ConfirmDialog, Lightbox)
**Date**: 2025-02-27
**Lines of Code**: 561 total
- `Toast.tsx`: 138 lines
- `ConfirmDialog.tsx`: 164 lines
- `Lightbox.tsx`: 191 lines
- `index.ts`: 8 lines

---

## What Was Done

These are non-data components that don't need hooks, just React state and props. They provide foundational UI patterns for the larger components in phases 2.5+.

### 1. `components/Toast.tsx` (138 lines)

**Purpose**: Auto-dismissing toast notifications at bottom of screen

**Component**:
```typescript
<Toast messages={toasts} onDismiss={handleDismiss} />
```

**Props**:
- `messages: ToastMessage[]` - Array of toast messages
- `onDismiss?: (id: string) => void` - Called when toast auto-dismisses

**Toast Message Structure**:
```typescript
{
  id: string;           // Unique ID
  text: string;         // Message text
  color?: string;       // CSS color or variable like 'var(--green)'
  duration?: number;    // ms to show (default: 4000ms)
}
```

**Features**:
- ✅ Multiple messages supported (shows most recent)
- ✅ Auto-dismisses after duration
- ✅ Custom colors (CSS color strings or variables)
- ✅ Smooth fade out animation

**useToast Hook**:
```typescript
const { messages, showToast, dismissToast, clearToasts } = useToast();

showToast('Success!', 'var(--green)');
showToast('Error!', '#ff0000', 3000); // 3 second duration
```

**toastManager Singleton** (for non-React code):
```typescript
// In non-component code:
import { toastManager } from '@/components/Toast';

toastManager.show('Hello!', 'var(--accent)');
toastManager.dismiss(id);
toastManager.clear();
```

**Original App Integration**:
Matches original app's toast behavior:
- Color: `var(--accent)` = red (#e63946) by default
- Position: Bottom of screen
- Duration: 4 seconds
- Auto-dismisses without user action

---

### 2. `components/ConfirmDialog.tsx` (164 lines)

**Purpose**: Modal confirmation for destructive actions (delete, etc.)

**Component**:
```typescript
<ConfirmDialog
  isOpen={isOpen}
  title="Delete Incident"
  message="Delete this incident permanently?"
  confirmText="Delete"
  isDanger
  onConfirm={() => handleDelete()}
  onCancel={() => setOpen(false)}
/>
```

**Props**:
- `isOpen: boolean` - Controls visibility
- `title?: string` - Dialog title (default: 'Confirm Action')
- `message: string` - Confirmation message (required)
- `confirmText?: string` - Confirm button text (default: 'Confirm')
- `cancelText?: string` - Cancel button text (default: 'Cancel')
- `isDanger?: boolean` - Red button for dangerous actions
- `onConfirm: () => void` - Callback when confirmed
- `onCancel: () => void` - Callback when cancelled
- `isLoading?: boolean` - Show loading state on button

**Features**:
- ✅ Escape key closes dialog
- ✅ Click X button closes
- ✅ Loading state disables buttons
- ✅ Danger mode (red button) for destructive actions
- ✅ Customizable button text

**useConfirmDialog Hook**:
```typescript
const { isOpen, openConfirm, closeConfirm, handleConfirm, isLoading } = useConfirmDialog();

const handleDelete = async () => {
  handleConfirm(async () => {
    await deleteIncident(id);
  });
};

<ConfirmDialog
  isOpen={isOpen}
  message="Delete?"
  onConfirm={handleDelete}
  onCancel={closeConfirm}
  isLoading={isLoading}
/>
```

**Original App Integration**:
Matches original app's delete confirmation:
- Modal overlay with dark background
- Title at top, X button in corner
- Message in body
- Cancel and danger buttons in footer
- Closes on Escape key

---

### 3. `components/Lightbox.tsx` (191 lines)

**Purpose**: Full-screen image viewer for incident photos

**Component**:
```typescript
<Lightbox
  isOpen={isOpen}
  imageSrc={photoData}
  onClose={closeLightbox}
  title="Incident Photo 1"
/>
```

**Props**:
- `isOpen: boolean` - Controls visibility
- `imageSrc: string` - Image URL or base64 data
- `onClose: () => void` - Callback to close
- `title?: string` - Optional image title

**Features**:
- ✅ Click outside image closes
- ✅ Escape key closes
- ✅ Responsive image scaling
- ✅ Optional title display
- ✅ Keyboard hint shown
- ✅ Supports base64 and URLs

**useLightbox Hook**:
```typescript
const { isOpen, imageSrc, title, openLightbox, closeLightbox } = useLightbox();

// Open lightbox
<img
  src={photo.data}
  onClick={() => openLightbox(photo.data, photo.name)}
  style={{ cursor: 'pointer' }}
/>

// Render lightbox
<Lightbox
  isOpen={isOpen}
  imageSrc={imageSrc}
  title={title}
  onClose={closeLightbox}
/>
```

**Original App Integration**:
Matches original app's lightbox:
- Full screen dark overlay
- Image centered and scaled to fit
- Close button (✕) in top-right
- Click outside image closes
- Escape key closes
- Shows loading if image is large

---

## Component Hierarchy

```
App
├── AppProvider
│   ├── Toast (notifications)
│   ├── ConfirmDialog (deletions)
│   ├── Lightbox (image viewing)
│   ├── Header
│   ├── Sidebar
│   └── Map
```

---

## CSS Classes Used

All components use original CSS classes for styling consistency:

**Toast**:
```css
.toast { /* positioning, styling */ }
.toast.open { display: flex; }
```

**ConfirmDialog**:
```css
.overlay { display: flex; align-items: center; justify-content: center; }
.modal { position: relative; }
.modal-hdr, .modal-body, .modal-ftr { /* sections */ }
.modal-title, .modal-x { /* heading & close */ }
.btn, .btn-ghost, .btn-danger { /* buttons */ }
```

**Lightbox**:
```css
.lightbox { /* full screen positioning */ }
.lightbox.open { display: flex; }
.lightbox-close { /* close button */ }
```

---

## Usage Patterns

### In Header (for theme toggle feedback)

```typescript
export function Header() {
  const { toggleTheme } = useAppTheme();
  const { messages, showToast, dismissToast } = useToast();

  return (
    <>
      <button onClick={() => {
        toggleTheme();
        showToast('✅ Theme changed');
      }}>
        Toggle Theme
      </button>

      <Toast messages={messages} onDismiss={dismissToast} />
    </>
  );
}
```

### In ReportPanel (for form submission)

```typescript
export function ReportPanel() {
  const { createIncident } = useAppIncidents();
  const { messages, showToast, dismissToast } = useToast();
  const { isOpen, openConfirm, closeConfirm, handleConfirm } = useConfirmDialog();

  const handleSubmit = async (formData) => {
    try {
      const incident = createIncident(formData);
      showToast(`✅ Incident ${incident.id} logged`, 'var(--green)');
    } catch (err) {
      showToast('❌ Failed to save', 'var(--accent)');
    }
  };

  const handleDelete = async () => {
    handleConfirm(async () => {
      // Delete logic here
      showToast('🗑 Incident deleted', 'var(--green)');
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* form fields */}
      </form>

      <button onClick={openConfirm}>Delete</button>

      <Toast messages={messages} onDismiss={dismissToast} />
      <ConfirmDialog
        isOpen={isOpen}
        message="Delete permanently?"
        onConfirm={handleDelete}
        onCancel={closeConfirm}
        isDanger
      />
    </>
  );
}
```

### In DetailModal (for photo viewing)

```typescript
export function DetailModal() {
  const { isOpen, imageSrc, title, openLightbox, closeLightbox } = useLightbox();
  const incident = useAppIncidents().getIncident(id);

  return (
    <>
      <div>
        {incident?.photos.map(photo => (
          <img
            key={photo.name}
            src={photo.data}
            onClick={() => openLightbox(photo.data, photo.name)}
            style={{ cursor: 'pointer' }}
          />
        ))}
      </div>

      <Lightbox
        isOpen={isOpen}
        imageSrc={imageSrc}
        title={title}
        onClose={closeLightbox}
      />
    </>
  );
}
```

---

## Testing Checklist

- [ ] Toast displays with correct message
- [ ] Toast auto-dismisses after duration
- [ ] Toast color applied correctly
- [ ] Multiple toasts show only latest
- [ ] ConfirmDialog opens on click
- [ ] Escape key closes ConfirmDialog
- [ ] Click X button closes ConfirmDialog
- [ ] onConfirm called when button clicked
- [ ] onCancel called when cancelled
- [ ] Loading state disables buttons
- [ ] Danger mode shows red button
- [ ] Lightbox opens on image click
- [ ] Escape key closes Lightbox
- [ ] Click outside closes Lightbox
- [ ] Image scales to fit screen
- [ ] Title displays if provided
- [ ] useToast hook manages state
- [ ] useConfirmDialog hook manages state
- [ ] useLightbox hook manages state
- [ ] toastManager works outside React components

---

## File Structure

```
components/
├── Toast.tsx (138 lines)
├── ConfirmDialog.tsx (164 lines)
├── Lightbox.tsx (191 lines)
└── index.ts (8 lines)

Total: 501 lines
```

---

## Integration Ready

These components are ready to be integrated into:
- **Phase 2.5** - `Header.tsx` (will use Toast)
- **Phase 2.8** - `ReportPanel.tsx` (will use Toast, ConfirmDialog)
- **Phase 2.8** - `DetailModal.tsx` (will use Lightbox, ConfirmDialog)

---

## Performance Notes

- ✅ No dependencies on hooks or context
- ✅ Lightweight (561 lines total)
- ✅ No external libraries needed
- ✅ Fast render cycles
- ✅ CSS animations are GPU-accelerated

---

## Accessibility

- ✅ Keyboard navigation (Escape key)
- ✅ Proper ARIA roles on Lightbox
- ✅ Focus management in modals
- ✅ Color-independent danger indication (button placement)
- ✅ Loading state clear with text

---

## Next Phase (2.5)

**Header Component** (~1 hour):
- Logo and branding
- Stat pills (total, unconfirmed, suspected, confirmed)
- Theme toggle button
- Login button (placeholder)
- Log Incident button
- Uses Toast for feedback

All these components will integrate with AppContext state.

---

## Commit

```
68af2bd Components: Add Toast, ConfirmDialog, Lightbox (Phase 2.4)
```

---

**Status: Ready for Phase 2.5 ✅**
