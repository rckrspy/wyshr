# Way-Share Technical Implementation Guide

## Architecture Overview

### High-Level System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PWA Client    │    │   API Gateway   │    │  Microservices  │
│                 │    │                 │    │                 │
│ React/TypeScript│◄──►│ Rate Limiting   │◄──►│ Auth Service    │
│ Service Worker  │    │ Load Balancing  │    │ Report Service  │
│ Offline Cache   │    │ SSL Termination │    │ Analytics Svc   │
└─────────────────┘    └─────────────────┘    │ Media Service   │
                                              │ Notification    │
                                              └─────────────────┘
                                                       │
                                              ┌─────────────────┐
                                              │   Data Layer    │
                                              │                 │
                                              │ PostgreSQL+GIS  │
                                              │ Redis Cache     │
                                              │ S3 Media Store  │
                                              └─────────────────┘
```

### Technology Stack

#### Frontend
- **Framework**: React 18+ with TypeScript
- **State Management**: Redux Toolkit + RTK Query
- **Routing**: React Router v6
- **UI Components**: Material-UI (MUI) v5
- **PWA**: Workbox for service workers
- **Maps**: Mapbox GL JS or Google Maps API
- **Camera**: MediaStream API + OCR.js
- **Build Tool**: Vite for fast development

#### Backend
- **Runtime**: Node.js 18+ LTS
- **Framework**: Express.js with TypeScript
- **Authentication**: JWT + refresh tokens
- **Validation**: Joi or Zod for schema validation
- **Documentation**: OpenAPI/Swagger
- **Process Management**: PM2 or Docker containers

#### Database
- **Primary**: PostgreSQL 14+ with PostGIS extension
- **Cache**: Redis 7+ with persistence
- **Time Series**: TimescaleDB extension
- **Search**: Elasticsearch 8+ (optional)

#### Infrastructure
- **Cloud Provider**: AWS (primary)
- **Container Orchestration**: AWS ECS or Kubernetes
- **CDN**: Amazon CloudFront
- **Monitoring**: DataDog + AWS CloudWatch
- **CI/CD**: GitHub Actions

## Database Schema

### Core Tables
```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_status VARCHAR(50) DEFAULT 'pending',
    stripe_customer_id VARCHAR(255)
);

-- Vehicles table
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id),
    license_plate VARCHAR(20) NOT NULL,
    state VARCHAR(2) NOT NULL,
    make VARCHAR(50),
    model VARCHAR(50),
    year INTEGER,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(license_plate, state)
);

-- Reports table (partitioned by date)
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_session_id VARCHAR(255),
    plate_hash VARCHAR(64), -- SHA-256 hash for anonymized plates
    original_plate VARCHAR(20), -- Only for verified owners
    state VARCHAR(2) NOT NULL,
    incident_type VARCHAR(50) NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    location_description TEXT,
    media_url TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    is_verified_owner BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active' -- active, disputed, resolved
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE reports_2026_01 PARTITION OF reports
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

-- Disputes table
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES reports(id),
    user_id UUID REFERENCES users(id),
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

-- Driver scores table
CREATE TABLE driver_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    vehicle_id UUID REFERENCES vehicles(id),
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    calculated_at TIMESTAMP DEFAULT NOW(),
    factors JSONB -- Store score breakdown
);

-- Spatial indexes for performance
CREATE INDEX idx_reports_location ON reports USING GIST(location);
CREATE INDEX idx_reports_created_at ON reports(created_at);
CREATE INDEX idx_reports_plate_hash ON reports(plate_hash);
```

## API Specification

### Authentication
```typescript
// JWT payload structure
interface JWTPayload {
  userId: string;
  email: string;
  isVerified: boolean;
  iat: number;
  exp: number;
}

// Auth endpoints
POST /api/v1/auth/login
POST /api/v1/auth/register
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
```

### Core API Endpoints

#### Reports Management
```typescript
// Submit new report
POST /api/v1/reports
{
  "license_plate": "ABC123",
  "state": "CA",
  "incident_type": "phone_use",
  "location": {
    "lat": 37.3382,
    "lng": -121.8863
  },
  "location_description": "Highway 101 Northbound",
  "media_url": "https://cdn.wayshare.com/media/...",
  "notes": "Driver was clearly texting while driving"
}

// Get heat map data
GET /api/v1/reports/heatmap
Query params: ?ne_lat=37.4&ne_lng=-121.8&sw_lat=37.3&sw_lng=-121.9&zoom=12&hours=24

// Get user's reports (verified owners only)
GET /api/v1/reports/mine
Query params: ?limit=50&offset=0&status=active

// Dispute report
POST /api/v1/reports/:id/dispute
{
  "reason": "incorrect_location",
  "explanation": "I was not in this area at the specified time"
}
```

#### User Management
```typescript
// Start verification process
POST /api/v1/users/verify
{
  "type": "individual" | "fleet"
}

// Add vehicle
POST /api/v1/vehicles
{
  "license_plate": "ABC123",
  "state": "CA",
  "make": "Toyota",
  "model": "Camry",
  "year": 2020
}

