# Way-Share Architecture Documentation

## Overview

Way-Share is a privacy-first Progressive Web Application (PWA) designed for traffic incident reporting. The system employs a microservices architecture with React frontend, Node.js backend, PostgreSQL database with PostGIS extensions, and Redis for caching and session management.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Architecture](#backend-architecture)
5. [Database Design](#database-design)
6. [Security Architecture](#security-architecture)
7. [Privacy Implementation](#privacy-implementation)
8. [API Design](#api-design)
9. [PWA Architecture](#pwa-architecture)
10. [Deployment Architecture](#deployment-architecture)
11. [Monitoring and Observability](#monitoring-and-observability)
12. [Scalability Considerations](#scalability-considerations)

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile/Web    │    │   CDN/Proxy     │    │   Load Balancer │
│   Clients       │◄──►│   (Cloudflare)  │◄──►│   (Nginx)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                       ┌────────────────────────────────┼────────────────────────────────┐
                       │                                │                                │
                       ▼                                ▼                                ▼
              ┌─────────────────┐              ┌─────────────────┐              ┌─────────────────┐
              │   Frontend      │              │   Backend API   │              │   Admin Panel   │
              │   (React PWA)   │              │   (Node.js)     │              │   (React)       │
              │   Port: 80/443  │              │   Port: 3001    │              │   Port: 3002    │
              └─────────────────┘              └─────────────────┘              └─────────────────┘
                       │                                │                                │
                       │                                │                                │
                       └────────────────┬───────────────┼────────────────┬───────────────┘
                                        │               │                │
                                        ▼               ▼                ▼
                              ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
                              │   PostgreSQL    │ │   Redis Cache   │ │   File Storage  │
                              │   + PostGIS     │ │   Sessions      │ │   (AWS S3)      │
                              │   Port: 5432    │ │   Port: 6379    │ │   (Optional)    │
                              └─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Core Components

#### 1. Frontend Layer
- **React 18 PWA**: Modern React application with TypeScript
- **Material-UI**: Component library for consistent UI
- **Redux Toolkit**: State management with RTK Query
- **MapLibre GL**: Interactive maps and heat map visualization
- **Workbox**: Service worker for offline functionality

#### 2. Backend Layer
- **Express.js API**: RESTful API with TypeScript
- **JWT Authentication**: Secure token-based authentication
- **Express Middleware**: Validation, security, rate limiting
- **Business Logic Services**: Modular service architecture

#### 3. Data Layer
- **PostgreSQL**: Primary database with ACID compliance
- **PostGIS**: Geospatial extensions for location data
- **Redis**: Caching and session storage
- **AWS S3**: Optional media file storage

#### 4. Infrastructure Layer
- **Docker Containers**: Containerized microservices
- **Nginx**: Reverse proxy and SSL termination
- **Health Checks**: Automated service monitoring
- **Log Aggregation**: Centralized logging system

---

## Technology Stack

### Frontend Technologies

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| React | 18.x | UI Framework | Modern, component-based, excellent ecosystem |
| TypeScript | 5.x | Type Safety | Compile-time error checking, better IDE support |
| Vite | 4.x | Build Tool | Fast development, optimized builds |
| Material-UI | 5.x | UI Components | Consistent design system, accessibility |
| Redux Toolkit | 1.9.x | State Management | Predictable state, DevTools, RTK Query |
| MapLibre GL | 2.x | Maps | Open-source, WebGL-based mapping |
| Workbox | 6.x | PWA | Service workers, offline functionality |

### Backend Technologies

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| Node.js | 18.x LTS | Runtime | JavaScript ecosystem, async I/O |
| Express.js | 4.x | Web Framework | Minimal, flexible, extensive middleware |
| TypeScript | 5.x | Type Safety | Enhanced development experience |
| PostgreSQL | 15.x | Database | ACID compliance, PostGIS support |
| PostGIS | 3.3.x | Geospatial | Advanced geographic operations |
| Redis | 7.x | Cache/Sessions | High-performance, in-memory storage |
| JWT | - | Authentication | Stateless, scalable authentication |

### Development Tools

| Tool | Purpose | Configuration |
|------|---------|---------------|
| ESLint | Code Linting | TypeScript, React rules |
| Prettier | Code Formatting | Consistent style |
| Jest | Testing | Unit and integration tests |
| Docker | Containerization | Multi-stage builds |
| GitHub Actions | CI/CD | Automated testing and deployment |

---

## Frontend Architecture

### Component Architecture

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Generic components
│   │   ├── Button/
│   │   ├── FormField/
│   │   ├── Modal/
│   │   └── ...
│   ├── layout/          # Layout components
│   │   ├── Header/
│   │   ├── Footer/
│   │   └── Layout/
│   └── domain/          # Domain-specific components
│       ├── auth/
│       ├── reporting/
│       └── admin/
├── features/            # Feature modules
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── reporting/
│   └── dashboard/
├── pages/               # Route components
├── store/               # Redux configuration
│   ├── api/            # RTK Query APIs
│   ├── slices/         # Redux slices
│   └── store.ts        # Store configuration
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── types/               # TypeScript definitions
└── styles/              # Global styles and theme
```

### State Management Architecture

#### Redux Store Structure
```typescript
interface RootState {
  auth: AuthState;           // User authentication state
  reporting: ReportingState; // Incident reporting state
  map: MapState;             // Map view and filters
  ui: UIState;               // UI-specific state
  api: ApiState;             // RTK Query cache
}
```

#### Data Flow Pattern
```
User Action → Component → Redux Action → Reducer → Updated State → Component Re-render
     ↑                                                                       ↓
API Response ← RTK Query ← API Call ← Middleware ← Action (async)
```

### Component Design Patterns

#### 1. Composition Pattern
```typescript
// Container component
const ReportingFlow: React.FC = () => {
  return (
    <Layout>
      <ProgressIndicator step={currentStep} totalSteps={4} />
      <StepRenderer currentStep={currentStep} />
      <NavigationControls onNext={handleNext} onBack={handleBack} />
    </Layout>
  );
};

// Composable step components
const StepRenderer: React.FC<{ currentStep: number }> = ({ currentStep }) => {
  switch (currentStep) {
    case 1: return <IncidentTypeStep />;
    case 2: return <LocationStep />;
    case 3: return <DetailsStep />;
    case 4: return <ReviewStep />;
    default: return null;
  }
};
```

#### 2. Custom Hooks Pattern
```typescript
// Custom hook for form state management
export const useReportForm = () => {
  const [formData, setFormData] = useState<ReportFormData>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    // Validation logic
  }, [formData]);

  return {
    formData,
    errors,
    isSubmitting,
    updateField,
    validateForm,
    submitForm
  };
};
```

### Progressive Web App Architecture

#### Service Worker Strategy
```typescript
// sw.ts - Service Worker configuration
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache strategies
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [{
      cacheKeyWillBeUsed: async ({ request }) => {
        return `${request.url}?version=1.0`;
      }
    }]
  })
);

// API caching strategy
registerRoute(
  /^https:\/\/api\.wayshare\.com\/api\/v1\//,
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 3,
    plugins: [{
      cacheWillUpdate: async ({ response }) => {
        return response.status === 200 ? response : null;
      }
    }]
  })
);
```

#### Offline Support
```typescript
// Background sync for offline reports
self.addEventListener('sync', event => {
  if (event.tag === 'sync-reports') {
    event.waitUntil(syncReports());
  }
});

async function syncReports() {
  const reports = await getQueuedReports();
  for (const report of reports) {
    try {
      await submitReport(report);
      await removeQueuedReport(report.id);
    } catch (error) {
      console.log('Report sync failed, will retry:', error);
    }
  }
}
```

---

## Backend Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Controllers                        │ ← Request/Response handling
├─────────────────────────────────────────────────────┤
│                   Middleware                         │ ← Auth, validation, logging
├─────────────────────────────────────────────────────┤
│                   Services                           │ ← Business logic
├─────────────────────────────────────────────────────┤
│                   Data Access                        │ ← Database operations
├─────────────────────────────────────────────────────┤
│                   Database                           │ ← PostgreSQL + PostGIS
└─────────────────────────────────────────────────────┘
```

### Service Architecture

#### 1. Controller Layer
```typescript
// controllers/reportController.ts
export class ReportController {
  async submitReport(req: AuthenticatedRequest, res: Response) {
    try {
      // Input validation
      const validationResult = await validateReportInput(req.body);
      if (!validationResult.isValid) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', details: validationResult.errors }
        });
      }

      // Business logic delegation
      const report = await this.reportService.createReport({
        ...req.body,
        userId: req.user?.id,
        ipAddress: req.ip
      });

      // Response formatting
      res.status(201).json({
        success: true,
        data: report
      });
    } catch (error) {
      this.errorHandler.handle(error, req, res);
    }
  }
}
```

#### 2. Service Layer
```typescript
// services/reportService.ts
export class ReportService {
  constructor(
    private reportRepository: ReportRepository,
    private anonymizationService: AnonymizationService,
    private validationService: ValidationService,
    private notificationService: NotificationService
  ) {}

  async createReport(reportData: CreateReportRequest): Promise<Report> {
    // Business rule validation
    await this.validateReportRules(reportData);

    // Data anonymization
    const anonymizedData = await this.anonymizationService.anonymizeReport(reportData);

    // Location processing
    const processedLocation = await this.processLocation(anonymizedData.location);

    // Database transaction
    const report = await this.reportRepository.transaction(async (trx) => {
      const savedReport = await this.reportRepository.create(anonymizedData, trx);
      await this.updateHeatMapData(processedLocation, trx);
      return savedReport;
    });

    // Async operations
    await this.notificationService.sendReportNotification(report);
    
    return report;
  }

  private async validateReportRules(data: CreateReportRequest) {
    // Check rate limiting
    const recentReports = await this.reportRepository.getRecentByUser(data.userId, '1 hour');
    if (recentReports.length >= 5) {
      throw new BusinessError('RATE_LIMIT_EXCEEDED', 'Too many reports in the last hour');
    }

    // Validate incident type requirements
    const incidentMeta = await this.getIncidentTypeMetadata(data.incidentType);
    if (incidentMeta.requiresLicensePlate && !data.licensePlate) {
      throw new BusinessError('MISSING_LICENSE_PLATE', 'License plate required for this incident type');
    }
  }
}
```

#### 3. Repository Pattern
```typescript
// repositories/reportRepository.ts
export class ReportRepository {
  constructor(private db: DatabaseConnection) {}

  async create(reportData: CreateReportData, trx?: Transaction): Promise<Report> {
    const query = `
      INSERT INTO reports (
        incident_type, 
        location, 
        license_plate_hash, 
        description, 
        user_id,
        anonymous_id,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;

    const values = [
      reportData.incidentType,
      `POINT(${reportData.location.lng} ${reportData.location.lat})`,
      reportData.licensePlateHash,
      reportData.description,
      reportData.userId,
      reportData.anonymousId
    ];

    const result = await (trx || this.db).query(query, values);
    return this.mapToReport(result.rows[0]);
  }

  async findByLocation(bounds: GeoBounds, filters?: ReportFilters): Promise<Report[]> {
    const query = `
      SELECT r.*, ST_AsGeoJSON(r.location) as location_geojson
      FROM reports r
      WHERE ST_Contains(
        ST_MakeEnvelope($1, $2, $3, $4, 4326),
        r.location
      )
      ${filters?.incidentType ? 'AND r.incident_type = $5' : ''}
      ${filters?.timeRange ? 'AND r.created_at >= NOW() - INTERVAL $6' : ''}
      ORDER BY r.created_at DESC
    `;

    const values = [bounds.swLng, bounds.swLat, bounds.neLng, bounds.neLat];
    if (filters?.incidentType) values.push(filters.incidentType);
    if (filters?.timeRange) values.push(filters.timeRange);

    const result = await this.db.query(query, values);
    return result.rows.map(this.mapToReport);
  }
}
```

### Middleware Architecture

#### 1. Authentication Middleware
```typescript
// middleware/auth.ts
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { code: 'MISSING_TOKEN', message: 'Authentication token required' }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    const user = await userService.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: { code: 'TOKEN_ERROR', message: 'Token verification failed' }
    });
  }
};
```

#### 2. Validation Middleware
```typescript
// middleware/validation.ts
export const validateRequest = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details
        }
      });
    }

    req.body = value; // Use validated/sanitized data
    next();
  };
};
```

#### 3. Rate Limiting Middleware
```typescript
// middleware/rateLimiter.ts
export const createRateLimiter = (options: RateLimitOptions) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.maxRequests,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Too many requests, please try again in ${options.windowMs / 1000} seconds`
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health';
    }
  });
};
```

