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
   docker-compose up -d
   ```

4. **Install dependencies and run development servers**
   ```bash
   # Backend
   cd way-share-backend
   npm install
   npm run dev
   
   # Frontend (new terminal)
   cd way-share-frontend
   npm install
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/health

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

### ✅ Implemented (v1.1.0 Production Ready)
- **Enhanced anonymous incident reporting** with 21 incident types across two tracks:
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
- No user accounts required
- Session-based anonymous tracking
- Automatic EXIF stripping (when media upload is enabled)

### 🧪 Security Features
- HTTPS enforced in production
- Content Security Policy headers
- Rate limiting on API endpoints
- Input validation and sanitization
- Non-root container execution

## 📊 Current Status

### ✅ Production Ready (v1.1.0)
- ✅ **Enhanced incident types system** with 21 categories and dual-track reporting
- ✅ **Database migrations** applied and operational with PostgreSQL + PostGIS
- ✅ **Frontend builds successfully** with React 19 + TypeScript + Material-UI
- ✅ **Backend API** with Express + TypeScript and comprehensive validation
- ✅ **Docker deployment** optimized for production with health checks
- ✅ **Progressive Web App** functionality with offline support
- ✅ **Real-time heat map** with MapLibre GL integration
- ✅ **Privacy protection** with SHA-256 hashing and geographic rounding
- ✅ **Navigation improvements** with state preservation and accessibility

### ⚠️ Configuration Needed for Production
- Mapbox API token for map functionality
- Production database instance
- SSL certificates for HTTPS
- AWS S3 for media uploads (optional for MVP)
- Environment variables for production

## 🛠️ Development

### Running Tests
```bash
# Backend tests
cd way-share-backend
npm test

# Frontend tests
cd way-share-frontend
npm test

# Linting
npm run lint
npm run type-check
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
CORS_ORIGIN=https://your-app-name.railway.app
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
VITE_MAPBOX_TOKEN=your-mapbox-token
VITE_ENV=production

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
JWT_SECRET=your-strong-secret
CORS_ORIGIN=https://your-domain.com
```

#### Frontend (.env)
```bash
VITE_API_URL=https://api.your-domain.com/api/v1
VITE_MAPBOX_TOKEN=your-mapbox-token
VITE_ENV=production
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

### For Developers
- **[Technical Guide](docs/architecture/Way-Share-Technical-Guide.md)** - Architecture and implementation details
- **[Development Plan](docs/development/Way-Share-Development-Plan.md)** - Implementation roadmap
- **[MVP Definition](docs/Way-Share-MVP-Definition.md)** - Initial launch scope

### Deployment & Operations
- **[Deployment Issues Tracker](docs/deployment/DEPLOYMENT-ISSUES-TRACKER.md)** - Known issues and solutions
- **[Documentation Index](docs/README.md)** - Complete documentation directory

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

**Status**: Production Ready v1.1.0 - Enhanced Incident Types System  
**Last Updated**: July 8, 2025  
**Next Major Release**: Q1 2025 - Advanced Analytics & Multi-City Expansion  
Built with ❤️ for safer San Jose streets