// Get driver score
GET /api/v1/users/:id/score
```

#### Media Upload
```typescript
// Get presigned upload URL
POST /api/v1/media/upload-url
{
  "file_type": "video/mp4",
  "file_size": 5242880,
  "duration": 15
}

// Response
{
  "upload_url": "https://s3.amazonaws.com/...",
  "media_id": "uuid",
  "expires_at": "2026-01-01T12:00:00Z"
}
```

## Data Privacy & Security

### Anonymization Protocol
```typescript
class AnonymizationService {
  private readonly SALT = process.env.ANONYMIZATION_SALT;
  
  async processReport(report: IncomingReport): Promise<ProcessedReport> {
    // Check if license plate belongs to verified owner
    const vehicle = await this.vehicleService.findByPlate(
      report.license_plate, 
      report.state
    );
    
    if (!vehicle?.is_verified) {
      // Immediate, irreversible anonymization
      report.plate_hash = this.hashPlate(report.license_plate);
      delete report.license_plate;
      report.is_verified_owner = false;
    } else {
      // Store for verified owner, but still hash for analytics
      report.plate_hash = this.hashPlate(report.license_plate);
      report.is_verified_owner = true;
    }
    
    // Strip EXIF data from media
    if (report.media_url) {
      await this.stripMediaMetadata(report.media_url);
    }
    
    return report;
  }
  
  private hashPlate(plate: string): string {
    return crypto
      .createHash('sha256')
      .update(plate + this.SALT)
      .digest('hex');
  }
  
  private async stripMediaMetadata(mediaUrl: string): Promise<void> {
    // Remove EXIF data, GPS coordinates, device info
    const media = await this.s3.getObject(mediaUrl);
    const stripped = await this.exifRemover.process(media);
    await this.s3.putObject(mediaUrl, stripped);
  }
}
```

### Encryption Implementation
```typescript
// Encryption service for sensitive data
class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyDerivation = 'pbkdf2';
  
  encrypt(data: string): EncryptedData {
    const iv = crypto.randomBytes(16);
    const salt = crypto.randomBytes(32);
    const key = crypto.pbkdf2Sync(process.env.ENCRYPTION_KEY, salt, 10000, 32, 'sha256');
    
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    
    return {
      encrypted: encrypted.toString('hex'),
      iv: iv.toString('hex'),
      salt: salt.toString('hex'),
      tag: tag.toString('hex')
    };
  }
  
  decrypt(encryptedData: EncryptedData): string {
    const key = crypto.pbkdf2Sync(
      process.env.ENCRYPTION_KEY, 
      Buffer.from(encryptedData.salt, 'hex'), 
      10000, 32, 'sha256'
    );
    
    const decipher = crypto.createDecipheriv(
      this.algorithm, 
      key, 
      Buffer.from(encryptedData.iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
    
    return decipher.update(encryptedData.encrypted, 'hex', 'utf8') + decipher.final('utf8');
  }
}
```

## Performance Optimization

### Database Optimization
```sql
-- Indexes for common queries
CREATE INDEX CONCURRENTLY idx_reports_location_time 
ON reports USING GIST(location, created_at);

CREATE INDEX CONCURRENTLY idx_reports_type_time 
ON reports(incident_type, created_at);

-- Materialized view for heat map data
CREATE MATERIALIZED VIEW heat_map_cache AS
SELECT 
    ST_SnapToGrid(location, 0.001) as grid_location,
    incident_type,
    COUNT(*) as incident_count,
    EXTRACT(EPOCH FROM MAX(created_at)) as last_updated
FROM reports 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY ST_SnapToGrid(location, 0.001), incident_type;

-- Refresh every 5 minutes
CREATE OR REPLACE FUNCTION refresh_heat_map_cache()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY heat_map_cache;
END;
$$ LANGUAGE plpgsql;
```

### Caching Strategy
```typescript
// Multi-layer caching
class CacheService {
  private l1Cache = new NodeCache({ ttl: 60 }); // In-memory
  private l2Cache = new Redis(); // Redis cluster
  private l3Cache = new CloudFront(); // CDN
  
  async get(key: string): Promise<any> {
    // L1: Check in-memory cache
    const l1Result = this.l1Cache.get(key);
    if (l1Result) return l1Result;
    
    // L2: Check Redis
    const l2Result = await this.l2Cache.get(key);
    if (l2Result) {
      this.l1Cache.set(key, l2Result);
      return l2Result;
    }
    
    // L3: Check CDN (for static data)
    const l3Result = await this.l3Cache.get(key);
    if (l3Result) {
      await this.l2Cache.setex(key, 300, l3Result);
      this.l1Cache.set(key, l3Result);
      return l3Result;
    }
    
    return null;
  }
  
  async set(key: string, value: any, ttl: number) {
    this.l1Cache.set(key, value, ttl);
    await this.l2Cache.setex(key, ttl, JSON.stringify(value));
  }
}
```

## Monitoring & Observability

### Logging Strategy
```typescript
// Structured logging with Winston
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'wayshare-api' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Usage in services
class ReportService {
  async createReport(report: CreateReportDto) {
    logger.info('Creating new report', {
      sessionId: report.sessionId,
      incidentType: report.incident_type,
      location: report.location,
      hasMedia: !!report.media_url
    });
    
    try {
      const result = await this.repository.create(report);
      logger.info('Report created successfully', {
        reportId: result.id,
        sessionId: report.sessionId
      });
      return result;
    } catch (error) {
      logger.error('Failed to create report', {
        error: error.message,
        stack: error.stack,
        sessionId: report.sessionId
      });
      throw error;
    }
  }
}
```

### Metrics Collection
```typescript
// Custom metrics with StatsD
import { StatsD } from 'node-statsd';

const metrics = new StatsD({
  host: process.env.STATSD_HOST,
  port: process.env.STATSD_PORT,
  prefix: 'wayshare.'
});

// Application metrics
export class MetricsService {
  reportSubmitted(incidentType: string) {
    metrics.increment('reports.submitted');
    metrics.increment(`reports.by_type.${incidentType}`);
  }
  
  reportProcessingTime(duration: number) {
    metrics.timing('reports.processing_time', duration);
  }
  
  apiRequestDuration(endpoint: string, method: string, duration: number) {
    metrics.timing(`api.${method}.${endpoint}`, duration);
  }
  
  databaseQueryTime(query: string, duration: number) {
    metrics.timing(`database.query.${query}`, duration);
  }
}
```

## Deployment & DevOps

### Docker Configuration
```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS runtime

RUN addgroup -g 1001 -S nodejs
RUN adduser -S wayshare -u 1001

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=wayshare:nodejs . .

USER wayshare
EXPOSE 3000

CMD ["npm", "start"]
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wayshare-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: wayshare-api
  template:
    metadata:
      labels:
        app: wayshare-api
    spec:
      containers:
      - name: api
        image: wayshare/api:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: wayshare-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: wayshare-secrets
              key: redis-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## Security Configuration

### Security Headers
```typescript
// Express security middleware
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.wayshare.com"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

### Input Validation
```typescript
// Schema validation with Zod
import { z } from 'zod';

const CreateReportSchema = z.object({
  license_plate: z.string().min(1).max(10).regex(/^[A-Z0-9]+$/),
  state: z.string().length(2).regex(/^[A-Z]{2}$/),
  incident_type: z.enum(['speeding', 'phone_use', 'tailgating', 'road_rage']),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }),
  media_url: z.string().url().optional(),
  notes: z.string().max(500).optional()
});