---

## Database Design

### Entity Relationship Diagram

```
Users                    Reports                    IncidentTypes
┌─────────────────┐      ┌─────────────────┐       ┌─────────────────┐
│ id (UUID) PK    │◄────┐│ id (UUID) PK    │       │ type (ENUM) PK  │
│ email           │     └│ user_id FK      │       │ requires_plate  │
│ password_hash   │      │ incident_type FK├──────►│ category        │
│ first_name      │      │ location (POINT)│       │ subcategories   │
│ last_name       │      │ license_plate_h │       │ description     │
│ role            │      │ description     │       └─────────────────┘
│ is_verified     │      │ status          │
│ created_at      │      │ created_at      │       Vehicles
└─────────────────┘      │ anonymous_id    │       ┌─────────────────┐
                         └─────────────────┘    ┌─►│ id (UUID) PK    │
UserSessions                                    │  │ user_id FK      │
┌─────────────────┐      UserVehicles          │  │ make            │
│ id (UUID) PK    │      ┌─────────────────┐   │  │ model           │
│ user_id FK      ├─────►│ user_id FK      ├───┘  │ year            │
│ refresh_token   │      │ vehicle_id FK   │      │ license_plate   │
│ expires_at      │      │ is_primary      │      │ is_verified     │
│ created_at      │      │ created_at      │      └─────────────────┘
└─────────────────┘      └─────────────────┘
```

