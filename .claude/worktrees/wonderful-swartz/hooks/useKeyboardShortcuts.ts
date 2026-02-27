/**
 * useKeyboardShortcuts Hook
 * Handles global keyboard shortcuts for the application
 */

import { useEffect, useCallback } from 'react';

export interface KeyboardShortcuts {
  onNewReport?: () => void;
  onOpenMap?: () => void;
  onFocusSearch?: () => void;
  onToggleTheme?: () => void;
  onEscape?: () => void;
}

/**
 * Global keyboard shortcuts:
 * - Ctrl+N / Cmd+N: New report
 * - Ctrl+M / Cmd+M: Focus map
 * - Ctrl+F / Cmd+F: Focus search
 * - Ctrl+T / Cmd+T: Toggle theme
 * - Escape: Close modals / Clear focus
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcuts) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? event.metaKey : event.ctrlKey;

      // Prevent if user is typing in an input/textarea
      const target = event.target as HTMLElement;
      const isTextInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true';

      // Ctrl+N / Cmd+N: New report
      if (modifier && event.key === 'n' && !isTextInput) {
        event.preventDefault();
        shortcuts.onNewReport?.();
        return;
      }

      // Ctrl+M / Cmd+M: Focus map
      if (modifier && event.key === 'm' && !isTextInput) {
        event.preventDefault();
        shortcuts.onOpenMap?.();
        return;
      }

      // Ctrl+F / Cmd+F: Focus search
      if (modifier && event.key === 'f') {
        event.preventDefault();
        shortcuts.onFocusSearch?.();
        return;
      }

      // Ctrl+T / Cmd+T: Toggle theme
      if (modifier && event.key === 't' && !isTextInput) {
        event.preventDefault();
        shortcuts.onToggleTheme?.();
        return;
      }

      // Escape: Close modals
      if (event.key === 'Escape') {
        shortcuts.onEscape?.();
        return;
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
