/**
 * Application Monitoring & Analytics
 * Centralizes error tracking, performance monitoring, and analytics
 */

import { config } from '@/lib/config';

/**
 * Initialize all monitoring services
 * Call this once at app startup (in layout.tsx or _app.tsx)
 */
export function initializeMonitoring(): void {
  if (typeof window === 'undefined') {
    console.log('[Monitoring] Server-side initialization skipped');
    return;
  }

  console.log('[Monitoring] Initializing monitoring services...');

  // Initialize Sentry (error tracking)
  if (config.sentry.dsn) {
    initializeSentry();
  }

  // Initialize Google Analytics
  if (config.analytics.googleAnalyticsId) {
    initializeGoogleAnalytics();
  }

  // Initialize Web Vitals tracking
  initializeWebVitals();

  console.log('[Monitoring] Monitoring initialized successfully');
}

/**
 * Initialize Sentry for error tracking
 * Captures unhandled errors and exceptions
 */
function initializeSentry(): void {
  // Note: Sentry should be initialized at app entry point
  // This is a placeholder for documentation
  console.log('[Sentry] Error tracking enabled');
  console.log(`[Sentry] DSN: ${config.sentry.dsn}`);
  console.log(`[Sentry] Environment: ${config.env.nodeEnv}`);
}

/**
 * Initialize Google Analytics
 * Tracks page views and user interactions
 */
function initializeGoogleAnalytics(): void {
  const gaId = config.analytics.googleAnalyticsId;

  // Load Google Analytics script
  if (!gaId) return;

  // Script will be loaded by next/script in layout
  console.log(`[Analytics] Google Analytics enabled: ${gaId}`);
}

/**
 * Initialize Web Vitals tracking
 * Measures performance metrics
 */
function initializeWebVitals(): void {
  // This will be called from useWebVitals hook
  console.log('[WebVitals] Performance monitoring enabled');
}

/**
 * Track custom event
 * Use for user interactions, features, etc.
 */
export function trackEvent(
  category: string,
  action: string,
  label?: string,
  value?: number
): void {
  if (!window.gtag) {
    console.warn('[Analytics] Google Analytics not initialized');
    return;
  }

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });

  if (config.debug.enabled) {
    console.log('[Analytics Event]', { category, action, label, value });
  }
}

/**
 * Track page view
 * Automatically called by Next.js router
 */
export function trackPageView(
  path: string,
  title?: string
): void {
  if (!window.gtag) {
    console.warn('[Analytics] Google Analytics not initialized');
    return;
  }

  window.gtag('config', config.analytics.googleAnalyticsId || '', {
    page_path: path,
    page_title: title || document.title,
  });

  if (config.debug.enabled) {
    console.log('[PageView]', { path, title });
  }
}

/**
 * Track error
 * Use for unexpected errors that don't crash the app
 */
export function trackError(
  error: Error | string,
  context?: Record<string, any>
): void {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'string' ? undefined : error.stack;

  // Send to Sentry
  if (window.Sentry) {
    window.Sentry.captureException(error, { contexts: { custom: context } });
  }

  // Send to Analytics
  trackEvent('error', 'exception', errorMessage);

  console.error('[Error Tracking]', {
    message: errorMessage,
    stack: errorStack,
    context,
  });
}

/**
 * Report Web Vital metric
 * Called by useWebVitals hook
 */
export function reportWebVital(metric: {
  name: string;
  delta: number;
  value: number;
  id: string;
  navigationType?: string;
}): void {
  // Send to Google Analytics
  if (window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    });
  }

  // Send to analytics service
  const body = JSON.stringify(metric);
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/vitals', body);
  }

  if (config.debug.enabled) {
    console.log('[WebVital]', metric);
  }
}

/**
 * Global gtag function (for TypeScript)
 * Extends window with gtag
 */
declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: any) => void;
    Sentry?: any;
  }
}

/**
 * Performance monitoring hooks
 */
export const monitoring = {
  init: initializeMonitoring,
  trackEvent,
  trackPageView,
  trackError,
  reportWebVital,
};