### Database Schema Design Principles

#### 1. Privacy by Design
```sql
-- License plates are immediately hashed
CREATE OR REPLACE FUNCTION hash_license_plate()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.license_plate IS NOT NULL THEN
        NEW.license_plate_hash = encode(
            digest(NEW.license_plate || gen_random_uuid()::text, 'sha256'),
            'hex'
        );
        NEW.license_plate = NULL; -- Remove original
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hash_license_plate_trigger
    BEFORE INSERT ON reports
    FOR EACH ROW
    EXECUTE FUNCTION hash_license_plate();
```

#### 2. Geospatial Design
```sql
-- Location with privacy rounding
CREATE OR REPLACE FUNCTION round_location()
RETURNS TRIGGER AS $$
BEGIN
    -- Round to 100m grid for privacy
    NEW.location = ST_SnapToGrid(NEW.location, 0.001); -- ~100m at equator
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Spatial indexes for performance
CREATE INDEX idx_reports_location_gist ON reports USING GIST (location);
CREATE INDEX idx_reports_time_location ON reports (created_at, location);
```

#### 3. Audit Trail
```sql
-- Audit log table
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(50) NOT NULL,
    operation VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    record_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (
        table_name, 
        operation, 
        record_id, 
        old_values, 
        new_values, 
        user_id
    ) VALUES (
        TG_TABLE_NAME,
        TG_OP,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END,
        COALESCE(NEW.user_id, OLD.user_id)
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

### Data Migration Strategy

#### Migration File Structure
```sql
-- v2.6.0_add_audit_system.sql
-- Version: 2.6.0
-- Description: Add comprehensive audit logging system
-- Author: Development Team
-- Date: 2025-07-10

