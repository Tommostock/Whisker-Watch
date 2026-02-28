#!/usr/bin/env node

/**
 * Performance Check Script
 * Cross-platform Lighthouse CI runner
 * Usage: npm run perf
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
};

const log = {
  info: (msg) => console.log(`${colors.yellow}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.yellow}${msg}${colors.reset}`),
  divider: () => console.log('═'.repeat(50)),
};

/**
 * Wait for server to be ready
 */
async function waitForServer(url, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await new Promise((resolve, reject) => {
        http.get(url, (res) => {
          if (res.statusCode < 500) resolve();
          else reject();
        }).on('error', reject);
      });
      return true;
    } catch {
      if (i < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }
  return false;
}

/**
 * Run command and capture output
 */
function run(cmd, options = {}) {
  try {
    return execSync(cmd, {
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf-8',
      ...options,
    });
  } catch (error) {
    if (!options.ignore) {
      log.error(`Command failed: ${cmd}`);
      process.exit(1);
    }
    return '';
  }
}

/**
 * Main performance check function
 */
async function performanceCheck() {
  console.log('\n');
  log.title('🚀 Whisker Watch Performance Check');
  log.divider();

  // Step 1: Build
  log.title('Step 1: Building Application');
  try {
    run('npm run build');
    const buildDir = path.join(__dirname, '..', '.next');
    const buildSize = getSizeOfDirectory(buildDir);
    log.success(`Build complete (${buildSize})`);
  } catch (error) {
    log.error('Build failed');
    process.exit(1);
  }

  // Step 2: Start server
  log.title('Step 2: Starting Production Server');
  const serverProcess = require('child_process').spawn(
    'npm',
    ['start'],
    {
      detached: true,
      stdio: 'ignore',
    }
  );

  log.info('Waiting for server to start...');
  if (!(await waitForServer('http://localhost:3000'))) {
    log.error('Server failed to start');
    process.exit(1);
  }
  log.success('Server ready on http://localhost:3000');

  // Step 3: Run Lighthouse
  log.title('Step 3: Running Lighthouse CI');
  log.info('Running 3 times for consistency...');

  try {
    run('npx lhci autorun');
    log.success('Lighthouse testing complete');
  } catch (error) {
    log.error('Lighthouse testing failed');
  }

  // Step 4: Cleanup
  log.title('Step 4: Cleanup');
  try {
    process.kill(-serverProcess.pid);
    log.success('Server stopped');
  } catch {
    // Server may have already stopped
  }

  // Summary
  log.title('📊 Performance Check Summary');
  log.divider();
  console.log(`
${colors.green}✅ Performance check complete!${colors.reset}

${colors.yellow}Next Steps:${colors.reset}
  • View Lighthouse results in the output above
  • Review the PERFORMANCE.md guide for optimization tips
  • Run this script weekly to monitor trends
  • Set up GitHub integration for persistent storage

${colors.yellow}Commands:${colors.reset}
  npm run dev          - Start development server
  npm run build        - Create production build
  npm test             - Run test suite
  npm run perf         - Run this performance check
  npm run perf:lhci    - Run Lighthouse CI only
  `);
}

/**
 * Get directory size
 */
function getSizeOfDirectory(dir) {
  const size = execSync(`du -sh "${dir}" 2>/dev/null || du -d 0 "${dir}"`, {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'ignore'],
  }).trim();
  return size.split(/\s+/)[0];
}

// Run
performanceCheck().catch((error) => {
  log.error(`Error: ${error.message}`);
  process.exit(1);
});
