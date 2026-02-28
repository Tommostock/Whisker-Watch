# Environment Configuration

This document describes environment variables and configuration for Whisker Watch.

## Overview

Whisker Watch uses environment variables for configuration. These are loaded from `.env` files using Next.js's built-in support.

**Files:**
- `.env.example` - Template with all available variables
- `.env.development` - Development defaults (committed)
- `.env.local` - Local overrides (git-ignored, not committed)
- `.env.production` - Production settings (use in CI/CD)

## Development Setup

### Quick Start

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. The `.env.development` file has sensible defaults for local development

3. Start the dev server:
   ```bash
   npm run dev
   ```

### Available Variables

#### Geocoding (Nominatim OpenStreetMap)
```env
NEXT_PUBLIC_NOMINATIM_API=https://nominatim.openstreetmap.org
```
- **Type**: Required
- **Public**: Yes (client-side)
- **Purpose**: Address search and reverse geocoding
- **Default**: OSM public endpoint (no auth required)
- **Rate Limits**: ~1 request/second per IP
- **Docs**: https://nominatim.org/release-docs/latest/api/Overview/

#### Map Tiles (CARTO)
```env
NEXT_PUBLIC_CARTO_API=https://cartodb-basemaps-a.global.ssl.fastly.net
```
- **Type**: Required
- **Public**: Yes (client-side)
- **Purpose**: Base map tiles (terrain, streets, etc.)
- **Default**: CARTO public endpoint
- **Attribution**: Required in map (included in app)
- **Docs**: https://carto.com/

#### Application Environment
```env
NODE_ENV=development|staging|production
```
- **Type**: Required
- **Public**: No
- **Values**: `development`, `staging`, `production`
- **Auto-set by**: Vercel, Next.js, or manually
- **Purpose**: Controls feature flags and behavior

#### Debug Mode
```env
NEXT_PUBLIC_DEBUG=true|false
```
- **Type**: Optional
- **Public**: Yes (client-side)
- **Default**: `false` (disabled in production)
- **Purpose**: Enables detailed logging in browser console

#### Feature Flags
```env
NEXT_PUBLIC_PHOTOS_ENABLED=true|false
NEXT_PUBLIC_CASE_NOTES_ENABLED=true|false
NEXT_PUBLIC_EXPORT_ENABLED=true|false
```
- **Type**: Optional (all enabled by default)
- **Public**: Yes (client-side)
- **Purpose**: Enable/disable optional features
- **Note**: Currently all features are implemented and should be `true`

## Environment Files Reference

### Development (`.env.development`)

Committed to git. Used when `NODE_ENV=development`.

```env
NODE_ENV=development
NEXT_PUBLIC_NOMINATIM_API=https://nominatim.openstreetmap.org
NEXT_PUBLIC_CARTO_API=https://cartodb-basemaps-a.global.ssl.fastly.net
NEXT_PUBLIC_DEBUG=true
NEXT_PUBLIC_PHOTOS_ENABLED=true
NEXT_PUBLIC_CASE_NOTES_ENABLED=true
NEXT_PUBLIC_EXPORT_ENABLED=true
```

**Use when:**
- Running `npm run dev` locally
- Running tests locally

### Local Overrides (`.env.local`)

Git-ignored. Used to override defaults locally.

**Example:**
```env
# Override API endpoints for testing
NEXT_PUBLIC_NOMINATIM_API=http://localhost:8000/nominatim
```

### Production (`.env.production`)

Set in CI/CD or Vercel. Requires all external services.

```env
NODE_ENV=production
NEXT_PUBLIC_NOMINATIM_API=https://nominatim.openstreetmap.org
NEXT_PUBLIC_CARTO_API=https://cartodb-basemaps-a.global.ssl.fastly.net
NEXT_PUBLIC_DEBUG=false
```

## Configuration Priority

Environment variables are loaded in this order (later overrides earlier):

1. `.env` (if exists)
2. `.env.[NODE_ENV]` (e.g., `.env.production`)
3. `.env.local` (git-ignored)
4. System environment variables

## Using Config in Code

**Type-safe approach** (recommended):