-- Forward Migration
BEGIN;

-- Create audit log table
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(50) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    record_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_user_time ON audit_log(user_id, created_at);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- Add audit triggers to sensitive tables
CREATE TRIGGER audit_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_reports_trigger
    AFTER INSERT OR UPDATE OR DELETE ON reports
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- Update schema version
INSERT INTO schema_versions (version, description, applied_at)
VALUES ('2.6.0', 'Add comprehensive audit logging system', NOW());

COMMIT;

-- Verification Queries
DO $$
BEGIN
    -- Verify audit table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_log') THEN
        RAISE EXCEPTION 'Migration failed: audit_log table not created';
    END IF;
    
    -- Verify triggers exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'audit_users_trigger') THEN
        RAISE EXCEPTION 'Migration failed: audit triggers not created';
    END IF;
    
    RAISE NOTICE 'Migration v2.6.0 completed successfully';
END $$;
```

---

## Security Architecture

### Authentication & Authorization

#### JWT Token Strategy
```typescript
// JWT token structure
interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  sessionId: string;
  iat: number;
  exp: number;
}

// Token generation
export class AuthService {
  generateTokens(user: User): AuthTokens {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId: generateSessionId(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: '15m'
    });

    const refreshToken = jwt.sign(
      { userId: user.id, sessionId: payload.sessionId },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '30d' }
    );

    return { accessToken, refreshToken, expiresIn: 15 * 60 };
  }
}
```

#### Role-Based Access Control
```typescript
// Authorization middleware
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHENTICATED', message: 'Authentication required' }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'INSUFFICIENT_PERMISSIONS', message: 'Access denied' }
      });
    }

    next();
  };
};

