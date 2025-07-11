# Way-Share

A privacy-first traffic incident reporting Progressive Web Application (PWA) for San Jose. Way-Share enables anonymous reporting of traffic violations while protecting user privacy through irreversible data anonymization.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ LTS
- Docker and Docker Compose
- PostgreSQL 14+ (via Docker)
- Mapbox API token (for heat map visualization)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/way-share.git
   cd way-share
   ```

2. **Set up environment variables**
   ```bash
   # Backend
   cp way-share-backend/.env.example way-share-backend/.env
   
   # Frontend
   cp way-share-frontend/.env.example way-share-frontend/.env
   
   # Add your Mapbox token to frontend .env:
   VITE_MAPBOX_TOKEN=your_mapbox_token_here
   ```

3. **Start services with Docker Compose**
   ```bash
   # Development environment (containers handle dependencies)
   docker-compose up -d
   
   # Or use automated deployment script
   ./scripts/docker-deployment.sh development deploy
   ```

4. **Monitor deployment health**
   ```bash
   # Check all services are healthy
   ./scripts/health-check.sh
   
   # View deployment status
   ./scripts/docker-deployment.sh development status
   ```

5. **Access the application**
   - Frontend: https://localhost/ (production) or http://localhost:5173 (development)
   - Backend API: http://localhost:3001 (direct) or https://localhost/api/ (through proxy)
   - Health Check: https://localhost/health (proxied) or http://localhost:3001/health (direct)

### Production Deployment

#### Prerequisites
- Docker and Docker Compose installed
- SSL certificates configured in `nginx/ssl/`
- Environment variables configured

#### Automated Deployment (Recommended)
```bash
# Configure environment variables
cp .env.example .env
# Edit .env with your production values

# Deploy to production with health checks and backup
./scripts/docker-deployment.sh production deploy

# Monitor deployment
./scripts/docker-deployment.sh production status
./scripts/docker-deployment.sh production logs
```

#### Manual Deployment
```bash
# Configure environment variables
cp .env.example .env
# Edit .env with your production values

# Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Verify health
./scripts/health-check.sh docker-compose.prod.yml
```

#### Production Features
- **Automated backups** before deployment
- **Health checks** with automatic rollback
- **Resource limits** and monitoring
- **Security hardening** with non-root containers
- **SSL/TLS termination** with Nginx
- **Log rotation** and structured logging

### Test Accounts

For development and testing purposes, you can use these pre-configured accounts:

#### Regular User Account
- **Email**: `user@test.com`
- **Password**: `TestPass123`
- **Features**: Access to incident reporting, profile management, vehicle management

#### Admin Account
- **Email**: `admin@test.com`
- **Password**: `TestPass123`
- **Features**: Full admin dashboard, user management, incident review

#### Verified Driver Account
- **Email**: `driver@test.com`
- **Password**: `TestPass123`
- **Features**: Identity verified, driver score access, rewards marketplace

**Note**: These accounts are for development/testing only. Create new accounts for production use.

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Material-UI, Redux Toolkit, Mapbox GL
- **Backend**: Node.js, Express, TypeScript, PostgreSQL + PostGIS
- **Infrastructure**: Docker, Redis, AWS S3 (media storage)
- **PWA**: Workbox, Service Workers

### Project Structure
```
way-share/
├── way-share-frontend/     # React PWA application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── features/      # Feature-specific components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store and slices
│   │   ├── services/      # API and utility services
│   │   └── types/         # TypeScript type definitions
│   └── public/            # Static assets
├── way-share-backend/      # Node.js API server
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   └── utils/         # Utility functions
│   └── tests/             # Test files
└── database/              # Database scripts and migrations
```

## 📱 Features

### ✅ Implemented (v2.0.0 - Full Authentication System)
- **User Authentication System**
  - JWT-based authentication with refresh tokens
  - Email verification for new accounts
  - Password reset functionality
  - Secure HTTP-only cookie management
  
- **User Management Features**
  - User profiles and account management
  - Vehicle registration and verification
  - Private incident tracking and management
  - Identity verification via Stripe Identity
  
- **Driver Score System**
  - Automated scoring based on incident reports
  - Time-based score recovery
  - Milestones and achievements
  - Score breakdown and history
  
- **Rewards Marketplace**
  - Partner rewards and discounts
  - Lead generation opportunities
  - Stripe-powered secure transactions
  
- **Admin Dashboard**
  - User management and oversight
  - Vehicle verification review
  - Incident dispute resolution
  - System analytics and monitoring

- **Enhanced Incident Reporting** with 21 incident types across two tracks:
  - **Vehicle-specific incidents** (13 types): Require license plate identification
  - **Location-based hazards** (8 types): Infrastructure and road condition reports
- **Smart reporting workflow** that adapts based on incident type selection
- **Subcategory support** for detailed incident classification (47+ subcategories)
- **License plate capture** with conditional requirements based on incident type
- **Real-time heat map visualization** with MapLibre GL
- **Enhanced navigation** with back functionality and state preservation
- **Location privacy** (rounded to 100m) with geographic anonymization
- **Offline functionality** with report queue and background processing
- **PWA installable** on mobile devices with native app experience
- **Multi-step reporting flow** with comprehensive validation
- **Improved desktop UI** with proper contrast and accessibility
- **Educational content** and comprehensive FAQ

### 🔒 Privacy Protection
- Irreversible SHA-256 license plate hashing
- Location rounding to 100m radius
- Optional anonymous reporting (no account required for basic reports)
- Secure authentication with encrypted passwords
- Session-based tracking with privacy controls
- Automatic EXIF stripping (when media upload is enabled)

### 🧪 Security Features
- HTTPS enforced in production with SSL/TLS termination
- JWT authentication with secure refresh tokens
- HTTP-only cookies for enhanced security
- Argon2 password hashing
- Content Security Policy headers
- Rate limiting on API endpoints (100 requests per 15 minutes)
- Comprehensive input validation and sanitization
- SQL injection prevention with parameterized queries
- Non-root container execution
- Environment-based secret management

## 📊 Current Status

### ✅ Production Ready (v2.6.0 - CI/CD Automation Release)
- ✅ **User authentication system** with JWT tokens and secure session management
- ✅ **Enhanced incident types system** with 21 categories and dual-track reporting
- ✅ **Driver scoring system** with automated calculations and time-based recovery
- ✅ **Rewards marketplace** integrated with Stripe for secure transactions
- ✅ **Admin dashboard** for user management and incident oversight
- ✅ **Identity verification** via Stripe Identity integration
- ✅ **Database migrations** v2.5.0 applied with full schema implementation
- ✅ **Frontend builds successfully** with React 18 + TypeScript + Material-UI
- ✅ **Backend API** with Express + TypeScript and comprehensive validation
- ✅ **Docker deployment** optimized for production with health checks
- ✅ **Progressive Web App** functionality with offline support
- ✅ **Real-time heat map** with MapLibre GL integration
- ✅ **Privacy protection** with SHA-256 hashing and geographic rounding
- ✅ **Navigation improvements** with state preservation and accessibility
- ✅ **Comprehensive CI/CD pipeline** with automated testing, security scanning, and deployment
- ✅ **Production-ready automation** with Railway deployment and monitoring

### ⚠️ Configuration Needed for Production
- Mapbox API token for map functionality
- Production PostgreSQL database with PostGIS extension
- SSL certificates for HTTPS
- JWT secret key for authentication
- Stripe API keys for identity verification and payments
- SMTP configuration for email verification
- AWS S3 for media uploads (optional)
- Redis instance for caching and sessions
- Environment variables for production

## 🚀 CI/CD Pipeline

### ✅ Automated Deployment Pipeline
The project includes a comprehensive CI/CD pipeline that automatically handles testing, security scanning, building, and deployment:

#### **Pipeline Features:**
- 🏃 **Parallel execution** - Backend and frontend tests run simultaneously
- 🎯 **Dependency caching** - 70% faster builds with Node.js module caching
- 🔒 **Security scanning** - Trivy vulnerability scanner + npm audit
- 🐳 **Docker automation** - Multi-stage builds with GitHub registry
- ⚡ **Railway deployment** - Automated production deployment
- 📊 **Test coverage** - Codecov integration with 80% threshold
- 🔔 **Slack notifications** - Real-time deployment status updates
- ✅ **Health checks** - Automated verification and rollback

#### **Pipeline Stages:**
1. **Setup** - Parallel dependency installation with caching
2. **Test** - Backend (Jest + PostgreSQL) and Frontend (Jest + Vite) testing
3. **Security** - Trivy vulnerability scanning and npm audit
4. **Build** - Docker image creation and registry push (main branch only)
5. **Deploy** - Railway deployment with database migrations (production)
6. **Monitor** - Health checks and Slack notifications

#### **GitHub Actions Workflow:**
- **Node.js 20** with enhanced caching for optimal performance
- **PostgreSQL 14** with PostGIS for spatial testing
- **Parallel job execution** for maximum efficiency
- **Security-first approach** with comprehensive vulnerability scanning
- **Production-ready deployment** with rollback capabilities

#### **Required GitHub Secrets:**
```bash
DOCKER_USERNAME          # Docker Hub username
DOCKER_PASSWORD          # Docker Hub password/token
RAILWAY_TOKEN            # Railway API token
DATABASE_URL             # Production database URL
SLACK_WEBHOOK           # Slack notifications webhook
```

#### **Pipeline Monitoring:**
- **Build Status**: [![CI/CD Pipeline](https://github.com/rckrspy/wyshr/actions/workflows/ci.yml/badge.svg)](https://github.com/rckrspy/wyshr/actions/workflows/ci.yml)
- **Coverage Reports**: Automated via Codecov
- **Security Scans**: GitHub Security tab integration
- **Deployment Status**: Slack #deployments channel

#### **Development Workflow:**
1. **Feature Development** - Create feature branch
2. **Pull Request** - Triggers CI pipeline (tests + security)
3. **Code Review** - Automated quality checks + human review
4. **Merge to Main** - Triggers full pipeline + deployment
5. **Production** - Automated deployment with health checks

## 🛠️ Development

### Running Tests
```bash
# Backend tests
cd way-share-backend
npm test                    # Run tests
npm run test:coverage      # Run tests with coverage
npm run test:watch         # Run tests in watch mode