```typescript
import { config } from '@/lib/config';

// In server-side code
const apiUrl = config.geocoding.apiUrl;

// Check feature flags
if (config.features.photosEnabled) {
  // Show photo upload
}

// Check environment
if (config.env.isDevelopment) {
  console.log('Debug info');
}
```

**Direct environment access** (avoid if possible):

```typescript
// Less type-safe, use config instead
const apiUrl = process.env.NEXT_PUBLIC_NOMINATIM_API;
```

## Deployment

### Vercel Deployment

Vercel automatically sets:
- `NODE_ENV` (production/preview/development)
- `VERCEL_ENV`
- `VERCEL_URL`

Add other variables in Vercel dashboard:

1. Go to Project Settings → Environment Variables
2. Add `NEXT_PUBLIC_NOMINATIM_API`
3. Add `NEXT_PUBLIC_CARTO_API`
4. Set to same values as production (or customize)

### Docker Deployment

Pass environment variables at runtime:

```bash
docker run \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_NOMINATIM_API=https://nominatim.openstreetmap.org \
  -e NEXT_PUBLIC_CARTO_API=https://cartodb-basemaps-a.global.ssl.fastly.net \
  whisker-watch:latest
```

### CI/CD (GitHub Actions)

Set in GitHub Secrets, then use in workflows:

```yaml
env:
  NODE_ENV: production
  NEXT_PUBLIC_NOMINATIM_API: ${{ secrets.NOMINATIM_API }}
```

## External Services

### Nominatim (OpenStreetMap)

**What it does:**
- Searches for addresses
- Converts addresses to lat/lon
- Reverse geocoding (lat/lon to address)

**Cost**: Free (public service)

**Rate limits**: ~1 request/second per IP

**Compliance**: Requires attribution (app includes it)

**Self-hosting**: https://nominatim.org/release-docs/latest/admin/Installation/

### CARTO (Map Tiles)

**What it does:**
- Provides base map tiles
- Satellite/aerial imagery (optional)

**Cost**: Free tier available

**Rate limits**: 75,000 requests/month

**Attribution**: Required (included in map)

**Alternatives:**
- MapBox (paid, higher tier)
- Stamen (attribution required)
- USGS (US only)

## Adding New Configuration

1. Add variable to `.env.example` with documentation
2. Add to `.env.development` with sensible default
3. Add to `lib/config.ts` with type and description
4. Use `config.variable` in code (not `process.env`)

Example:

```typescript
// In lib/config.ts
export const config = {
  myFeature: {
    enabled: process.env.NEXT_PUBLIC_MY_FEATURE === 'true',
    apiUrl: process.env.NEXT_PUBLIC_MY_API_URL || 'https://...',
  },
};

// In component
import { config } from '@/lib/config';

if (config.myFeature.enabled) {
  // Feature logic
}
```

## Troubleshooting

### "Cannot find module" errors in `.env` files

Next.js needs to restart to pick up new variables:
```bash
npm run dev  # Stop (Ctrl+C) and restart
```

### Environment variables undefined in client

Ensure variables start with `NEXT_PUBLIC_`:
```env
NEXT_PUBLIC_MY_VAR=value  # ✅ Available on client
MY_SECRET=value           # ❌ Server-only, not available on client
```

### API calls fail with 404

Check that API URLs are correct:
```bash
curl https://nominatim.openstreetmap.org/search?q=london
```

### Rate limiting errors

If you see "429 Too Many Requests":
1. Check request frequency
2. Implement request caching
3. Use self-hosted Nominatim instance

## Security Best Practices

1. **Never commit secrets** - Use `.env.local` and `.gitignore`
2. **Public keys only** - All `NEXT_PUBLIC_*` variables appear in client code
3. **Rotate tokens** - If using API tokens, rotate them regularly
4. **Validate config** - Call `validateConfig()` at app start
5. **Log safely** - Only log non-sensitive information

## References

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Nominatim API](https://nominatim.org/release-docs/latest/api/Overview/)
- [CARTO Basemaps](https://carto.com/basemaps/)
- [Node.js process.env](https://nodejs.org/en/docs/guides/nodejs-environment-variables/)
