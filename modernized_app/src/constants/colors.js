/**
 * Color Palette
 * Centralizes all color definitions for the application
 * Supports dark and light modes via CSS variables
 */

export const COLORS = {
  // Dark mode (default)
  dark: {
    bg: '#080a0d',
    surface: '#0f1117',
    surface2: '#161a22',
    border: '#1c2230',
    accent: '#e63946',
    accent2: '#ff6b35',
    text: '#e8eaf0',
    textMuted: '#9ca3af',
    textDim: '#6b7280',
    green: '#2d9d6e',
    yellow: '#d4a017',
    blue: '#3b82f6',
  },

  // Light mode
  light: {
    bg: '#ffffff',
    surface: '#f9fafb',
    surface2: '#f3f4f6',
    border: '#e5e7eb',
    text: '#111827',
    textMuted: '#6b7280',
    textDim: '#9ca3af',
  },
};

// Status color mapping for incident cards
export const STATUS_COLORS = {
  open: '#2d9d6e',      // Green
  suspect: '#d4a017',   // Yellow
  closed: '#e63946',    // Red/Accent
};

// Severity color mapping
export const SEVERITY_COLORS = {
  fatal: '#e63946',           // Red
  critical: '#ff6b35',        // Orange
  injured: '#d4a017',         // Yellow
  suspected: '#9ca3af',       // Gray
};

// Method color mapping
export const METHOD_COLORS = {
  blunt: '#e63946',
  sharp: '#ff6b35',
  strangle: '#d4a017',
  poison: '#3b82f6',
  decapitation: '#8b0000',
  roadkill: '#9ca3af',
  accident: '#6b7280',
};
