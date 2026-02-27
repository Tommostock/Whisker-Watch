/**
 * Hooks barrel export for convenience
 */

export { useLocalStorage, getStorageValue, setStorageValue, clearStorage, removeStorageKey } from './useLocalStorage';
export type { useIncidents } from './useIncidents';
export { useTheme, getSystemTheme, useSystemThemeListener } from './useTheme';
export { useGeocoding, geocodeAddress, reverseGeocodeCoordinates } from './useGeocoding';
export { useSidebarFilters } from './useSidebarFilters';
export type { SidebarFilters, SidebarFiltersHook } from './useSidebarFilters';

export { useFormValidation } from './useFormValidation';
export { VALIDATION_RULES } from './useFormValidation';
export type { FormErrors, ValidationRules, FormValidationHook } from './useFormValidation';

export { useKeyboardShortcuts } from './useKeyboardShortcuts';
export type { KeyboardShortcuts } from './useKeyboardShortcuts';

export { useMobileSidebar } from './useMobileSidebar';
export type { MobileSidebarHook } from './useMobileSidebar';
