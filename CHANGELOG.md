# Changelog

All notable changes to the Way-Share project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-07-08

### Added

#### Enhanced Incident Types System
- **Two-track incident reporting system**:
  - Vehicle-specific incidents (require license plate): 13 types
  - Location-based hazards (no license plate required): 8 types
- **New incident types**:
  - Vehicle: Parking violations, unsecured loads, littering, failure to signal, impaired driving, reckless driving
  - Location: Rock chips, potholes, debris in road, road surface issues, traffic signal problems, dangerous road conditions, dead animals, fallen obstacles
- **Subcategory support** for detailed incident classification
- **New incident type selection flow** starting with category selection
- **API endpoints** for incident type metadata (`/api/v1/reports/incident-types`)

#### Navigation & UX Improvements
- **Back navigation** between Incident Type and Capture steps with state preservation
- **Improved desktop navigation contrast** for selected page buttons
- **License plate input preservation** across navigation steps
- **Conditional workflow** - skips license plate capture for location-based hazards

### Changed

#### Database Schema
- **Made license_plate_hash optional** in reports table for location-based hazards
- **Added subcategory field** to reports table (VARCHAR(50))
- **Extended incident_type enum** with 14 new values
- **Created incident_type_metadata table** with display names, descriptions, categories, and subcategories
- **Updated database indexes** for optimal performance with new fields

#### Backend API
- **Enhanced validation** to conditionally require license plates based on incident type
- **Updated report service** to handle optional license plates and subcategories
- **Added incident type helper utilities** for license plate requirements
- **Improved error handling** with specific validation messages

#### Frontend
- **Redesigned report flow** with incident type selection as first step
- **Updated Redux state management** to include selectedCategory and subcategory
- **Enhanced UI components** using Material-UI with proper contrast ratios
- **Improved accessibility** with better visual feedback and navigation

### Fixed
- **Navigation contrast issues** on desktop for selected page buttons
- **State preservation** when navigating between report steps
- **License plate validation** now properly conditional based on incident type
- **UI consistency** across all report flow components

### Technical Improvements
- **Database migration system** implemented for schema updates
- **Comprehensive TypeScript types** for new incident system
- **API documentation** updated for new endpoints
- **Docker deployment** optimized for production use

---

## [1.0.0] - 2025-07-07

### Added
- **Initial MVP release** of Way-Share traffic incident reporting system
- **Anonymous incident reporting** with license plate anonymization
- **Real-time heat map** visualization using MapLibre GL
- **Offline-first architecture** with Progressive Web App (PWA) capabilities
- **PostgreSQL with PostGIS** for spatial data storage
- **Redis caching** for improved performance
- **Responsive Material-UI** interface
- **Legal compliance pages** (Privacy Policy, Terms of Service, etc.)

#### Core Features
- **7 initial incident types**: Speeding, tailgating, phone use, failure to yield, illegal parking, road rage, aggressive driving
- **Photo capture** for license plates with EXIF data removal
- **Location-based reporting** with 100m privacy rounding
- **Session-based anonymization** without user accounts
- **Heat map data visualization** with time-based filtering
- **Offline report queuing** for poor connectivity scenarios

#### Technical Architecture
- **Frontend**: React 19 + TypeScript + Material-UI + Redux Toolkit
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL 14 + PostGIS for spatial data
- **Deployment**: Docker Compose with production-ready configuration
- **Privacy**: One-way hashing for license plates, geographic rounding

#### Infrastructure
- **Dockerized deployment** with multi-stage builds
- **Health checks** for all services
- **Environment-based configuration** for development/production
- **NGINX reverse proxy** for frontend serving

---

## Upgrade Instructions

### From 1.0.0 to 1.1.0

#### Database Migration
1. **Apply database migration**:
   ```bash
   docker compose exec postgres psql -U postgres -d wayshare -f /docker-entrypoint-initdb.d/migrations/001_enhanced_incident_types.sql
   ```

2. **Verify migration**:
   ```bash
   docker compose exec postgres psql -U postgres -d wayshare -c "SELECT count(*) FROM incident_type_metadata;"
   ```

#### Application Update
1. **Rebuild and deploy**:
   ```bash
   docker compose down
   docker compose up -d --build
   ```

2. **Test new features**:
   - Navigate to `/report` and verify incident type selection flow
   - Test location-based hazard reporting without license plate
   - Verify back navigation preserves state

#### Breaking Changes
- **API**: Reports now require incident type selection before license plate (affects custom integrations)
- **Database**: New required metadata table - ensure migration is applied before deployment

---

## Security Notes

### Data Privacy
- **License plates**: One-way SHA-256 hashing with random salt
- **Location data**: Rounded to nearest 100m grid for privacy
- **No personal data**: Complete anonymity maintained
- **EXIF removal**: All metadata stripped from uploaded images

### Infrastructure Security
- **Database**: Non-root user, limited permissions
- **Network**: Internal Docker network isolation
- **Secrets**: Environment-based configuration
- **HTTPS**: Production deployment with SSL termination