// Usage in routes
router.get('/admin/users', 
  authenticateToken,
  requireRole(['admin']),
  adminController.getUsers
);
```

### Data Protection

#### Encryption at Rest
```typescript
// Sensitive data encryption
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyDerivationSalt = process.env.ENCRYPTION_SALT!;

  encrypt(plaintext: string, userKey?: string): EncryptedData {
    const key = this.deriveKey(userKey);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, key);
    
    cipher.setAAD(Buffer.from('wayshare-data'));
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  private deriveKey(userKey?: string): Buffer {
    const input = userKey || process.env.MASTER_KEY!;
    return crypto.pbkdf2Sync(input, this.keyDerivationSalt, 10000, 32, 'sha256');
  }
}
```

#### Input Sanitization
```typescript
// Comprehensive input validation
export const sanitizeInput = {
  email: (input: string): string => {
    return validator.normalizeEmail(input.trim().toLowerCase()) || '';
  },

  text: (input: string, maxLength: number = 1000): string => {
    return DOMPurify.sanitize(input.trim().substring(0, maxLength));
  },

  coordinates: (lat: number, lng: number): GeographicPoint => {
    const sanitizedLat = Math.max(-90, Math.min(90, parseFloat(lat.toFixed(6))));
    const sanitizedLng = Math.max(-180, Math.min(180, parseFloat(lng.toFixed(6))));
    
    return { lat: sanitizedLat, lng: sanitizedLng };
  },

  licensePlate: (input: string): string => {
    return input.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  }
};
```

---

## Privacy Implementation

### Data Anonymization

#### License Plate Hashing
```typescript
// Irreversible license plate anonymization
export class AnonymizationService {
  async hashLicensePlate(licensePlate: string): Promise<string> {
    // Generate unique salt for each hash
    const salt = crypto.randomBytes(32);
    
    // Normalize license plate format
    const normalized = licensePlate.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Create hash with salt
    const hash = crypto.createHash('sha256');
    hash.update(normalized);
    hash.update(salt);
    
    return hash.digest('hex');
  }

  roundLocation(location: GeographicPoint): GeographicPoint {
    // Round to 100m grid (approximately 0.001 degrees)
    const precision = 0.001;
    
    return {
      lat: Math.round(location.lat / precision) * precision,
      lng: Math.round(location.lng / precision) * precision
    };
  }

  generateAnonymousId(): string {
    // Generate anonymous session ID for tracking without identity
    return crypto.randomUUID();
  }
}
```

#### Data Retention Policy
```sql
-- Automated data cleanup
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Remove personal data after retention period
    UPDATE reports 
    SET description = '[REDACTED]'
    WHERE created_at < NOW() - INTERVAL '2 years'
    AND description != '[REDACTED]';
    
    -- Remove old audit logs
    DELETE FROM audit_log 
    WHERE created_at < NOW() - INTERVAL '1 year';
    
    -- Remove expired sessions
    DELETE FROM user_sessions 
    WHERE expires_at < NOW();
    
    RAISE NOTICE 'Data cleanup completed';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup
SELECT cron.schedule('data-cleanup', '0 2 * * 0', 'SELECT cleanup_old_data();');
```

---

## API Design

### RESTful API Architecture

#### Resource Design
```
GET    /api/v1/reports           # List reports (with filters)
POST   /api/v1/reports           # Create new report
GET    /api/v1/reports/{id}      # Get specific report
PUT    /api/v1/reports/{id}      # Update report (admin only)
DELETE /api/v1/reports/{id}      # Delete report (admin only)

GET    /api/v1/heatmap/data      # Get heat map data
GET    /api/v1/heatmap/stats     # Get aggregated statistics

POST   /api/v1/auth/register     # User registration
POST   /api/v1/auth/login        # User login
POST   /api/v1/auth/refresh      # Token refresh
POST   /api/v1/auth/logout       # User logout
```

#### Response Format Standardization
```typescript
// Standard API response format
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  pagination?: PaginationInfo;
  meta?: ResponseMetadata;
}

interface ApiError {
  code: string;
  message: string;
  details?: ValidationError[];
  timestamp: string;
  requestId: string;
}

// Success response example
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "incidentType": "speeding",
    "location": { "lat": 37.338, "lng": -121.886 },
    "status": "pending",
    "createdAt": "2025-07-10T23:00:00.000Z"
  },
  "meta": {
    "requestId": "req_123456789",
    "processingTime": 45,
    "version": "v1"
  }
}

