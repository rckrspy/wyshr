# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Way-Share is a privacy-first Progressive Web Application for traffic incident reporting with comprehensive user authentication. The system has evolved from anonymous reporting to a full-featured platform with user accounts, identity verification, driver scoring, and rewards marketplace. It uses a dual-track reporting architecture where vehicle-specific incidents require license plates while location-based hazards do not, implemented with complete data anonymization.

## Architecture

### High-Level Structure
- **Frontend**: React 18 + TypeScript PWA with Material-UI and Redux Toolkit
- **Backend**: Node.js/Express TypeScript API with comprehensive validation and rate limiting
- **Database**: PostgreSQL 14 with PostGIS for geospatial data and privacy-preserving coordinate rounding
- **Authentication**: JWT-based authentication with refresh tokens and email verification
- **Identity Verification**: Stripe Identity integration for driver verification
- **Payment Processing**: Stripe integration for rewards marketplace
- **Deployment**: Docker containerized microservices with multi-stage builds and SSL/TLS support

### Key Architectural Patterns
- **Privacy-First Design**: SHA-256 license plate hashing, 100m location rounding, session-based anonymous tracking
- **Dual-Track Incident System**: Smart workflow adaptation based on incident type (21 types across vehicle/infrastructure categories)
- **User Authentication**: JWT-based authentication with role-based access control (User, Admin)
- **Identity Verification**: Stripe Identity integration for driver verification and scoring
- **Driver Scoring System**: Automated scoring based on incident reports with time-based recovery
- **Rewards Marketplace**: Stripe-powered rewards system with partner integrations
- **Offline-First PWA**: Service workers with background sync and local report queuing
- **Geospatial Architecture**: PostGIS with spatial indexes for heat map aggregation and privacy rounding
- **Rate Limiting**: Express rate limiting for API protection against abuse

## Development Commands

### Environment Setup
```bash
# Start development services (PostgreSQL + Redis)
docker-compose up -d

# Backend development server
cd way-share-backend && npm run dev

# Frontend development server  
cd way-share-frontend && npm run dev

# Apply database migrations
psql wayshare < database/run_migration.sql
```

### Code Quality & Building
```bash
# Build TypeScript (both frontend/backend)
npm run build

# Lint with ESLint + TypeScript rules
npm run lint

# TypeScript type checking
npm run type-check

# Run backend tests with Jest
cd way-share-backend && npm test

# Production build with optimization
npm run build --production
```

### Production Deployment
```bash
# Full production stack with health checks
docker-compose -f docker-compose.prod.yml up -d

# Check deployment health
curl http://localhost:3001/health
```

## Database Architecture

### Core Schema
- **reports**: Main table with `GEOGRAPHY(POINT, 4326)` for spatial data, optional `license_plate_hash` for infrastructure hazards
- **incident_type_metadata**: Configuration table with `requires_license_plate`, `category` (Vehicle/Infrastructure), and `subcategories` JSONB
- **Custom Types**: `incident_type` enum with 21 values across dual-track system

### Migration System
Database changes are managed through versioned SQL files in `database/migrations/`. The current schema is v2.4.0 with user authentication, identity verification, admin system, private incident management, and driver scoring. Apply migrations via `database/run_migration.sql` which includes verification queries.

### Spatial Data Handling
PostGIS functions handle coordinate rounding for privacy (`ST_SnapToGrid` to 100m) and heat map clustering (`ST_ClusterDBSCAN`). Spatial indexes use GIST for efficient geographic queries.

## Frontend Architecture

### Component Organization
- **`components/`**: Reusable UI components with Material-UI theming
- **`features/`**: Feature-specific components including multi-step report flow
- **`pages/`**: Route-level components with React Router integration
- **`store/`**: Redux Toolkit slices with RTK Query for API state management

### Key Features
- **Progressive Web App**: Workbox service workers for offline functionality and background sync
- **Incident Type Selector**: Two-track UI flow that conditionally shows/hides license plate capture
- **Heat Map**: MapLibre GL integration with real-time spatial data visualization
- **State Preservation**: Redux state maintained across navigation steps in reporting flow

## Backend Architecture

### API Structure
- **`controllers/`**: Request handlers with comprehensive input validation
- **`services/`**: Business logic including anonymization utilities and spatial data processing
- **`middleware/`**: Express middleware for validation, error handling, security headers
- **`utils/`**: Helper functions for incident type classification and license plate hashing

### Security Implementation
All license plates are immediately hashed using SHA-256 with random salt via `anonymization.ts`. Location data is rounded to 100m grid before storage. No personal information is collected or stored.

