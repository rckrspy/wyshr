# Way-Share MVP Definition

## MVP Goal Statement
The goal of the Way-Share MVP is to launch in San Jose, CA, to validate our core hypothesis: that the public will actively report traffic incidents if given a simple, fast, and anonymous tool. Success will be measured by user adoption, reporting frequency, and our ability to generate a meaningful Civic Heat Map that demonstrates clear value to both the community and potential municipal partners.

## Success Metrics (KPIs)

### Primary Metrics
- **Adoption**: 5,000 downloads in the first 3 months
- **Engagement**: Average of 200+ valid reports per day after the first month
- **Data Density**: Sufficient data points to show clear, meaningful patterns on the San Jose heat map
- **User Retention**: 30% weekly active users from total downloads
- **Report Quality**: >85% of reports pass basic validation

### Technical Metrics
- **App Performance**: <3 second load time on 3G
- **Report Submission**: <30 seconds average completion time
- **Uptime**: 99.5% availability
- **Error Rate**: <1% of requests fail

## Explicit Scope Definition

### ✅ IN SCOPE FOR MVP
- Anonymous incident reporting
- License plate entry (OCR + manual)
- Incident type selection (7 core types)
- Optional media upload (photo/video)
- GPS location capture
- Civic Heat Map visualization
- About/FAQ section
- Basic PWA functionality (offline, install prompt)
- Data anonymization for non-verified users
- Simple contribution tracker

### ❌ OUT OF SCOPE FOR MVP
- User accounts, registration, or login
- Email/phone verification
- Verified Owner features
- Driver scores
- Incident notifications
- Dispute management
- Fleet Management features
- Insurance partnerships
- Monetization features
- Advanced analytics
- Multi-city support
- API access
- Admin dashboard

## MVP Feature Specifications

### 1. Anonymous Reporting Flow

#### License Plate Capture
- **OCR Implementation**: 
  - Camera interface with overlay guides
  - Real-time character recognition
  - Confidence scoring (>80% required)
  - Manual entry fallback
- **State Selection**:
  - Dropdown with US states
  - Smart default (California for San Jose)
  - Recent states quick-select
- **Validation**:
  - Format checking (alphanumeric, length)
  - Real-time feedback

#### Incident Type Selection
```typescript
enum MVPIncidentTypes {
  SPEEDING = 'speeding',
  TAILGATING = 'tailgating', 
  PHONE_USE = 'phone_use',
  FAILURE_TO_YIELD = 'failure_to_yield',
  ILLEGAL_PARKING = 'illegal_parking',
  ROAD_RAGE = 'road_rage',
  AGGRESSIVE_DRIVING = 'aggressive_driving'
}
```
- Icon-based grid layout
- Single selection required
- Clear visual feedback

#### Media Upload (Optional)
- **Photo Capture**: Direct camera or gallery
- **Video Recording**: 15-second maximum
- **Compression**: Client-side optimization
- **Upload**: Direct to S3 with presigned URLs
- **Privacy**: Automatic EXIF stripping

#### Location Services
- **GPS**: Automatic capture with user consent
- **Manual**: Map interface for corrections
- **Privacy**: Rounded to nearest 100m
- **Fallback**: Address input if GPS unavailable

### 2. Civic Heat Map

#### Data Visualization
- **Base Map**: Mapbox or Google Maps
- **Heat Layer**: Gradient overlay showing incident density
- **Clustering**: Group nearby incidents for performance
- **Time Filters**: Last 24h, 7 days, 30 days
- **Type Filters**: Toggle incident types on/off

#### Performance Requirements
- **Initial Load**: <2 seconds for 1000 points
- **Zoom/Pan**: Smooth 60fps interactions
- **Updates**: Real-time via WebSocket (5-minute intervals)
- **Caching**: Aggressive CDN caching for static data

### 3. PWA Implementation

#### Core PWA Features
- **Service Worker**: Offline functionality
- **App Manifest**: Install prompts, icons, splash screen
- **Cache Strategy**: 
  - App shell: Cache first
  - Heat map data: Network first with fallback
  - Reports: Background sync when offline

#### Offline Capabilities
- **Queue Reports**: Store submissions locally
- **View Map**: Last cached heat map data
- **Sync**: Upload queued reports when online
- **Indicators**: Clear offline/online status

### 4. Educational Content

#### About Section
- Mission statement
- How anonymization works
- Privacy protection explanation
- Community impact examples