// Error response example
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "incidentType",
        "message": "Invalid incident type",
        "rejectedValue": "invalid_type"
      }
    ],
    "timestamp": "2025-07-10T23:00:00.000Z",
    "requestId": "req_123456789"
  }
}
```

### API Versioning Strategy

#### Version Management
```typescript
// Version-aware routing
export class ApiVersionManager {
  private readonly supportedVersions = ['v1', 'v2'];
  private readonly defaultVersion = 'v1';

  getVersion(req: Request): string {
    // Check Accept header first
    const acceptHeader = req.headers.accept;
    const versionMatch = acceptHeader?.match(/application\/vnd\.wayshare\.(\w+)\+json/);
    
    if (versionMatch) {
      return versionMatch[1];
    }

    // Check URL path
    const pathVersion = req.path.match(/^\/api\/(v\d+)/)?.[1];
    if (pathVersion && this.supportedVersions.includes(pathVersion)) {
      return pathVersion;
    }

    return this.defaultVersion;
  }

  createVersionedResponse(data: any, version: string): any {
    switch (version) {
      case 'v2':
        return this.transformToV2(data);
      case 'v1':
      default:
        return this.transformToV1(data);
    }
  }
}
```

---

## PWA Architecture

### Service Worker Strategy

#### Caching Strategy
```typescript
// sw.ts - Advanced caching strategy
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { BackgroundSync } from 'workbox-background-sync';

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// App shell caching
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new CacheFirst({
    cacheName: 'app-shell',
    plugins: [{
      cacheKeyWillBeUsed: async ({ request }) => {
        return '/';
      }
    }]
  })
);

// API caching with background sync
const bgSync = new BackgroundSync('api-queue', {
  maxRetentionTime: 24 * 60 // 24 hours
});

registerRoute(
  /\/api\/v1\/reports$/,
  new NetworkFirst({
    cacheName: 'reports-api',
    networkTimeoutSeconds: 3,
    plugins: [bgSync]
  }),
  'POST'
);

// Static resource caching
registerRoute(
  ({ request }) => 
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'worker',
  new StaleWhileRevalidate({
    cacheName: 'static-resources'
  })
);
```

#### Offline Queue Management
```typescript
// Background sync for offline submissions
class OfflineQueueManager {
  private readonly QUEUE_NAME = 'report-submissions';
  private readonly DB_NAME = 'wayshare-offline';

  async queueReport(reportData: OfflineReport): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.QUEUE_NAME], 'readwrite');
    const store = transaction.objectStore(this.QUEUE_NAME);
    
    await store.add({
      ...reportData,
      queuedAt: Date.now(),
      attempts: 0,
      id: crypto.randomUUID()
    });
  }

  async processQueue(): Promise<void> {
    const queuedReports = await this.getQueuedReports();
    
    for (const report of queuedReports) {
      try {
        await this.submitReport(report);
        await this.removeFromQueue(report.id);
      } catch (error) {
        await this.incrementAttempts(report.id);
        
        if (report.attempts >= 3) {
          await this.moveToFailedQueue(report);
        }
      }
    }
  }

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.QUEUE_NAME)) {
          const store = db.createObjectStore(this.QUEUE_NAME, { keyPath: 'id' });
          store.createIndex('queuedAt', 'queuedAt');
        }
      };
    });
  }
}
```

---

## Deployment Architecture

### Container Architecture

#### Multi-stage Docker Builds
```dockerfile
# Frontend Dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Orchestration with Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./way-share-frontend
      target: production
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 256m
          cpus: '0.25'

  backend:
    build:
      context: ./way-share-backend
      target: production
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgis/postgis:15-3.3
    environment:
      POSTGRES_DB: wayshare_production
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 30s
      timeout: 10s
      retries: 5

volumes:
  postgres_data:
```

### Infrastructure as Code

#### Kubernetes Deployment
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wayshare-backend
  namespace: wayshare
spec:
  replicas: 3
  selector:
    matchLabels:
      app: wayshare-backend
  template:
    metadata:
      labels:
        app: wayshare-backend
    spec:
      containers:
      - name: backend
        image: wayshare/backend:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: jwt-secret
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
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
```

---

## Monitoring and Observability

### Logging Architecture

#### Structured Logging
```typescript
// Centralized logging service
export class LoggingService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: {
        service: 'wayshare-api',
        version: process.env.APP_VERSION,
        environment: process.env.NODE_ENV
      },
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ 
          filename: 'logs/error.log', 
          level: 'error' 
        }),
        new winston.transports.File({ 
          filename: 'logs/combined.log' 
        })
      ]
    });
  }

  logRequest(req: Request, res: Response, responseTime: number) {
    this.logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id
    });
  }

  logError(error: Error, context?: any) {
    this.logger.error('Application Error', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context
    });
  }
}
```

