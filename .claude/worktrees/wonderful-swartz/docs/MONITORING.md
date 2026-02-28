# Monitoring & Analytics Setup

Comprehensive guide to monitoring, error tracking, and analytics for Whisker Watch.

## Quick Start

### 1. Install Dependencies

```bash
npm install web-vitals
```

### 2. Add to App Layout

```typescript
// app/layout.tsx
'use client';

import { useWebVitals } from '@/hooks/useWebVitals';
import { monitoring } from '@/lib/monitoring';
import { useEffect } from 'react';

export default function RootLayout({ children }) {
  // Track Web Vitals
  useWebVitals();

  // Initialize monitoring
  useEffect(() => {
    monitoring.init();
  }, []);

  return (
    <html>
      <head>
        {/* Google Analytics - add script here */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=GA_ID"
        ></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 3. Set Environment Variables

```env
# .env.production
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
NEXT_PUBLIC_GA_ID=GA-XXXXXXXXX-X
```

---

## Error Tracking (Sentry)

### Setup

1. Create [Sentry](https://sentry.io) account
2. Create project (Next.js)
3. Copy DSN from project settings
4. Add to environment variables:
   ```env
   NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
   ```

### Usage

```typescript
import { trackError } from '@/lib/monitoring';

try {
  // Some operation
  riskyOperation();
} catch (error) {
  trackError(error, { context: 'user-action' });
}
```

### Features

- **Automatic Error Capture**: Catches unhandled exceptions
- **Error Grouping**: Groups similar errors together
- **Stack Traces**: Full source maps support
- **Release Tracking**: Track which release caused issue
- **User Feedback**: Collect crash reports
- **Integration**: Slack, PagerDuty, etc.

### Monitoring

Access Sentry Dashboard:
- **Issues**: All errors with stack traces
- **Releases**: Track errors per release
- **Performance**: Transaction performance
- **Replays**: Session replay (paid)

---

## Performance Monitoring (Web Vitals)

### Core Web Vitals

| Metric | Threshold | What | Why |
|--------|-----------|------|-----|
| **LCP** | ≤2.5s | Largest Contentful Paint | Visual stability |
| **FID** | ≤100ms | First Input Delay | Interactivity |
| **CLS** | ≤0.1 | Cumulative Layout Shift | Visual stability |
| **INP** | ≤200ms | Interaction to Next Paint | Responsiveness |
| **TTFB** | ≤600ms | Time to First Byte | Server speed |

### Tracking

Web Vitals are automatically tracked when using `useWebVitals()`:

```typescript
import { useWebVitals } from '@/hooks/useWebVitals';

export default function App() {
  useWebVitals(); // Tracks all metrics

  return <YourApp />;
}
```

### Viewing Metrics

**Google Analytics:**
- Web Vitals report
- Custom metrics dashboard
- Trend analysis

**Lighthouse:**
- Local performance audit
- Run: `npm run perf`
- Check: Performance score

**Chrome DevTools:**
- Performance tab → Record
- Analyze flame graph
- Find bottlenecks

### Optimization Tips

**For LCP (≤2.5s):**
- Optimize server response
- Reduce JS bundle size
- Lazy load non-critical assets
- Optimize images

**For FID/INP (≤100ms):**
- Break long tasks (<50ms chunks)
- Defer non-critical JS
- Use web workers for heavy computation
- Optimize JavaScript execution

**For CLS (≤0.1):**
- Reserve space for dynamic content
- Avoid insertions above fold
- Use CSS containment
- Animate with transform, opacity

---

## Google Analytics

### Setup

1. Create [Google Analytics 4](https://analytics.google.com) property
2. Copy Measurement ID (G-XXXXXXXXXX)
3. Add to environment:
   ```env
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```

### Configuration

Add to `app/layout.tsx`:

```typescript
<Script
  strategy="afterInteractive"
  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
