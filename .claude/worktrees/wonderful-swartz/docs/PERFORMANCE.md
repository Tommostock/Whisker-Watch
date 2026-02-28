# Performance Testing & Monitoring

This document describes how to measure and track Whisker Watch's performance using Lighthouse CI.

## Quick Start

### Run Lighthouse Locally

```bash
# Build the app
npm run build

# Start production server in background
npm start &

# Run Lighthouse CI
npx lhci autorun

# Kill the server
pkill -f "next start"
```

### View Results

Results are uploaded to temporary public storage and linked in the CLI output.

## Configuration

### Performance Targets

Current thresholds in `lighthouserc.json`:

| Metric | Target | Why |
|--------|--------|-----|
| **Performance** | ≥75% | Map rendering and canvas operations are CPU-intensive |
| **Accessibility** | ≥90% | Incident data must be accessible to all users |
| **Best Practices** | ≥90% | Follow web standards and security best practices |
| **SEO** | ≥90% | Help search engines index the app |
| **PWA** | ≥60% (warn) | Mobile support is important but not critical |
| **FCP** | ≤2500ms | First Contentful Paint |
| **LCP** | ≤4000ms | Largest Contentful Paint (map rendering) |
| **CLS** | ≤0.1 | Cumulative Layout Shift |
| **TBT** | ≤300ms | Total Blocking Time |

### URLs Tested

- `http://localhost:3000` - Main app
- `http://localhost:3000/?tab=incidents` - With incidents loaded

Each URL is tested 3 times for consistency.

## Performance Optimization Tips

### 1. Bundle Size Optimization

**Current Status**: 106 kB First Load JS ✅

To check bundle size:
```bash
npm run build
du -sh .next/
```

To analyze:
```bash
npm install --save-dev @next/bundle-analyzer
```

### 2. Canvas Performance (Map)

The map uses HTML5 Canvas which is CPU-intensive. Optimization techniques:

```typescript
// Render only visible tiles
if (isInViewport(tile)) {
  renderTile(tile);
}

// Debounce pan/zoom events
const debouncedRender = debounce(render, 16); // 60fps
```

### 3. React Performance

```typescript
// Use React.memo for expensive components
export const MapPin = React.memo(({ incident }) => {
  return <canvas>{renderPin(incident)}</canvas>;
});

// Use useMemo for expensive calculations
const clusters = useMemo(() => {
  return clusterIncidents(incidents, mapState);
}, [incidents, mapState]);
```

### 4. Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src={photoUrl}
  width={400}
  height={300}
  alt="Incident photo"
  loading="lazy"
/>
```

### 5. Code Splitting

Next.js automatic code splitting:
```typescript
// Lazy load heavy components
const Map = dynamic(() => import('@/components/Map'), {
  loading: () => <Skeleton />,
});
```

## Core Web Vitals

Lighthouse measures three Core Web Vitals:

### 1. Largest Contentful Paint (LCP) ≤2.5s

Measures when the largest content element is painted.

**For Whisker Watch:**
- Map container is typically largest element
- Optimize by:
  - Reducing initial map render time
  - Lazy loading incident data
  - Caching tiles

### 2. First Input Delay (FID) [deprecated → use INP]

Measures response time to user input.

**For Whisker Watch:**
- Keep event handlers fast (<100ms)
- Debounce expensive handlers
- Offload work to Web Workers if needed

### 3. Cumulative Layout Shift (CLS) ≤0.1

Measures unexpected layout shifts.

**For Whisker Watch:**
- Reserve space for map (fixed dimensions)
- Avoid inserting content above existing content
- Use CSS `content-visibility` for below-fold content

## CI/CD Integration

### GitHub Actions Workflow

The `performance.yml` workflow:

1. Builds production bundle
2. Starts Next.js server
3. Runs Lighthouse 3 times
4. Uploads results to temporary storage
5. Comments on PR with results

**Triggered on:**
- Push to main/feature branches
- Weekly schedule (Sunday 2 AM UTC)

### Viewing Results

1. Check GitHub Actions tab
2. Click on "Performance Check" workflow
3. View Lighthouse URL in logs

Results expire after 7 days in temporary storage.

### Persistent Storage (Optional)

For long-term tracking, set up:

```bash
# Create GitHub personal access token
# Store as LHCI_GITHUB_APP_TOKEN in repo secrets