### Metrics Collection

#### Application Metrics
```typescript
// Prometheus metrics
import promClient from 'prom-client';

export class MetricsService {
  private httpRequestDuration: promClient.Histogram<string>;
  private httpRequestsTotal: promClient.Counter<string>;
  private activeConnections: promClient.Gauge<string>;

  constructor() {
    // Collect default metrics
    promClient.collectDefaultMetrics();

    this.httpRequestDuration = new promClient.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.5, 1, 2, 5]
    });

    this.httpRequestsTotal = new promClient.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code']
    });

    this.activeConnections = new promClient.Gauge({
      name: 'active_database_connections',
      help: 'Number of active database connections'
    });
  }

  recordRequest(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestDuration
      .labels(method, route, statusCode.toString())
      .observe(duration);

    this.httpRequestsTotal
      .labels(method, route, statusCode.toString())
      .inc();
  }

  updateDatabaseConnections(count: number) {
    this.activeConnections.set(count);
  }

  getMetrics(): string {
    return promClient.register.metrics();
  }
}
```

### Health Checks

#### Comprehensive Health Monitoring
```typescript
// Health check service
export class HealthCheckService {
  constructor(
    private databaseService: DatabaseService,
    private redisService: RedisService,
    private emailService: EmailService
  ) {}

  async getHealthStatus(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkEmailService(),
      this.checkDiskSpace(),
      this.checkMemoryUsage()
    ]);

    const [database, redis, email, disk, memory] = checks.map(result => 
      result.status === 'fulfilled' ? result.value : { status: 'unhealthy', error: result.reason }
    );

    const overall = [database, redis, email, disk, memory].every(check => 
      check.status === 'healthy'
    ) ? 'healthy' : 'unhealthy';

    return {
      status: overall,
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION,
      uptime: process.uptime(),
      checks: {
        database,
        redis,
        email,
        disk,
        memory
      }
    };
  }

  private async checkDatabase(): Promise<HealthCheck> {
    try {
      const start = Date.now();
      await this.databaseService.query('SELECT 1');
      const responseTime = Date.now() - start;

      return {
        status: 'healthy',
        responseTime,
        details: { message: 'Database connection successful' }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        details: { message: 'Database connection failed' }
      };
    }
  }
}
```

---

## Scalability Considerations

### Horizontal Scaling

#### Load Balancing Strategy
```nginx
# nginx.conf - Load balancer configuration
upstream wayshare_backend {
    least_conn;
    server backend-1:3001 max_fails=3 fail_timeout=30s;
    server backend-2:3001 max_fails=3 fail_timeout=30s;
    server backend-3:3001 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name api.wayshare.com;

    location /api/ {
        proxy_pass http://wayshare_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Connection pooling
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        
        # Timeouts
        proxy_connect_timeout 5s;
        proxy_send_timeout 10s;
        proxy_read_timeout 10s;
    }
}
```

#### Database Scaling

##### Read Replicas
```typescript
// Database connection pool with read replicas
export class DatabaseService {
  private masterPool: Pool;
  private replicaPools: Pool[];

  constructor() {
    this.masterPool = new Pool({
      connectionString: process.env.DATABASE_MASTER_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000
    });

    this.replicaPools = [
      new Pool({ connectionString: process.env.DATABASE_REPLICA_1_URL }),
      new Pool({ connectionString: process.env.DATABASE_REPLICA_2_URL })
    ];
  }

  async query(text: string, params?: any[], options?: QueryOptions): Promise<QueryResult> {
    const pool = options?.readonly 
      ? this.getReadReplica() 
      : this.masterPool;

    try {
      return await pool.query(text, params);
    } catch (error) {
      if (options?.readonly && this.isConnectionError(error)) {
        // Fallback to master if replica fails
        return await this.masterPool.query(text, params);
      }
      throw error;
    }
  }

  private getReadReplica(): Pool {
    // Simple round-robin selection
    const index = Math.floor(Math.random() * this.replicaPools.length);
    return this.replicaPools[index];
  }
}
```

