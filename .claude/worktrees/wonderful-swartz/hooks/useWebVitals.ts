/**
 * useWebVitals Hook
 * Tracks Core Web Vitals and sends to analytics
 *
 * Metrics:
 * - LCP (Largest Contentful Paint): ≤2.5s
 * - FID (First Input Delay): ≤100ms (deprecated, use INP)
 * - CLS (Cumulative Layout Shift): ≤0.1
 * - INP (Interaction to Next Paint): ≤200ms
 * - TTFB (Time to First Byte): ≤600ms
 */

import { useEffect } from 'react';
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
import { reportWebVital } from '@/lib/monitoring';
import { config } from '@/lib/config';

/**
 * Web Vital metrics interface
 */
export interface WebVitalMetric {
  name: string;
  delta: number;
  value: number;
  id: string;
  navigationType?: string;
  rating?: 'good' | 'needs-improvement' | 'poor';
}

/**
 * useWebVitals Hook
 * Automatically tracks and reports Web Vitals to analytics
 *
 * Usage:
 * ```tsx
 * import { useWebVitals } from '@/hooks/useWebVitals';
 *
 * export default function App() {
 *   useWebVitals();
 *   return <MainApp />;
 * }
 * ```
 */
export function useWebVitals(): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Only track in production
    if (config.env.isDevelopment && !config.debug.enabled) {
      return;
    }

    const handleMetric = (metric: WebVitalMetric): void => {
      // Report to monitoring service
      reportWebVital(metric);

      // Log in development
      if (config.debug.enabled) {
        console.log(`[WebVital] ${metric.name}: ${metric.value.toFixed(2)}ms (Rating: ${metric.rating})`);
      }
    };

    // Initialize Web Vitals tracking
    try {
      // Largest Contentful Paint
      getCLS(handleMetric);

      // First Input Delay (deprecated)
      getFID(handleMetric);

      // First Contentful Paint
      getFCP(handleMetric);

      // Largest Contentful Paint
      getLCP(handleMetric);

      // Time to First Byte
      getTTFB(handleMetric);
    } catch (error) {
      console.error('[WebVitals] Error initializing metrics:', error);
    }
  }, []);
}

/**
 * Get Web Vitals thresholds
 */
export const webVitalsThresholds = {
  FCP: { good: 1800, 'needs-improvement': 3000 }, // First Contentful Paint
  LCP: { good: 2500, 'needs-improvement': 4000 }, // Largest Contentful Paint
  FID: { good: 100, 'needs-improvement': 300 },   // First Input Delay
  CLS: { good: 0.1, 'needs-improvement': 0.25 },  // Cumulative Layout Shift
  TTFB: { good: 600, 'needs-improvement': 1200 }, // Time to First Byte
} as const;

/**
 * Rate Web Vital metric
 */
export function rateWebVital(
  metricName: string,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = webVitalsThresholds[metricName as keyof typeof webVitalsThresholds];

  if (!thresholds) return 'poor';

  if (value <= thresholds.good) return 'good';
  if (value <= thresholds['needs-improvement']) return 'needs-improvement';
  return 'poor';
}

/**
 * Format Web Vital for display
 */
export function formatWebVital(metricName: string, value: number): string {
  const metricType = metricName.includes('CLS') ? 'number' : 'time';

  if (metricType === 'time') {
    return `${Math.round(value)}ms`;
  }

  return value.toFixed(2);
}

/**
 * Get Web Vital description
 */
export function getWebVitalDescription(metricName: string): string {
  const descriptions: Record<string, string> = {
    FCP: 'First Contentful Paint - Time until first content is painted',
    LCP: 'Largest Contentful Paint - Time until largest content is rendered',
    FID: 'First Input Delay - Time to respond to user input',
    INP: 'Interaction to Next Paint - Time from interaction to visual feedback',
    CLS: 'Cumulative Layout Shift - Unexpected layout movements',
    TTFB: 'Time to First Byte - Time to receive first byte from server',
  };

  return descriptions[metricName] || metricName;
}
