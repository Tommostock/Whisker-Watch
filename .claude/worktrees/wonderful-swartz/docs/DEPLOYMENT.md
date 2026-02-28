# Deployment Guide

This guide covers deploying Whisker Watch to production using Vercel, Docker, or other platforms.

## Quick Start

### Vercel (Recommended)

Easiest deployment option for Next.js apps.

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (first time)
vercel

# Deploy (subsequent)
git push  # Vercel auto-deploys on push
```

### Docker

For self-hosted or cloud deployments.

```bash
# Build image
docker build -t whisker-watch:latest .

# Run container
docker run -p 3000:3000 whisker-watch:latest

# Or use docker-compose
docker-compose up --build
```

---

## Vercel Deployment

### 1. Initial Setup

**Option A: Command Line**

```bash
npm install -g vercel
vercel login  # Sign in with GitHub, GitLab, or email
vercel --prod  # Deploy to production
```

**Option B: Web Dashboard**

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select your Git repository
4. Click "Import"
5. Vercel auto-detects Next.js settings
6. Click "Deploy"

### 2. Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables:

```env
NEXT_PUBLIC_NOMINATIM_API=https://nominatim.openstreetmap.org
NEXT_PUBLIC_CARTO_API=https://cartodb-basemaps-a.global.ssl.fastly.net
NEXT_PUBLIC_DEBUG=false
```

Set to all environments (Production, Preview, Development).

### 3. Domain Configuration

In Vercel Dashboard → Settings → Domains:

```
Add domain → Enter your domain → Add DNS records
```

Or use Vercel's default `*.vercel.app` domain.

### 4. Auto-Deployment

Vercel automatically deploys:
- **Production**: On push to `main` branch
- **Preview**: On pull requests to any branch
- **Staging**: On push to `feature/*` branches (optional)

### 5. Monitoring

In Vercel Dashboard:
- **Analytics** - Performance metrics
- **Deployments** - View all deployments
- **Functions** - Edge function logs
- **Integrations** - Connected services

### 6. Rollback

To rollback to previous deployment:

1. Vercel Dashboard → Deployments
2. Find deployment to rollback to
3. Click "..." menu → "Promote to Production"

Or via CLI:
```bash
vercel --prod --target [deployment-url]
```

### 7. Troubleshooting

**Build fails:**
```bash
# Check build logs in Vercel Dashboard
# Common issues:
# - Missing environment variables
# - TypeScript errors
# - Missing dependencies
```

**Deploy fails:**
- Check GitHub Actions logs
- Verify git push succeeded
- Check Vercel deployment logs

**App runs slowly:**
- Check Performance in Vercel Analytics
- Run `npm run perf` locally
- Review Lighthouse results

---

## Docker Deployment

### 1. Build Docker Image

```bash
# Standard build
docker build -t whisker-watch:latest .

# With build args
docker build \
  --build-arg NODE_ENV=production \
  -t whisker-watch:latest .

# View image size
docker images | grep whisker-watch
```

### 2. Run Container

**Basic:**
```bash
docker run -p 3000:3000 whisker-watch:latest
```

**With environment variables:**
```bash
docker run \
  -p 3000:3000 \
  -e NEXT_PUBLIC_NOMINATIM_API=https://nominatim.openstreetmap.org \
  -e NEXT_PUBLIC_CARTO_API=https://cartodb-basemaps-a.global.ssl.fastly.net \
  -e NEXT_PUBLIC_DEBUG=false \
  whisker-watch:latest
```

**With docker-compose:**
```bash
docker-compose up -d
docker-compose logs -f app
docker-compose down
```

### 3. Docker Registry

Push to Docker Hub, AWS ECR, or other registries:

```bash
# Docker Hub
docker tag whisker-watch:latest YOUR_USERNAME/whisker-watch:latest
docker push YOUR_USERNAME/whisker-watch:latest

# AWS ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker tag whisker-watch:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/whisker-watch:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/whisker-watch:latest
```

### 4. Cloud Deployment

#### AWS ECS

```bash
# Create task definition
aws ecs register-task-definition \
  --family whisker-watch \
  --container-definitions file://task-definition.json

# Create service
aws ecs create-service \
  --cluster production \
  --service-name whisker-watch \
  --task-definition whisker-watch
```

#### Google Cloud Run

```bash
gcloud run deploy whisker-watch \
  --image gcr.io/PROJECT_ID/whisker-watch \
  --platform managed \
  --region us-central1 \
  --port 3000
```

#### DigitalOcean App Platform

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click "Create App"
3. Select GitHub repository
4. Configure environment variables
5. Deploy

### 5. Kubernetes Deployment

```bash
# Create deployment
kubectl create deployment whisker-watch \
  --image=whisker-watch:latest \
  --replicas=3

# Expose service
kubectl expose deployment whisker-watch \
  --port=80 \
  --target-port=3000 \
  --type=LoadBalancer

# Check status
kubectl get pods
kubectl get svc whisker-watch
```

---

## Environment-Specific Configuration

### Development

Deploy preview builds to test changes:

```bash
# Vercel auto-creates preview for each PR
# Docker: Use docker-compose.dev.yml with hot-reload
```

### Staging

Run production build in staging environment:

```bash
# Vercel: Deploy to staging environment
vercel deploy --prebuilt

# Docker: Run with production settings
docker run -e NODE_ENV=staging whisker-watch:latest
```

### Production

Full production deployment with monitoring:

```bash
# Vercel: Deploy to production
git push main

# Docker: Full stack with monitoring
docker-compose -f docker-compose.prod.yml up -d
```

---

## Security

### 1. Environment Variables

**Never commit secrets!**

```bash
# ✅ Good
NEXT_PUBLIC_API_URL=https://api.example.com  # Public

# ❌ Bad
DATABASE_PASSWORD=secret123  # Private, use .env.local
```

### 2. Secrets Management

**Vercel:**
- Use Vercel Dashboard → Environment Variables
- Can be marked as "Sensitive" to hide from logs

**Docker:**
- Use Docker Secrets (Swarm mode)
- Or environment files: `--env-file .env.production`
- Never build secrets into image

**Best practices:**
- Rotate secrets regularly
- Use short-lived tokens
- Log all access
- Monitor for unusual activity

### 3. CORS & Headers

Configured in `next.config.js`:
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

### 4. HTTPS

**Vercel:** Automatic SSL/TLS with custom domains

**Docker:** Use reverse proxy (nginx, Caddy, traefik)

```nginx
server {
    listen 443 ssl http2;
    server_name whisker-watch.example.com;

    ssl_certificate /etc/letsencrypt/live/whisker-watch.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/whisker-watch.example.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
    }
}
```

---

## Performance Optimization

### 1. Caching

**Next.js automatic caching:**
- Static pages: Cached indefinitely
- Dynamic pages: Cached with revalidation

**Custom headers in Vercel:**
```json
{
  "headers": [
    {
      "source": "/static/:path*",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "max-age=31536000"
        }
      ]
    }
  ]
}
```

### 2. CDN

**Vercel:**
- Automatic global CDN
- No configuration needed

**Docker:**
- Use Cloudflare, AWS CloudFront, or Fastly
- Cache static assets at edge

### 3. Database (Future)

When you add a database:

**Vercel Postgres:**
```bash
vercel env add POSTGRES_URL
```

**Docker:**
```yaml
postgres:
  image: postgres:15-alpine
  environment:
    POSTGRES_DB: whisker_watch
    POSTGRES_PASSWORD: ${DB_PASSWORD}
  volumes:
    - db_data:/var/lib/postgresql/data
```

---

## Monitoring & Logging

### Vercel

- **Real-time logs**: Vercel Dashboard → Deployments → Logs
- **Edge function logs**: Vercel Dashboard → Functions
- **Performance monitoring**: Vercel Analytics

### Docker

```bash
# View logs
docker logs -f container_id

# Kubernetes
kubectl logs -f deployment/whisker-watch

# Send logs to service
docker run \
  -v /var/run/docker.sock:/var/run/docker.sock \
  gianarb/sysdig-inspect
```

### Error Tracking

Set up Sentry:

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

---

## Scaling

### Vertical Scaling

Increase instance size (CPU/RAM):

**Vercel:**
- Automatically scales based on usage
- No configuration needed

**Docker:**
- Larger instance type in cloud provider
- More resources allocated

### Horizontal Scaling

Run multiple instances:

**Vercel:**
- Automatic load balancing
- No configuration needed

**Docker:**
```bash
# Kubernetes
kubectl scale deployment whisker-watch --replicas=5

# Docker Swarm
docker service scale whisker-watch=5
```

---

## Backup & Disaster Recovery

### Code

Repository is backup (GitHub)

```bash
git push  # Always push changes
git tag v1.0.0  # Tag releases
```

### Data

localStorage is on user's device - no server backup needed

For future when database is added:
```bash
# Automated backups
pg_dump whisker_watch > backup.sql

# Cloud backups
# Vercel Postgres: Automatic daily backups
# AWS RDS: Automated snapshots
```

---

## Rollback Procedures

### Vercel

```bash
# View deployment history
vercel deployments

# Promote previous deployment
vercel promote <deployment-url>
```

### Docker

```bash
# Keep previous images
docker tag whisker-watch:latest whisker-watch:v1.0.0
docker push whisker-watch:v1.0.0

# Rollback
docker run -p 3000:3000 whisker-watch:v1.0.0

# Kubernetes
kubectl rollout history deployment/whisker-watch
kubectl rollout undo deployment/whisker-watch
```

---

## References

- [Next.js Deployment](https://nextjs.org/docs/deployment/vercel)
- [Vercel Documentation](https://vercel.com/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Kubernetes](https://kubernetes.io/)
- [Let's Encrypt (HTTPS)](https://letsencrypt.org/)