/>
<Script
  id="google-analytics"
  strategy="afterInteractive"
  dangerouslySetInnerHTML={{
    __html: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
    `,
  }}
/>
```

### Tracking Events

```typescript
import { trackEvent } from '@/lib/monitoring';

// User clicked "Log Incident" button
trackEvent('incidents', 'create_click', 'button');

// User viewed incident details
trackEvent('incidents', 'view', 'detail_modal');

// Map interaction
trackEvent('map', 'pan', 'user_interaction');
```

### Custom Events

Track any user action:

```typescript
trackEvent(
  'category',     // incidents, map, form, etc.
  'action',       // create, delete, view, etc.
  'label',        // specific item (optional)
  value           // numeric value (optional)
);
```

### Dashboard

Google Analytics Dashboard shows:
- **Realtime**: Live user activity
- **Acquisition**: Where users come from
- **Engagement**: How users interact
- **Retention**: Return user percentage
- **Conversions**: Goal completions
- **Events**: Custom event tracking

---

## Uptime Monitoring

### Setup Services

Choose one or more:

1. **UptimeRobot** (Free)
   - Simple uptime monitoring
   - Email alerts
   - Monthly uptime report

2. **Pingdom**
   - Detailed performance metrics
   - Multi-location monitoring
   - Advanced alerting

3. **Betterstack** (Recommended)
   - Uptime monitoring
   - Status page
   - Team collaboration
   - Integrations (Slack, PagerDuty)

### Configuration

Create monitor for production URL:

```
URL: https://whisker-watch.example.com
Check interval: 5 minutes
Timeout: 30 seconds
Expected status: 200
```

### Alerts

Set up alerts for:
- **Downtime**: Notify immediately
- **Degraded**: Notify if response > 5s
- **SSL**: Alert before expiration
- **DNS**: Alert on DNS failures

---

## Application Logging

### Client-Side Logging

```typescript
// Enable in development
if (config.debug.enabled) {
  console.log('Debug info');
}

// Structured logging
console.log('[ModuleName]', { action: 'event', data: value });
```

### Server-Side Logging

When you add API routes:

```typescript
// api/logs.ts
export async function POST(req: Request) {
  const { message, level, context } = await req.json();

  // Log to console
  console[level](`[${context}] ${message}`);

  // Send to external service (optional)
  // await sendToLoggingService({ message, level, context });

  return Response.json({ ok: true });
}
```

---

## Alerts & Notifications

### Sentry Alerts

Configure in Sentry Dashboard:

1. **Alerts** → **Create Alert Rule**
2. Set conditions:
   - `events` > `5` in `5` minutes
3. Set action:
   - Send to Slack channel
   - Send email
   - Create GitHub issue

### Analytics Alerts

Set up in Google Analytics:

1. **Admin** → **Alerts**
2. Create alert for:
   - Traffic drops > 20%
   - Bounce rate > 60%
   - Session duration < 30s

### Uptime Alerts

All uptime services support:
- Email notifications
- Slack integration
- SMS/Phone calls
- PagerDuty escalation

### Dashboard

Create unified dashboard with:
- Sentry: Error count, new issues
- Analytics: User sessions, engagement
- Uptime: Status, response times
- Performance: Web Vitals scores

---

## Data Retention Policies

### Sentry
- Free plan: 7 days
- Paid: Up to 90 days
- Processed events: Unlimited

### Google Analytics
- Data: 14 months
- Can extend retention settings

### Uptime Monitoring
- Logs: 90 days typically
- Reports: Keep permanently

### Recommendations

For production:
- Keep Sentry errors: 30+ days
- Keep Analytics: 24 months
- Archive logs: 1 year offline

---

## Privacy & Compliance

### GDPR Compliance

When tracking users:
- ✅ Get explicit consent
- ✅ Allow opt-out
- ✅ Don't track logged-out users (Whisker Watch has no auth)
- ✅ Anonymize IP addresses

### Implementation

```typescript
// Add to privacy policy
// "We use analytics to understand usage patterns"

// Allow opt-out
if (localStorage.getItem('analytics-opt-out')) {
  // Don't initialize analytics
}
```

### Data Minimization

Track only necessary data:
- Page views
- User interactions
- Performance metrics
- Error information

Don't track:
- Personal information
- Sensitive incident details
- User location (unless consented)

---

## Tools Summary

| Tool | Purpose | Cost | Setup Time |
|------|---------|------|-----------|
| **Google Analytics** | User behavior | Free | 5 min |
| **Sentry** | Error tracking | Free-$$ | 10 min |
| **Lighthouse CI** | Performance | Free | 15 min |
| **UptimeRobot** | Uptime monitoring | Free | 5 min |
| **Betterstack** | Uptime + status page | Free-$$ | 15 min |
| **New Relic** | APM (advanced) | $$$ | 30 min |
| **DataDog** | Comprehensive monitoring | $$$ | 30 min |

---

## Local Development

Disable monitoring in development (optional):

```typescript
// lib/config.ts
const isDev = process.env.NODE_ENV === 'development';

if (isDev && !process.env.NEXT_PUBLIC_DEBUG) {
  // Skip monitoring initialization
}
```

Or check environment:

```typescript
import { config } from '@/lib/config';

if (config.env.isDevelopment) {
  console.log('Development mode - monitoring disabled');
}
```

---

## Testing Monitoring

### Test Error Tracking

```typescript
// In component
<button onClick={() => {
  throw new Error('Test error');
}}>
  Test Error
</button>
```

Then check Sentry Dashboard for error.

### Test Events

```typescript
import { trackEvent } from '@/lib/monitoring';

trackEvent('test', 'event', 'test_event');
```

Then check Google Analytics for event.

### Test Web Vitals

```typescript
npm run dev
npm run perf
```

View Lighthouse results.

---

## References

- [Sentry Documentation](https://docs.sentry.io/)
- [Google Analytics](https://support.google.com/analytics/)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