##### Database Partitioning
```sql
-- Partition reports table by date
CREATE TABLE reports_y2025m01 PARTITION OF reports
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE reports_y2025m02 PARTITION OF reports
FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Create indexes on partitions
CREATE INDEX idx_reports_y2025m01_location ON reports_y2025m01 USING GIST (location);
CREATE INDEX idx_reports_y2025m02_location ON reports_y2025m02 USING GIST (location);

-- Automated partition management
CREATE OR REPLACE FUNCTION create_monthly_partition()
RETURNS void AS $$
DECLARE
    start_date date;
    end_date date;
    partition_name text;
BEGIN
    start_date := date_trunc('month', CURRENT_DATE + interval '1 month');
    end_date := start_date + interval '1 month';
    partition_name := 'reports_y' || to_char(start_date, 'YYYY') || 'm' || to_char(start_date, 'MM');
    
    EXECUTE format(
        'CREATE TABLE %I PARTITION OF reports FOR VALUES FROM (%L) TO (%L)',
        partition_name, start_date, end_date
    );
    
    EXECUTE format(
        'CREATE INDEX idx_%I_location ON %I USING GIST (location)',
        partition_name, partition_name
    );
END;
$$ LANGUAGE plpgsql;
```

### Caching Strategy

#### Multi-Level Caching
```typescript
// Hierarchical caching service
export class CacheService {
  private l1Cache: Map<string, CacheEntry>; // In-memory
  private l2Cache: Redis; // Redis
  
  constructor(redisClient: Redis) {
    this.l1Cache = new Map();
    this.l2Cache = redisClient;
    
    // L1 cache cleanup
    setInterval(() => this.cleanupL1Cache(), 60000);
  }

  async get<T>(key: string): Promise<T | null> {
    // Check L1 cache first
    const l1Entry = this.l1Cache.get(key);
    if (l1Entry && !this.isExpired(l1Entry)) {
      return l1Entry.value as T;
    }

    // Check L2 cache
    const l2Value = await this.l2Cache.get(key);
    if (l2Value) {
      const parsed = JSON.parse(l2Value) as T;
      
      // Populate L1 cache
      this.l1Cache.set(key, {
        value: parsed,
        expiresAt: Date.now() + 300000 // 5 minutes
      });
      
      return parsed;
    }

    return null;
  }

  async set<T>(key: string, value: T, ttlSeconds: number = 3600): Promise<void> {
    // Set in both caches
    this.l1Cache.set(key, {
      value,
      expiresAt: Date.now() + Math.min(ttlSeconds * 1000, 300000)
    });

    await this.l2Cache.setex(key, ttlSeconds, JSON.stringify(value));
  }

  async invalidate(pattern: string): Promise<void> {
    // Clear L1 cache
    for (const key of this.l1Cache.keys()) {
      if (key.includes(pattern)) {
        this.l1Cache.delete(key);
      }
    }

    // Clear L2 cache
    const keys = await this.l2Cache.keys(`*${pattern}*`);
    if (keys.length > 0) {
      await this.l2Cache.del(...keys);
    }
  }
}
```

### Performance Optimization

#### Database Query Optimization
```sql
-- Optimized heat map query with spatial indexing
EXPLAIN (ANALYZE, BUFFERS) 
SELECT 
    ST_X(ST_Centroid(ST_Collect(location))) as lng,
    ST_Y(ST_Centroid(ST_Collect(location))) as lat,
    COUNT(*) as incident_count,
    array_agg(DISTINCT incident_type) as incident_types
FROM reports 
WHERE 
    ST_Contains(
        ST_MakeEnvelope($1, $2, $3, $4, 4326),
        location
    )
    AND created_at >= $5
    AND ($6 IS NULL OR incident_type = $6)
GROUP BY ST_SnapToGrid(location, 0.01)  -- 1km grid
HAVING COUNT(*) >= 2
ORDER BY incident_count DESC
LIMIT 1000;

-- Index optimization
CREATE INDEX CONCURRENTLY idx_reports_spatial_time_type 
ON reports USING GIST (location, created_at, incident_type);
```

#### API Response Optimization
```typescript
// Response optimization middleware
export const optimizeResponse = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Compression
    if (req.accepts('gzip')) {
      res.set('Content-Encoding', 'gzip');
    }

    // Conditional requests
    const etag = generateETag(req);
    res.set('ETag', etag);
    
    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end();
    }

    // Pagination optimization
    if (req.query.limit) {
      const limit = Math.min(parseInt(req.query.limit as string), 100);
      req.query.limit = limit.toString();
    }

    next();
  };
};
```

---

**Architecture Documentation Version**: 1.0  
**Last Updated**: July 10, 2025  
**System Version**: Way-Share v2.5.2+  
**Support**: For architecture questions, create an issue in the GitHub repository