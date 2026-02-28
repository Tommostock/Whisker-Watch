/**
 * Next.js Configuration
 * Handles build optimization, security headers, and runtime configuration
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ═══════════════════════════════════════════════════════════════
  // Strict mode for development
  // ═══════════════════════════════════════════════════════════════
  reactStrictMode: true,

  // ═══════════════════════════════════════════════════════════════
  // Performance & Bundle Optimization
  // ═══════════════════════════════════════════════════════════════
  optimizeFonts: true,
  compress: true,
  poweredByHeader: false, // Remove X-Powered-By header
  productionBrowserSourceMaps: false, // Don't ship source maps in production

  // ═══════════════════════════════════════════════════════════════
  // Image Optimization
  // ═══════════════════════════════════════════════════════════════
  images: {
    // Allow external images from CARTO
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cartodb-basemaps-*.global.ssl.fastly.net',
      },
      {
        protocol: 'https',
        hostname: '*.basemaps.cartocdn.com',
      },
    ],
    // Optimize images
    formats: ['image/avif', 'image/webp'],
  },

  // ═══════════════════════════════════════════════════════════════
  // Headers & Security
  // ═══════════════════════════════════════════════════════════════
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Security headers
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions-Policy (replaces Feature-Policy)
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(self), microphone=(), camera=()',
          },
          // Cache headers for static assets
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
            source: '/static/:path*',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600',
            source: '/_next/static/:path*',
          },
        ],
      },
    ];
  },

  // ═══════════════════════════════════════════════════════════════
  // Redirects
  // ═══════════════════════════════════════════════════════════════
  async redirects() {
    return [
      // Redirect old documentation URLs if applicable
      // {
      //   source: '/docs/:path*',
      //   destination: '/documentation/:path*',
      //   permanent: true,
      // },
    ];
  },

  // ═══════════════════════════════════════════════════════════════
  // Environment Variables
  // ═══════════════════════════════════════════════════════════════
  env: {
    // These are available on both server and client
    // Prefer using .env files instead for better security
  },

  // ═══════════════════════════════════════════════════════════════
  // TypeScript Configuration
  // ═══════════════════════════════════════════════════════════════
  typescript: {
    // Type check during build
    tsconfigPath: './tsconfig.json',
  },

  // ═══════════════════════════════════════════════════════════════
  // Webpack Configuration (Advanced)
  // ═══════════════════════════════════════════════════════════════
  // webpack: (config, { isServer }) => {
  //   return config;
  // },

  // ═══════════════════════════════════════════════════════════════
  // Module Aliasing
  // ═══════════════════════════════════════════════════════════════
  // Handled in tsconfig.json under "paths"

  // ═══════════════════════════════════════════════════════════════
  // Experimental Features
  // ═══════════════════════════════════════════════════════════════
  experimental: {
    // Optimize CSS in production
    optimizePackageImports: ['@/components', '@/hooks', '@/lib'],
  },

  // ═══════════════════════════════════════════════════════════════
  // Build Configuration
  // ═══════════════════════════════════════════════════════════════
  outputFileTracing: true, // Optimize serverless functions
  generateBuildId: async () => {
    // Use git commit hash as build ID for better caching
    try {
      const { execSync } = require('child_process');
      const hash = execSync('git rev-parse --short HEAD', {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'],
      }).trim();
      return hash;
    } catch {
      return 'dev';
    }
  },
};

module.exports = nextConfig;