#### FAQ
- "How is my privacy protected?"
- "What happens to license plate data?"
- "How accurate is the heat map?"
- "Can I be identified from my reports?"

## Technical MVP Architecture

### Simplified Tech Stack
- **Frontend**: React 18 + TypeScript + MUI
- **Backend**: Node.js + Express + PostgreSQL
- **Database**: PostgreSQL with PostGIS
- **Cache**: Redis for session management
- **Storage**: AWS S3 for media
- **Hosting**: AWS ECS or Railway for simplicity

### MVP API Endpoints
```typescript
// Core endpoints only
POST /api/v1/reports          // Submit new report
GET /api/v1/heatmap          // Get heat map data  
POST /api/v1/media/upload    // Get upload URL
GET /api/v1/health           // Health check
```

### Simplified Database Schema
```sql
-- MVP reports table (no partitioning initially)
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255), -- Anonymous tracking
    plate_hash VARCHAR(64) NOT NULL, -- Always hashed
    state VARCHAR(2) NOT NULL,
    incident_type VARCHAR(50) NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    media_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Basic indexes
CREATE INDEX idx_reports_location ON reports USING GIST(location);
CREATE INDEX idx_reports_created_at ON reports(created_at);
CREATE INDEX idx_reports_type ON reports(incident_type);
```

## User Experience Flow (MVP)

### Complete Report Submission Flow
1. **App Open** → Heat map loads with San Jose data
2. **Tap "Report Incident"** → Camera opens for plate scan
3. **Scan/Enter Plate** → OCR or manual entry → Validate format
4. **Select State** → Dropdown (defaults to CA) → Confirm
5. **Choose Incident** → Icon grid → Select type → Visual confirmation
6. **Add Media** (Optional) → Camera/gallery → Compress → Upload
7. **Review** → Summary screen → Anonymization notice → Submit
8. **Success** → Thank you message → Return to map → See contribution count

### Heat Map Interaction
1. **View Map** → See San Jose with incident clusters
2. **Apply Filters** → Time range and incident type toggles
3. **Zoom/Pan** → Explore neighborhoods and hotspots
4. **Tap Cluster** → See incident breakdown without PII

## Development Timeline (12 Weeks)

### Weeks 1-2: Foundation
- Project setup and CI/CD
- Basic React app with routing
- PostgreSQL setup with PostGIS
- AWS infrastructure provisioning

### Weeks 3-4: Core Backend
- Report submission API
- Data anonymization service
- Heat map aggregation endpoint
- Media upload pipeline

### Weeks 5-6: Report Flow
- Camera interface with OCR
- Incident type selection UI
- Media capture and upload
- Form validation and error handling

### Weeks 7-8: Heat Map
- Map component integration
- Real-time data visualization
- Filtering and interaction
- Performance optimization

### Weeks 9-10: PWA Features
- Service worker implementation
- Offline functionality
- Install prompts
- Cache strategies

### Weeks 11-12: Polish & Launch
- UI/UX refinement
- Performance optimization
- Security audit
- Beta testing
- Production deployment

## MVP Success Criteria

### Launch Readiness Checklist
- [ ] App loads in <3 seconds on mobile 3G
- [ ] Report submission completes in <30 seconds
- [ ] Heat map displays real data accurately
- [ ] PWA install prompt appears correctly
- [ ] Offline mode functions properly
- [ ] No personal data leaks in reports
- [ ] App store/PWA store ready
- [ ] Basic analytics tracking active

### Post-Launch Milestones
- **Week 2**: 100 downloads, 10 reports/day
- **Week 4**: 500 downloads, 25 reports/day
- **Week 8**: 2,000 downloads, 100 reports/day
- **Week 12**: 5,000 downloads, 200 reports/day

### Pivot Triggers
If by Week 8:
- <1,000 downloads: Reconsider marketing strategy
- <25 reports/day: Simplify reporting flow further
- High churn rate (>80%): Investigate user experience issues
- Technical problems: Extend timeline for stability

## Post-MVP Roadmap Preview

### Phase 2 Features (If MVP Succeeds)
- User accounts and verification system
- Verified owner notifications
- Basic driver scores
- Insurance partnership pilot

### Growth Metrics to Unlock Phase 2
- 5,000+ active users
- 200+ daily reports
- <5% false positive rate
- Municipal interest confirmed

This MVP definition provides a focused, achievable scope that validates the core value proposition while laying the foundation for the full Way-Share platform.