### Incident Type System
The `incidentTypeHelpers.ts` utility determines license plate requirements based on incident type. Vehicle incidents (speeding, parking violations, etc.) require plates; infrastructure hazards (potholes, debris, etc.) do not.

## Environment Configuration

### Required Environment Variables
**Backend** (`.env`):
```
NODE_ENV=development|production
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=strong-random-secret
CORS_ORIGIN=http://localhost:5173
```

**Frontend** (`.env`):
```
VITE_API_URL=http://localhost:3001/api/v1
VITE_MAPBOX_TOKEN=mapbox-token-here
VITE_ENV=development|production
```

## Development Workflow

### Adding New Incident Types
1. Update `incident_type` enum in database migration
2. Add metadata entry in `incident_type_metadata` table
3. Update TypeScript types in both `way-share-backend/src/types/index.ts` and `way-share-frontend/src/types/index.ts`
4. Update validation in `incidentTypeHelpers.ts` if license plate requirement changes
5. Add display strings and subcategories to frontend incident type selector

### Database Migrations
Create new migration files as `database/migrations/{version}_{description}.sql`. Include both forward migration and verification queries. Test migrations on development database before production deployment.

### Testing Strategy
Backend uses Jest with TypeScript. Frontend uses ESLint for code quality. Integration testing via Docker Compose environments. All code must pass TypeScript strict mode compilation.

## Privacy & Security Requirements

### Data Anonymization
- License plates must be hashed via `anonymization.ts` before any storage or logging
- Geographic coordinates must be rounded to 100m grid using PostGIS `ST_SnapToGrid`
- No user accounts, emails, or personal identifiers are collected
- Session IDs are temporary and not linked to any persistent user data

### Production Security
- All API endpoints use rate limiting and input validation
- HTTPS enforced with security headers (CSP, HSTS, etc.)
- Database runs with non-root user and restricted permissions
- Docker containers use security-hardened base images

## Security Implementation

### Authentication & Authorization
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Role-Based Access Control**: User and Admin roles with appropriate permissions
- **Email Verification**: Required for account activation and security
- **Password Security**: Argon2 hashing for secure password storage

### API Security
- **Rate Limiting**: Express rate limiting (100 requests per 15 minutes) to prevent abuse
- **Input Validation**: Comprehensive validation using express-validator
- **CORS Protection**: Configurable CORS origins for secure cross-origin requests
- **Security Headers**: Helmet.js implementation with CSP and security headers
- **SQL Injection Prevention**: Parameterized queries throughout the application

### SSL/TLS Configuration
- **HTTPS Enforced**: HTTP to HTTPS redirect in production
- **SSL Termination**: Nginx reverse proxy with SSL certificate management
- **Strong Cipher Suites**: TLS 1.2+ with secure cipher configurations
- **HSTS Headers**: HTTP Strict Transport Security for enhanced security

### Data Protection
- **License Plate Anonymization**: SHA-256 hashing with salts for privacy
- **Location Rounding**: 100m coordinate rounding for location privacy
- **Environment Variables**: Secure secret management via environment variables
- **No Hardcoded Secrets**: All sensitive data configured via environment variables

## Performance Considerations

### Database Optimization
- Spatial indexes (GIST) on location columns for fast geographic queries
- Composite indexes on `(created_at, incident_type)` for filtered heat map data
- Connection pooling configured for concurrent user load

### Frontend Performance
- Route-based code splitting with React.lazy()
- Service worker caching for offline functionality
- MapLibre GL for hardware-accelerated map rendering
- Material-UI with tree shaking to minimize bundle size

## Deployment Notes

### Docker Configuration
- Multi-stage builds optimize for development speed and production size
- Health checks configured for all services (PostgreSQL, Redis, API, frontend)
- Production configuration includes SSL termination and reverse proxy setup
- Database migrations are automatically applied via Docker initialization scripts

### Production Checklist
- Verify `VITE_MAPBOX_TOKEN` is set for map functionality
- Ensure `DATABASE_URL` points to production PostgreSQL with PostGIS
- Configure SSL certificates in `/nginx/ssl/` directory (use `nginx/generate-ssl-cert.sh` for development)
- Set strong `JWT_SECRET` for production security
- Verify `CORS_ORIGIN` matches production domain exactly
- Update `.env` files with production secrets (never commit actual secrets)
- Ensure rate limiting is properly configured
- Test SSL/TLS termination with nginx reverse proxy