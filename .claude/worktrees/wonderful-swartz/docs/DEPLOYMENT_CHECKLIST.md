# Deployment Checklist

Quick checklist for deploying Whisker Watch to production.

## Pre-Deployment

- [ ] All tests passing: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors: `npm run type-check`
- [ ] No lint errors: `npm run lint`
- [ ] Performance check passed: `npm run perf`
- [ ] Code reviewed and approved
- [ ] All commits pushed to remote
- [ ] PR merged or tagged for release

## Code Quality

- [ ] No console.log() statements left (except for debugging)
- [ ] No TODO comments without issues
- [ ] No hardcoded secrets/API keys
- [ ] Error handling in place
- [ ] Logging configured
- [ ] Error tracking setup (Sentry)

## Configuration

- [ ] Environment variables set in deployment platform
- [ ] API endpoints configured correctly
- [ ] Database connection strings (if applicable)
- [ ] Feature flags configured
- [ ] Cache headers configured
- [ ] CORS settings configured

## Security

- [ ] HTTPS/SSL enabled
- [ ] Environment variables not in .env file (git-ignored)
- [ ] Secret keys rotated
- [ ] Security headers configured
- [ ] Rate limiting configured (if needed)
- [ ] Input validation in place
- [ ] SQL injection prevention (if applicable)
- [ ] XSS protection enabled
- [ ] CSRF tokens configured (if needed)

## Performance

- [ ] Bundle size acceptable (<200 kB)
- [ ] Lighthouse score ≥75% performance
- [ ] Core Web Vitals passing
- [ ] Images optimized
- [ ] Code splitting configured
- [ ] CDN configured
- [ ] Caching headers set

## Monitoring & Logging

- [ ] Error tracking (Sentry) configured
- [ ] Logging service configured
- [ ] Performance monitoring enabled
- [ ] Uptime monitoring setup
- [ ] Alerts configured
- [ ] Dashboard created

## Backup & Recovery

- [ ] Backup procedure documented
- [ ] Rollback procedure tested
- [ ] Disaster recovery plan in place
- [ ] Database backups automated (if applicable)

## Deployment Platform Setup

### Vercel

- [ ] GitHub repository connected
- [ ] Environment variables added
- [ ] Custom domain configured (if applicable)
- [ ] Auto-deployment enabled
- [ ] Preview deployments working
- [ ] Production deployment successful
- [ ] Analytics enabled

### Docker

- [ ] Dockerfile created and tested
- [ ] docker-compose.yml configured
- [ ] Image builds successfully
- [ ] Container runs correctly
- [ ] Health checks passing
- [ ] Volumes configured (if needed)
- [ ] Environment variables passed correctly

### Cloud Platform (AWS/GCP/DigitalOcean)

- [ ] Account setup complete
- [ ] IAM roles/permissions configured
- [ ] Networking configured (security groups, VPC)
- [ ] Load balancer configured
- [ ] Auto-scaling configured
- [ ] Monitoring dashboard created

## Testing

- [ ] Smoke test completed
- [ ] Load test completed (if applicable)
- [ ] Cross-browser testing done
- [ ] Mobile responsiveness verified
- [ ] Accessibility testing passed
- [ ] Incident data integrity verified
- [ ] User authentication working (if applicable)
- [ ] External API integrations working

## Documentation

- [ ] README.md updated
- [ ] Deployment guide updated
- [ ] API documentation updated (if applicable)
- [ ] Release notes written
- [ ] Team notified

## Post-Deployment

- [ ] Production deployment verified
- [ ] Health checks passing
- [ ] Error tracking receiving data
- [ ] Monitoring alerts working
- [ ] Performance baseline established
- [ ] User feedback monitored
- [ ] Issues logged and triaged

## Rollback Plan

If issues arise:

1. [ ] Identify issue severity
2. [ ] Assess rollback risk
3. [ ] Execute rollback procedure
4. [ ] Verify rollback successful
5. [ ] Root cause analysis
6. [ ] Fix and test locally
7. [ ] Deploy again

---

## Deployment Commands

### Vercel

```bash
# First deployment
npm install -g vercel
vercel login
vercel --prod

# Subsequent deployments (automatic on push)
git push main

# View deployments
vercel deployments

# Rollback
vercel promote <deployment-url>
```

### Docker

```bash
# Build
docker build -t whisker-watch:latest .

# Run
docker run -p 3000:3000 whisker-watch:latest

# Or with compose
docker-compose up -d
docker-compose down

# Push to registry
docker tag whisker-watch:latest username/whisker-watch:latest
docker push username/whisker-watch:latest
```

### Git

```bash
# Create release tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# View tags
git tag -l

# Delete tag (if needed)
git tag -d v1.0.0
git push origin :v1.0.0
```

---

## Environment Variables Checklist

### Required for All Deployments

- [ ] `NODE_ENV=production`
- [ ] `NEXT_PUBLIC_NOMINATIM_API` - Geocoding API
- [ ] `NEXT_PUBLIC_CARTO_API` - Map tiles API

### Optional

- [ ] `NEXT_PUBLIC_DEBUG=false` - Debug mode
- [ ] `NEXT_PUBLIC_GA_ID` - Google Analytics
- [ ] `NEXT_PUBLIC_SENTRY_DSN` - Error tracking

### Never Committed (Use platform secrets)

- [ ] `SENTRY_AUTH_TOKEN`
- [ ] `DATABASE_URL` (when added)
- [ ] API keys
- [ ] Database passwords

---

## Common Issues & Solutions

### Build fails

```bash
# Clear build cache
rm -rf .next node_modules
npm install
npm run build
```

### Deploy fails

1. Check logs in deployment platform
2. Verify environment variables set
3. Check git history for breaking changes
4. Run locally: `npm run build && npm start`

### App runs slowly

1. Run: `npm run perf`
2. Check Lighthouse results
3. Profile with Chrome DevTools
4. Check deployment resources (CPU/memory)

### App crashes after deploy

1. Check error tracking (Sentry)
2. Review deployment logs
3. Check database connections
4. Verify environment variables
5. Execute rollback if necessary

---

## Support & Help

- Documentation: See `/docs` directory
- Performance: `docs/PERFORMANCE.md`
- Environment: `docs/ENVIRONMENT.md`
- Deployment: `docs/DEPLOYMENT.md`
- GitHub Issues: Report bugs
- GitHub Discussions: Ask questions

---

## Sign-off

- [ ] Product Owner approval
- [ ] QA sign-off
- [ ] Security review complete
- [ ] Operations team notified
- [ ] Team lead approval

**Deployed by**: ________________
**Date**: ________________
**Version**: ________________