# Update lighthouserc.json
{
  "upload": {
    "target": "github",
    "token": "$LHCI_GITHUB_APP_TOKEN"
  }
}
```

## Local Profiling

### Chrome DevTools Performance Tab

1. Open Chrome DevTools (F12)
2. Go to Performance tab
3. Click Record
4. Interact with app
5. Click Stop
6. Analyze flame graph

Focus on:
- Long tasks (>50ms)
- Layout thrashing
- Excessive reflows

### Lighthouse in Chrome DevTools

1. DevTools → Lighthouse
2. Select "Performance"
3. Click "Analyze page load"
4. Review detailed report

### React DevTools Profiler

```bash
npm install react-devtools
```

Then:
1. Open React DevTools
2. Click Profiler tab
3. Record interactions
4. Identify slow renders

## Performance Budget

Current budget (target: <200 kB gzipped):

```
.next/static/chunks:
  main-*.js:        ~30 kB
  framework-*.js:   ~50 kB
  shared-*.js:      ~20 kB
  Other:            ~6 kB
─────────────────────────────
Total:             ~106 kB (First Load JS)
```

To monitor:
```bash
# Install webpack-bundle-analyzer
npm install --save-dev webpack-bundle-analyzer

# Create .next/analyze.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);

# Run analysis
ANALYZE=true npm run build
```

## Common Performance Issues

### Issue: Map rendering is slow

**Symptoms:**
- Panning/zooming feels laggy
- FPS drops during interaction

**Solutions:**
- Reduce tile resolution
- Implement viewport culling (don't render off-screen)
- Use `requestAnimationFrame` for smooth animation
- Profile with Chrome DevTools

### Issue: High TBT (Total Blocking Time)

**Symptoms:**
- App becomes unresponsive during heavy operations
- Long JS execution times in DevTools

**Solutions:**
- Break long tasks into chunks (< 50ms each)
- Use `requestIdleCallback` for non-critical work
- Offload to Web Worker
- Lazy load heavy features

### Issue: Layout Shift

**Symptoms:**
- Content jumps around during load
- Unexpected CLS violations

**Solutions:**
- Set explicit dimensions for dynamic content
- Use CSS Grid/Flexbox with fixed sizes
- Avoid inserting content above fold
- Use CSS `content-visibility: auto` for below-fold

### Issue: Large Bundle Size

**Symptoms:**
- Slow initial load
- High First Load JS metric

**Solutions:**
- Analyze bundle: `ANALYZE=true npm run build`
- Remove unused dependencies
- Implement code splitting
- Use dynamic imports for heavy features

## Monitoring Over Time

### Manual Checks

Run Lighthouse weekly:
```bash
npm run build
npm start &
npx lhci autorun
```

### Automated Trends

Track metrics in spreadsheet:
- Date
- Performance score
- LCP (ms)
- FCP (ms)
- CLS score
- Total JS size (kB)

### CI/CD Metrics

GitHub Actions workflow automatically tests:
- On every push (detect regressions early)
- Weekly schedule (monitor trends)
- PRs (prevent regressions before merge)

## Best Practices

1. **Always build before testing**
   ```bash
   npm run build
   ```

2. **Run multiple times** (variability is normal)
   - Network conditions vary
   - Browser caching affects results
   - Run 3+ times for consistency

3. **Test in production mode**
   - Development builds are unoptimized
   - Always use `npm run build && npm start`

4. **Check DevTools throttling**
   - Lighthouse simulates slow 4G by default
   - Results may differ from real-world usage

5. **Monitor Core Web Vitals in production**
   - Use web-vitals library
   - Send metrics to analytics service
   - Set up alerts for regressions

## Resources

- [Lighthouse Documentation](https://github.com/GoogleChrome/lighthouse)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Web Vitals](https://web.dev/vitals/)
- [Performance Best Practices](https://web.dev/performance/)
- [Next.js Performance](https://nextjs.org/learn/seo/web-performance)

## Next Steps

1. Run `npm run build` to verify bundle size
2. Start server and run Lighthouse locally
3. Review results and identify improvements
4. Set up CI/CD for automated monitoring
5. Monitor weekly trends
