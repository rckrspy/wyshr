# Way-Share Deployment Guide

## Overview

This guide covers all deployment options for the Way-Share application, from development setup to production deployment with Docker, cloud platforms, and manual server setups.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Development Environment](#development-environment)
3. [Production Deployment](#production-deployment)
4. [Cloud Platform Deployment](#cloud-platform-deployment)
5. [Manual Server Deployment](#manual-server-deployment)
6. [Environment Configuration](#environment-configuration)
7. [Database Setup](#database-setup)
8. [SSL and Security](#ssl-and-security)
9. [Monitoring and Maintenance](#monitoring-and-maintenance)
10. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites
- **Node.js**: 18+ LTS
- **Docker**: 20.10+ with Docker Compose
- **Git**: For cloning the repository
- **Mapbox Account**: For map functionality (free tier available)

### 5-Minute Setup
```bash
# Clone repository
git clone https://github.com/your-org/way-share.git
cd way-share

# Copy environment files
cp way-share-backend/.env.example way-share-backend/.env
cp way-share-frontend/.env.example way-share-frontend/.env

# Add your Mapbox token to frontend .env
echo "VITE_MAPBOX_TOKEN=your_mapbox_token_here" >> way-share-frontend/.env

# Start with Docker Compose
docker-compose up -d

# Verify deployment
curl http://localhost:3001/health
```

**Access Points:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Database: localhost:5432 (internal to Docker)

---

## Development Environment

### Method 1: Docker Compose (Recommended)

#### Full Development Stack
```bash
# Start all services (database, backend, frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps

# Stop services
docker-compose down
```

#### Individual Service Management
```bash
# Start only database services
docker-compose up -d postgres redis

# Start backend in development mode
cd way-share-backend
npm install
npm run dev

# Start frontend in development mode
cd way-share-frontend
npm install
npm run dev
```

### Method 2: Local Development

#### Prerequisites
```bash
# Install PostgreSQL with PostGIS
# Ubuntu/Debian:
sudo apt install postgresql postgresql-contrib postgis

# macOS:
brew install postgresql postgis

# Create database
createdb wayshare_development
psql wayshare_development -c "CREATE EXTENSION postgis;"
```

#### Backend Setup
```bash
cd way-share-backend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your local database URL:
# DATABASE_URL=postgresql://postgres:password@localhost:5432/wayshare_development

# Run migrations
npm run migrate

# Start development server
npm run dev
```

#### Frontend Setup
```bash
cd way-share-frontend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Development Tools

#### Database Management
```bash
# Access database in Docker
docker exec -it wayshare-postgres-dev psql -U wayshare_dev -d wayshare_development

# Run migrations manually
docker exec wayshare-backend-dev npm run migrate

# View database logs
docker-compose logs postgres
```

#### Code Quality
```bash
# Run linting
npm run lint

# Type checking
npm run type-check

# Run tests
npm test

# Build for production
npm run build
```

---

## Production Deployment

### Method 1: Docker Compose Production

#### Environment Setup
```bash
# Create production environment file
cp .env.example .env.prod

# Edit with production values
nano .env.prod
```

**Required Environment Variables:**
```bash
# Database
DB_USER=wayshare_prod
DB_PASSWORD=secure_production_password_2024
DATABASE_URL=postgresql://wayshare_prod:secure_password@postgres:5432/wayshare_production

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_SECRET=your_production_jwt_secret_32_chars_minimum
JWT_REFRESH_SECRET=your_production_refresh_secret_32_chars

# CORS
CORS_ORIGIN=https://your-domain.com

# Redis
REDIS_PASSWORD=secure_redis_password_2024

# Stripe (for identity verification)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-app-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@your-domain.com
```

#### Production Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy with environment file
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Check deployment status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Health check
curl http://localhost:3001/health
```

#### Production Features
- **Health Checks**: Automatic service health monitoring
- **Resource Limits**: CPU and memory constraints
- **Security**: Non-root containers and restricted permissions
- **Logging**: Structured logs with rotation
- **Backup**: Automated database backups before deployment

### Method 2: Kubernetes (Advanced)

#### Prerequisites
- Kubernetes cluster (GKE, EKS, AKS, or local)
- kubectl configured
- Helm 3+ (optional but recommended)

#### Kubernetes Manifests
```yaml
# Create namespace
apiVersion: v1
kind: Namespace
metadata:
  name: wayshare
---
# PostgreSQL StatefulSet
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: wayshare
spec:
  serviceName: postgres
  replicas: 1
  template:
    spec:
      containers:
      - name: postgres
        image: postgis/postgis:15-3.3
        env:
        - name: POSTGRES_DB
          value: wayshare_production
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: username
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: password
        volumeMounts:
        - name: postgres-data
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgres-data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 20Gi
```

#### Deployment Commands
```bash
# Create secrets
kubectl create secret generic database-secret \
  --from-literal=username=wayshare_prod \
  --from-literal=password=secure_password \
  -n wayshare

kubectl create secret generic app-secrets \
  --from-literal=jwt-secret=your_jwt_secret \
  --from-literal=stripe-secret=your_stripe_secret \
  -n wayshare

# Deploy applications
kubectl apply -f k8s/

# Check deployment
kubectl get pods -n wayshare
kubectl logs -f deployment/wayshare-backend -n wayshare
```

---

## Cloud Platform Deployment

### Railway (Recommended for MVP)

#### Step 1: Setup Railway Project
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and create project
railway login
railway init
```

#### Step 2: Deploy Backend
```bash
cd way-share-backend

# Link to Railway project
railway link

# Set environment variables in Railway dashboard:
# - NODE_ENV=production
# - DATABASE_URL=(from Railway PostgreSQL)
# - JWT_SECRET=your_secret
# - CORS_ORIGIN=https://your-frontend.railway.app

# Deploy
railway up
```

#### Step 3: Deploy Frontend
```bash
cd way-share-frontend

# Set environment variables:
# - VITE_API_URL=https://your-backend.railway.app/api/v1
# - VITE_MAPBOX_TOKEN=your_token

railway up
```

#### Railway Configuration
```toml
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

### Vercel + PlanetScale

#### Frontend on Vercel
```bash
# Install Vercel CLI
npm install -g vercel

cd way-share-frontend

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

#### Backend on Railway/Render
Use Railway for backend as described above, or deploy to Render:

```yaml
# render.yaml
services:
  - type: web
    name: wayshare-backend
    env: node
    buildCommand: npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: wayshare-db
          property: connectionString

databases:
  - name: wayshare-db
    databaseName: wayshare
    user: wayshare
```

### AWS Deployment

#### Using AWS App Runner
```yaml
# apprunner.yaml
version: 1.0
runtime: nodejs16
build:
  commands:
    build:
      - npm install
      - npm run build
run:
  runtime-version: 16
  command: npm start
  network:
    port: 3001
    env: PORT
  env:
    - name: NODE_ENV
      value: production
```

#### Using Elastic Beanstalk
```bash
# Install EB CLI
pip install awsebcli

# Initialize application
eb init

# Create environment
eb create production

# Deploy
eb deploy
```

### Google Cloud Platform

#### Using Cloud Run
```dockerfile
# Dockerfile (already optimized for Cloud Run)
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 8080
CMD ["npm", "start"]
```

```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT_ID/wayshare-backend
gcloud run deploy --image gcr.io/PROJECT_ID/wayshare-backend --platform managed
```

---

## Manual Server Deployment

### Ubuntu/Debian Server Setup

#### Prerequisites
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL with PostGIS
sudo apt install -y postgresql postgresql-contrib postgis

# Install Nginx
sudo apt install -y nginx

# Install PM2 for process management
sudo npm install -g pm2

# Install Docker (optional)
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
```

#### Database Setup
```bash
# Create database user
sudo -u postgres createuser wayshare --createdb --pwprompt

# Create database
sudo -u postgres createdb wayshare_production --owner wayshare

# Enable PostGIS
sudo -u postgres psql wayshare_production -c "CREATE EXTENSION postgis;"
```

#### Application Deployment
```bash
# Create application user
sudo adduser wayshare --disabled-password

# Switch to application user
sudo -u wayshare -s

# Clone repository
cd /home/wayshare
git clone https://github.com/your-org/way-share.git
cd way-share

# Backend setup
cd way-share-backend
npm install --production
npm run build

# Create environment file
cp .env.example .env
# Edit with production values

# Frontend setup
cd ../way-share-frontend
npm install
npm run build

# Copy built frontend to web directory
sudo cp -r dist/* /var/www/html/
```

#### Process Management with PM2
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'wayshare-backend',
    cwd: '/home/wayshare/way-share/way-share-backend',
    script: 'dist/index.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    error_file: '/var/log/wayshare/backend-error.log',
    out_file: '/var/log/wayshare/backend-out.log',
    log_file: '/var/log/wayshare/backend-combined.log'
  }]
};
EOF

# Create log directory
sudo mkdir -p /var/log/wayshare
sudo chown wayshare:wayshare /var/log/wayshare

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u wayshare --hp /home/wayshare
```

#### Nginx Configuration
```bash
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/wayshare << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Frontend (static files)
    location / {
        root /var/www/html;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    
    location /api/v1/reports {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3001;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/wayshare /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### SSL/TLS with Let's Encrypt
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run

# Setup auto-renewal cron job
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

---

## Environment Configuration

### Development Environment Variables

#### Backend (.env)
```bash
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://wayshare_dev:dev_password@localhost:5432/wayshare_development

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_SECRET=development-jwt-secret-change-in-production
JWT_REFRESH_SECRET=development-refresh-secret-change-in-production

# CORS
CORS_ORIGIN=http://localhost:5173

# Email (use test/dev SMTP or services like Mailtrap)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-username
SMTP_PASS=your-mailtrap-password
EMAIL_FROM=dev@wayshare.local

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Stripe (use test keys)
STRIPE_SECRET_KEY=sk_test_your_test_secret_key
STRIPE_WEBHOOK_SECRET=whsec_test_webhook_secret

# Logging
LOG_LEVEL=debug
```

#### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3001/api/v1
VITE_API_URL_V2=http://localhost:3001/api/v2
VITE_MAPBOX_TOKEN=your_mapbox_token
VITE_ENV=development

# Stripe publishable key (test)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_publishable_key
```

### Production Environment Variables

#### Backend (.env.production)
```bash
NODE_ENV=production
PORT=3001

# Database (use managed database service in production)
DATABASE_URL=postgresql://user:password@db-host:5432/wayshare_production

# JWT Secrets (MUST be strong and unique)
JWT_SECRET=your-production-jwt-secret-32-chars-minimum
JWT_REFRESH_SECRET=your-production-refresh-secret-32-chars
JWT_EXPIRES_IN=7d

# CORS (match your frontend domain exactly)
CORS_ORIGIN=https://your-domain.com

# Email (use production SMTP service)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
EMAIL_FROM=noreply@your-domain.com

# Redis (use managed Redis service)
REDIS_URL=redis://user:password@redis-host:6379

# Stripe (use live keys in production)
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_WEBHOOK_SECRET=whsec_live_webhook_secret

# AWS S3 (for media uploads - optional)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=wayshare-production-media
AWS_REGION=us-west-2

# Monitoring (optional)
SENTRY_DSN=your_sentry_dsn_url

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

#### Frontend (.env.production)
```bash
VITE_API_URL=https://api.your-domain.com/api/v1
VITE_API_URL_V2=https://api.your-domain.com/api/v2
VITE_MAPBOX_TOKEN=your_mapbox_token
VITE_ENV=production

# Stripe publishable key (live)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key

# Analytics (optional)
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

---

## Database Setup

### PostgreSQL with PostGIS

#### Local Installation
```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib postgis

# macOS
brew install postgresql postgis

# Start PostgreSQL
sudo systemctl start postgresql  # Linux
brew services start postgresql   # macOS
```

#### Database Creation
```sql
-- Connect as postgres user
sudo -u postgres psql

-- Create user
CREATE USER wayshare WITH PASSWORD 'secure_password';

-- Create database
CREATE DATABASE wayshare_production OWNER wayshare;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE wayshare_production TO wayshare;

-- Connect to database
\c wayshare_production

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Verify PostGIS installation
SELECT PostGIS_Version();
```

#### Database Migrations
```bash
# Run migrations (from backend directory)
npm run migrate

# Or manually apply migration files
psql $DATABASE_URL -f database/init.sql
psql $DATABASE_URL -f database/migrations/v2.5.0_complete_system.sql
```

### Managed Database Services

#### Railway PostgreSQL
1. Add PostgreSQL addon in Railway dashboard
2. Copy DATABASE_URL from connection tab
3. Enable PostGIS extension:
```sql
-- Connect via Railway web console or psql
CREATE EXTENSION IF NOT EXISTS postgis;
```

#### AWS RDS
```bash
# Create RDS instance with PostGIS support
aws rds create-db-instance \
    --db-instance-identifier wayshare-prod \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --engine-version 15.3 \
    --allocated-storage 20 \
    --master-username wayshare \
    --master-user-password SecurePassword123 \
    --backup-retention-period 7 \
    --storage-encrypted
```

#### Google Cloud SQL
```bash
# Create Cloud SQL instance
gcloud sql instances create wayshare-prod \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=us-central1 \
    --backup-start-time=03:00

# Create database
gcloud sql databases create wayshare --instance=wayshare-prod

# Create user
gcloud sql users create wayshare --instance=wayshare-prod --password=SecurePassword123
```

---

## SSL and Security

### SSL Certificate Setup

#### Let's Encrypt (Free)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Cloudflare (Free SSL + CDN)
1. Add your domain to Cloudflare
2. Update nameservers
3. Enable "Full (strict)" SSL mode
4. Enable "Always Use HTTPS"
5. Configure origin certificates for your server

#### Custom SSL Certificate
```bash
# Generate private key
openssl genrsa -out private.key 2048

# Generate certificate signing request
openssl req -new -key private.key -out certificate.csr

# Get certificate from CA (or use self-signed for testing)
openssl x509 -req -days 365 -in certificate.csr -signkey private.key -out certificate.crt

# Configure Nginx
sudo tee /etc/nginx/sites-available/wayshare-ssl << EOF
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    
    # ... rest of configuration
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://\$server_name\$request_uri;
}
EOF
```

### Security Best Practices

#### Environment Security
```bash
# Set proper file permissions
chmod 600 .env*
chown wayshare:wayshare .env*

# Use secrets management in production
# Never commit .env files to version control
echo "*.env*" >> .gitignore
```

#### Database Security
```sql
-- Create read-only user for analytics
CREATE USER wayshare_readonly WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE wayshare_production TO wayshare_readonly;
GRANT USAGE ON SCHEMA public TO wayshare_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO wayshare_readonly;

-- Enable SSL connections only
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_require_ssl = on;
```

#### Application Security
```bash
# Update packages regularly
npm audit
npm audit fix

# Use security headers (already in Nginx config)
# Enable rate limiting (already in Nginx config)
# Use HTTPS redirects (already in Nginx config)
```

---

## Monitoring and Maintenance

### Health Monitoring

#### Application Health Checks
```bash
# Backend health check
curl https://your-domain.com/health

# Database connectivity
curl https://your-domain.com/api/v1/heatmap/stats

# Frontend availability
curl -I https://your-domain.com/
```

#### Automated Monitoring Script
```bash
#!/bin/bash
# health-monitor.sh

DOMAIN="your-domain.com"
EMAIL="admin@your-domain.com"

# Check backend health
if ! curl -f -s "https://$DOMAIN/health" > /dev/null; then
    echo "Backend health check failed" | mail -s "Way-Share Alert" $EMAIL
fi

# Check database connectivity
if ! curl -f -s "https://$DOMAIN/api/v1/heatmap/stats" > /dev/null; then
    echo "Database connectivity failed" | mail -s "Way-Share Alert" $EMAIL
fi

# Check frontend
if ! curl -f -s -I "https://$DOMAIN/" > /dev/null; then
    echo "Frontend unavailable" | mail -s "Way-Share Alert" $EMAIL
fi
```

#### Add to crontab
```bash
# Run health checks every 5 minutes
*/5 * * * * /home/wayshare/health-monitor.sh
```

### Log Management

#### Log Rotation
```bash
# Create logrotate configuration
sudo tee /etc/logrotate.d/wayshare << EOF
/var/log/wayshare/*.log {
    daily
    missingok
    rotate 14
    compress
    notifempty
    create 644 wayshare wayshare
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
```

#### Centralized Logging (Optional)
```bash
# Install and configure Fluentd for log aggregation
curl -L https://toolbelt.treasuredata.com/sh/install-ubuntu-xenial-td-agent4.sh | sh

# Configure Fluentd to forward logs to your logging service
sudo tee /etc/td-agent/td-agent.conf << EOF
<source>
  @type tail
  path /var/log/wayshare/*.log
  pos_file /var/log/td-agent/wayshare.log.pos
  tag wayshare.*
  format json
</source>

<match wayshare.**>
  @type forward
  <server>
    host your-log-server.com
    port 24224
  </server>
</match>
EOF
```

### Performance Monitoring

#### Application Metrics
```javascript
// Add to backend for custom metrics
const prometheus = require('prom-client');

// Create metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const reportSubmissions = new prometheus.Counter({
  name: 'report_submissions_total',
  help: 'Total number of reports submitted'
});

// Export metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(prometheus.register.metrics());
});
```

#### Database Performance
```sql
-- Monitor slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Monitor database connections
SELECT count(*) as connections, state 
FROM pg_stat_activity 
GROUP BY state;

-- Monitor table sizes
SELECT schemaname,tablename,
       pg_size_pretty(size) as size,
       pg_size_pretty(total_size) as total_size
FROM (
  SELECT schemaname,tablename,
         pg_relation_size(schemaname||'.'||tablename) as size,
         pg_total_relation_size(schemaname||'.'||tablename) as total_size
  FROM pg_tables WHERE schemaname='public'
) t
ORDER BY total_size DESC;
```

### Backup Strategy

#### Database Backups
```bash
#!/bin/bash
# backup-database.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/wayshare"
DB_URL="postgresql://user:pass@host:5432/wayshare_production"

mkdir -p $BACKUP_DIR

# Create database backup
pg_dump $DB_URL | gzip > $BACKUP_DIR/wayshare_$DATE.sql.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "wayshare_*.sql.gz" -mtime +7 -delete

# Upload to S3 (optional)
if [ ! -z "$AWS_S3_BUCKET" ]; then
    aws s3 cp $BACKUP_DIR/wayshare_$DATE.sql.gz s3://$AWS_S3_BUCKET/backups/
fi
```

#### Automated Backups
```bash
# Add to crontab for daily backups at 2 AM
0 2 * * * /home/wayshare/backup-database.sh
```

#### Application Backups
```bash
#!/bin/bash
# backup-application.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/wayshare"
APP_DIR="/home/wayshare/way-share"

mkdir -p $BACKUP_DIR

# Backup application code and configuration
tar -czf $BACKUP_DIR/wayshare_app_$DATE.tar.gz \
    --exclude=node_modules \
    --exclude=dist \
    --exclude=.git \
    $APP_DIR

# Keep only last 3 application backups
find $BACKUP_DIR -name "wayshare_app_*.tar.gz" -mtime +3 -delete
```

---

## Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check connection from application server
telnet db-host 5432

# Test database connection
psql $DATABASE_URL -c "SELECT 1;"

# Check PostGIS extension
psql $DATABASE_URL -c "SELECT PostGIS_Version();"
```

#### Application Won't Start
```bash
# Check PM2 status
pm2 status

# View application logs
pm2 logs wayshare-backend

# Check for missing dependencies
cd way-share-backend
npm install

# Check environment variables
pm2 env wayshare-backend
```

#### High Memory Usage
```bash
# Check memory usage
free -h
docker stats  # if using Docker

# Monitor specific processes
top -p $(pgrep -f wayshare)

# Check for memory leaks
pm2 monit

# Restart application if needed
pm2 restart wayshare-backend
```

#### SSL Certificate Issues
```bash
# Check certificate validity
openssl x509 -in /path/to/certificate.crt -text -noout

# Test SSL connection
openssl s_client -connect your-domain.com:443

# Check certificate expiration
echo | openssl s_client -servername your-domain.com -connect your-domain.com:443 2>/dev/null | openssl x509 -noout -dates

# Renew Let's Encrypt certificate
sudo certbot renew
```

#### Performance Issues
```bash
# Check server load
uptime
htop

# Check disk usage
df -h

# Check network connectivity
ping your-domain.com
traceroute your-domain.com

# Analyze slow database queries
psql $DATABASE_URL -c "SELECT query, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 5;"
```

### Debug Commands

#### Application Debugging
```bash
# Enable debug logging
export DEBUG=wayshare:*
pm2 restart wayshare-backend

# Database query debugging
export LOG_LEVEL=debug
pm2 restart wayshare-backend

# Check API endpoints
curl -v https://your-domain.com/api/v1/heatmap/stats
```

#### Network Debugging
```bash
# Check port availability
netstat -tlnp | grep :3001
ss -tlnp | grep :3001

# Test internal connectivity
curl http://localhost:3001/health

# Check firewall rules
sudo ufw status
sudo iptables -L
```

#### Docker Debugging
```bash
# Check container status
docker-compose ps

# View container logs
docker-compose logs wayshare-backend

# Execute commands in container
docker-compose exec wayshare-backend bash

# Check container health
docker inspect wayshare-backend | grep -A 10 Health
```

### Emergency Procedures

#### Application Recovery
```bash
# Quick restart
pm2 restart all

# Rollback to previous version
cd /home/wayshare/way-share
git checkout HEAD~1
npm run build
pm2 restart wayshare-backend
```

#### Database Recovery
```bash
# Restore from backup
gunzip -c /backups/wayshare/wayshare_20250710_020000.sql.gz | psql $DATABASE_URL

# Emergency read-only mode
psql $DATABASE_URL -c "ALTER DATABASE wayshare_production SET default_transaction_read_only = on;"
```

#### Load Balancer Maintenance
```bash
# Remove server from load balancer
# Update DNS to point to backup server
# Perform maintenance
# Add server back to load balancer
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] SSL certificates valid
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Health checks working

### Deployment
- [ ] Code deployed to production branch
- [ ] Database migrations applied
- [ ] Application started successfully
- [ ] Health checks passing
- [ ] SSL/HTTPS working
- [ ] API endpoints responding

### Post-Deployment
- [ ] Frontend loading correctly
- [ ] User registration working
- [ ] Report submission working
- [ ] Map functionality working
- [ ] Email delivery working
- [ ] Error logging configured
- [ ] Performance monitoring active

### Performance Targets
- [ ] Load time < 3 seconds on 3G
- [ ] API response time < 500ms
- [ ] Database query time < 100ms
- [ ] 99.9% uptime
- [ ] < 1% error rate

---

**Deployment Guide Version**: 1.0  
**Last Updated**: July 10, 2025  
**Compatible with**: Way-Share v2.5.2+  
**Support**: For deployment issues, create an issue in the GitHub repository