# Frontend tests
cd way-share-frontend
npm test                    # Run tests
npm run test:coverage      # Run tests with coverage  
npm run test:watch         # Run tests in watch mode

# Code Quality
npm run lint               # ESLint code quality
npm run type-check         # TypeScript type checking

# Full CI pipeline locally
npm run lint && npm run type-check && npm test && npm run build
```

### Building for Production
```bash
# Frontend build
cd way-share-frontend
npm run build

# Backend build
cd way-share-backend
npm run build
```

## 🚢 Deployment

### Option 1: Railway (Recommended for MVP)

#### Step 1: Create Railway Project
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
railway init
```

#### Step 2: Add PostgreSQL Database
1. Go to Railway dashboard
2. Click "New Service" → "Database" → "PostgreSQL"
3. Note the DATABASE_URL from the Connect tab

#### Step 3: Configure Environment Variables
In Railway dashboard, go to Variables tab and add:
```bash
NODE_ENV=production
DATABASE_URL=postgresql://postgres:password@hostname:5432/railway
JWT_SECRET=your-strong-random-secret-here
JWT_REFRESH_SECRET=another-strong-random-secret
CORS_ORIGIN=https://your-app-name.railway.app

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@way-share.com

# Stripe Integration (optional for MVP)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

#### Step 4: Deploy Backend
```bash
# In way-share-backend directory
railway link  # Link to your project
railway up    # Deploy backend
```

#### Step 5: Deploy Frontend
```bash
# In way-share-frontend directory
# First, set frontend environment variables in Railway:
VITE_API_URL=https://your-backend.railway.app/api/v1
VITE_API_URL_V2=https://your-backend.railway.app/api/v2
VITE_MAPBOX_TOKEN=your-mapbox-token
VITE_ENV=production
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

railway up    # Deploy frontend
```

### Option 2: Digital Ocean App Platform

#### Step 1: Prepare Repository
1. Push code to GitHub repository
2. Ensure environment files are configured

#### Step 2: Create App
1. Go to Digital Ocean Dashboard
2. Create New App → GitHub
3. Select your repository

#### Step 3: Configure Services
**Backend Service:**
- Name: `way-share-backend`
- Source Directory: `/way-share-backend`
- Build Command: `npm run build`
- Run Command: `npm start`
- HTTP Port: `3001`

**Frontend Service:**
- Name: `way-share-frontend`
- Source Directory: `/way-share-frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

#### Step 4: Add Database
1. Add PostgreSQL database addon
2. Note connection details

#### Step 5: Configure Environment Variables
Set in App Platform dashboard for each service.

### Option 3: Docker Compose Production

#### Prerequisites
- Docker and Docker Compose installed
- Domain pointed to server
- SSL certificates (Let's Encrypt recommended)

#### Step 1: Prepare Environment
```bash
# Create production environment files
cp way-share-backend/.env.production way-share-backend/.env
cp way-share-frontend/.env.production way-share-frontend/.env

# Edit environment files with your values
```

#### Step 2: Deploy with Docker Compose
```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Verify health
curl http://localhost:3001/health
```

#### Step 3: Setup Reverse Proxy (Nginx)
Create `/etc/nginx/sites-available/wayshare`:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Step 4: Enable SSL
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Environment Variables

#### Backend (.env)
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-strong-random-secret-here
JWT_REFRESH_SECRET=another-strong-random-secret
CORS_ORIGIN=https://your-domain.com

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@way-share.com

# Stripe Integration
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Redis (optional, defaults to local)
REDIS_URL=redis://localhost:6379

# AWS S3 (optional)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BUCKET_NAME=way-share-media
AWS_REGION=us-west-2
```

#### Frontend (.env)
```bash
VITE_API_URL=https://api.your-domain.com/api/v1
VITE_API_URL_V2=https://api.your-domain.com/api/v2
VITE_MAPBOX_TOKEN=your-mapbox-token
VITE_ENV=production

# Stripe Publishable Key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
```

### Post-Deployment Verification

#### Step 1: Health Check
```bash
# Check backend health
curl https://your-api-domain.com/health

# Expected response:
{
  "success": true,
  "message": "Way-Share API is running",
  "timestamp": "2025-07-08T...",
  "database": {
    "status": "healthy",
    "timestamp": "2025-07-08T..."
  }
}
```

#### Step 2: Test API Endpoints
```bash
# Test report submission
curl -X POST https://your-api-domain.com/api/v1/reports \
  -H "Content-Type: application/json" \
  -d '{
    "licensePlate": "TEST123",
    "incidentType": "speeding",
    "location": {"lat": 37.3382, "lng": -121.8863},
    "description": "Test report"
  }'

