/**
 * Theme Management
 * Dark/light mode switching functionality
 */

/**
 * Toggle between dark and light mode
 * Updates CSS variables and localStorage preference
 */
export function toggleTheme() {
  const body = document.body;
  const isDark = body.classList.contains('light-mode');

  if (isDark) {
    body.classList.remove('light-mode');
    localStorage.setItem('themeMode', 'dark');
  } else {
    body.classList.add('light-mode');
    localStorage.setItem('themeMode', 'light');
  }
}

/**
 * Initialize theme based on saved preference or system default
 * Call this on application startup
 */
export function initializeTheme() {
  const saved = localStorage.getItem('themeMode');

  if (saved === 'light') {
    document.body.classList.add('light-mode');
  } else if (saved === 'dark') {
    document.body.classList.remove('light-mode');
  } else {
    // System preference (if supported)
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      document.body.classList.add('light-mode');
    }
  }
}

/**
 * Get current theme mode
 * @returns {string} 'dark' or 'light'
 */
export function getCurrentTheme() {
  return document.body.classList.contains('light-mode') ? 'light' : 'dark';
}
