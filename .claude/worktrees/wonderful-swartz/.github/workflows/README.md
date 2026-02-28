# GitHub Actions Workflows

This directory contains automated CI/CD workflows for the Whisker Watch application.

## Workflows

### 1. **ci.yml** - Continuous Integration
Runs on every push and pull request to main or feature branches.

**What it does:**
- Tests against Node.js 18.x and 20.x
- Installs dependencies
- Runs ESLint linter
- Performs TypeScript type checking
- Executes all test suites
- Builds the production bundle
- Uploads coverage reports to Codecov

**Triggers:**
- Push to `main` or `feature/nextjs-migration`
- Pull requests to `main` or `feature/nextjs-migration`

**PR Features:**
- Automatically comments on pull requests with build status
- Shows bundle size information

### 2. **performance.yml** - Performance Testing
Runs on push and weekly on Sundays for performance monitoring.

**What it does:**
- Builds the application
- Runs Lighthouse CI for performance metrics
- Analyzes bundle size
- Generates performance reports

**Triggers:**
- Push to `main` or `feature/nextjs-migration`
- Weekly schedule (Sunday 2 AM UTC)

**Metrics:**
- Performance score (target: ≥80%)
- Accessibility score (target: ≥90%)
- Best Practices score (target: ≥90%)
- SEO score (target: ≥90%)

### 3. **deploy.yml** - Production Deployment
Deploys to production when code is pushed to main.

**What it does:**
- Checks out code
- Installs dependencies
- Runs test suite
- Builds production bundle
- Deploys to Vercel
- Creates deployment status comment

**Triggers:**
- Push to `main`
- Manual trigger (workflow_dispatch)

**Requirements:**
Set these secrets in GitHub repository settings:
- `VERCEL_TOKEN` - Vercel authentication token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID

## Setup Instructions

### 1. GitHub Secrets Configuration

For deployment to work, add these secrets to your repository:

1. Go to: Settings → Secrets and variables → Actions
2. Add these secrets:
   - `VERCEL_TOKEN` - Get from [Vercel dashboard](https://vercel.com/account/tokens)
   - `VERCEL_ORG_ID` - Your organization ID from Vercel
   - `VERCEL_PROJECT_ID` - Your project ID from Vercel

### 2. Codecov Integration (Optional)

For code coverage reports:
1. Visit [codecov.io](https://codecov.io)
2. Connect your GitHub account
3. Enable coverage for this repository

### 3. Vercel Integration (Optional)

For automatic deployment to Vercel:
1. Create a Vercel account at [vercel.com](https://vercel.com)
2. Create a new project
3. Get your tokens from the dashboard
4. Add them as repository secrets

## Environment Files

Create `.env.local` for development (not committed):

```env
# Add any environment-specific variables here
```

## Test Coverage

The CI pipeline runs tests with the following configuration:
- Jest with jsdom environment
- Coverage reports generated
- Minimum coverage thresholds can be set in `jest.config.js`

## Build Optimization

Current bundle sizes:
- Main App: 106 kB (First Load JS)
- Static routes are prerendered
- Code splitting is automatic with Next.js

## Performance Targets

Based on Lighthouse recommendations:
- **Performance**: ≥80%
- **Accessibility**: ≥90%
- **Best Practices**: ≥90%
- **SEO**: ≥90%

## Troubleshooting

### Build fails with "Cannot find module"
- Clear node_modules: `rm -rf node_modules package-lock.json`
- Reinstall: `npm install`

### Tests timeout
- Increase timeout in jest.config.js
- Check for infinite loops in test code

### Deployment fails
- Verify secrets are correctly set
- Check Vercel project configuration
- Review Vercel logs for specific errors

## Local Testing

Test locally before pushing:

```bash
# Run linter
npm run lint

# Type check
npm run type-check

# Run tests
npm test

# Build
npm run build

# Start production server
npm start
```

## Next Steps

1. Set up GitHub secrets for deployment
2. Connect Vercel (if using)
3. Monitor workflow runs in Actions tab
4. Review performance metrics weekly