# Test heatmap data
curl https://your-api-domain.com/api/v1/heatmap/data
```

#### Step 3: Frontend Verification
1. Visit your frontend URL
2. Check PWA install prompt appears
3. Test report submission flow
4. Verify map loads with Mapbox
5. Test offline functionality

### Troubleshooting

#### Docker Deployment Issues

**Services Won't Start**
```bash
# Check service logs
./scripts/docker-deployment.sh development logs

# Check individual service health
docker-compose ps
docker-compose logs [service-name]

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**Health Checks Failing**
```bash
# Run detailed health checks
./scripts/health-check.sh test

# Check specific service health
docker inspect --format='{{.State.Health.Status}}' [container-name]

# View health check logs
docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' [container-name]
```

**Database Connection Issues**
```bash
# Check database connectivity
docker exec wayshare-postgres-dev pg_isready -U wayshare_dev

# Test database connection from backend
docker exec wayshare-backend-dev node -e "const db = require('./dist/services/database'); db.testConnection();"

# Add PostGIS extension manually if needed
docker exec wayshare-postgres-dev psql -U wayshare_dev -d wayshare_development -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

#### Common Issues

**Database Connection Failed**
```bash
# Check DATABASE_URL format
# Correct: postgresql://user:pass@host:5432/dbname
# Add PostGIS extension manually if needed:
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

**CORS Errors**
```bash
# Ensure CORS_ORIGIN matches frontend domain exactly
# Include protocol: https://your-domain.com (not just your-domain.com)
```

**Map Not Loading**
- Verify VITE_MAPBOX_TOKEN is set correctly
- Check browser console for Mapbox errors
- Ensure Mapbox token has web permissions

**Build Failures**
```bash
# Clear caches and rebuild
npm run build --verbose
# Check for TypeScript errors
npm run type-check
```

**SSL Certificate Issues**
```bash
# Check certificate status
sudo certbot certificates

# Renew if needed
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

#### Monitoring Commands
```bash
# Check application logs
docker-compose -f docker-compose.prod.yml logs -f

# Monitor resource usage
docker stats

# Check database connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"
```

## 📈 Performance Targets
- Load time: <3 seconds on 3G
- Report submission: <30 seconds
- Offline capability: Full functionality
- Accessibility: WCAG 2.1 AA compliant

## 🔮 Roadmap

### Post-MVP Features
- OCR for automatic license plate capture
- Media upload with EXIF stripping
- Advanced analytics dashboard
- Multi-city expansion
- Integration with city traffic systems

## 📚 Documentation

### For Stakeholders & Management
- **[Executive Overview](docs/WAY-SHARE-EXECUTIVE-OVERVIEW.md)** - Business strategy, market analysis, and financial projections
- **[Features & Marketing Guide](docs/WAY-SHARE-FEATURES-MARKETING.md)** - Comprehensive sales tools and marketing assets
- **[Business Strategy](docs/Way-Share-Business-Strategy.md)** - Market positioning and competitive analysis
- **[Product Specification](docs/Way-Share-Product-Specification.md)** - Complete feature requirements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🎯 Success Metrics
- 5,000 app downloads in first 3 months
- 200+ valid reports per day after month 1
- 30% weekly active users
- >85% report validation pass rate
- 99.5% uptime

## 📞 Support

- Issues: [GitHub Issues](https://github.com/your-org/way-share/issues)
- Email: support@way-share.com

---

**Status**: Production Ready v2.6.0 - CI/CD Automation & Deployment Pipeline  
**Last Updated**: July 11, 2025  
**Major Features**: Comprehensive CI/CD pipeline, automated testing, security scanning, Railway deployment  
**Repository State**: Production-deployed with full automation pipeline and monitoring  
**Recent Updates**: Enhanced GitHub Actions workflow, Docker registry integration, automated deployment  
**Pipeline Status**: [![CI/CD Pipeline](https://github.com/rckrspy/wyshr/actions/workflows/ci.yml/badge.svg)](https://github.com/rckrspy/wyshr/actions/workflows/ci.yml)  
**Next Major Release**: Q1 2026 - Advanced Analytics & Multi-City Expansion  
Built with ❤️ for safer San Jose streets