// Middleware for validation
export const validateCreateReport = (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body = CreateReportSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid request data', details: error.errors });
  }
};
```

## Testing Strategy

### Unit Testing
```typescript
// Jest configuration
import { describe, it, expect, beforeEach } from '@jest/globals';
import { AnonymizationService } from '../services/anonymization.service';

describe('AnonymizationService', () => {
  let service: AnonymizationService;
  
  beforeEach(() => {
    service = new AnonymizationService();
  });
  
  it('should hash non-verified plates', async () => {
    const report = {
      license_plate: 'ABC123',
      state: 'CA',
      incident_type: 'phone_use',
      location: { lat: 37.3382, lng: -121.8863 }
    };
    
    const result = await service.processReport(report);
    
    expect(result.plate_hash).toBeDefined();
    expect(result.license_plate).toBeUndefined();
    expect(result.is_verified_owner).toBe(false);
  });
  
  it('should preserve verified owner plates', async () => {
    // Mock verified vehicle
    jest.spyOn(service.vehicleService, 'findByPlate')
      .mockResolvedValue({ is_verified: true });
    
    const report = {
      license_plate: 'VERIFIED1',
      state: 'CA',
      incident_type: 'phone_use',
      location: { lat: 37.3382, lng: -121.8863 }
    };
    
    const result = await service.processReport(report);
    
    expect(result.plate_hash).toBeDefined();
    expect(result.license_plate).toBe('VERIFIED1');
    expect(result.is_verified_owner).toBe(true);
  });
});
```

### Integration Testing
```typescript
// Supertest for API testing
import request from 'supertest';
import app from '../app';

describe('Reports API', () => {
  it('should create a new report', async () => {
    const reportData = {
      license_plate: 'TEST123',
      state: 'CA',
      incident_type: 'phone_use',
      location: { lat: 37.3382, lng: -121.8863 }
    };
    
    const response = await request(app)
      .post('/api/v1/reports')
      .send(reportData)
      .expect(201);
    
    expect(response.body.id).toBeDefined();
    expect(response.body.status).toBe('active');
  });
  
  it('should return heat map data', async () => {
    const response = await request(app)
      .get('/api/v1/reports/heatmap')
      .query({
        ne_lat: 37.4,
        ne_lng: -121.8,
        sw_lat: 37.3,
        sw_lng: -121.9,
        zoom: 12
      })
      .expect(200);
    
    expect(Array.isArray(response.body.points)).toBe(true);
  });
});
```

This technical guide provides the foundation for implementing a secure, scalable, and maintainable Way-Share platform. The architecture prioritizes privacy, performance, and reliability while supporting the diverse needs of all user types.