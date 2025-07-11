# Way-Share API Documentation

## Overview

The Way-Share API is a RESTful service built with Node.js, Express, and TypeScript. It provides endpoints for traffic incident reporting, user authentication, driver scoring, and administrative functions.

**Base URL**: `https://your-domain.com/api/v1`  
**API Version**: v1 (with v2 endpoints for enhanced features)  
**Authentication**: JWT Bearer tokens  
**Rate Limiting**: 100 requests per 15 minutes per IP  

## Authentication

### JWT Token-Based Authentication

Most endpoints require authentication using JWT tokens passed in the Authorization header:

```bash
Authorization: Bearer <jwt_token>
```

### Authentication Endpoints

#### Register User
```http
POST /api/v1/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email for verification.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isVerified": false,
    "role": "user"
  }
}
```

#### Login
```http
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isVerified": true,
    "role": "user"
  },
  "token": "jwt_access_token",
  "refreshToken": "jwt_refresh_token"
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

#### Logout
```http
POST /api/v1/auth/logout
```
**Headers:** `Authorization: Bearer <token>`

#### Password Reset
```http
POST /api/v1/auth/forgot-password
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

```http
POST /api/v1/auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset_token",
  "newPassword": "NewSecurePass123"
}
```

#### Email Verification
```http
GET /api/v1/auth/verify-email/:token
```

```http
POST /api/v1/auth/resend-verification
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

## Incident Reporting

### Submit Report
```http
POST /api/v1/reports
```

**Request Body:**
```json
{
  "incidentType": "speeding",
  "location": {
    "lat": 37.3382,
    "lng": -121.8863
  },
  "licensePlate": "ABC123", // Optional for location-based incidents
  "description": "Vehicle was speeding in a 25mph zone",
  "subcategory": "Excessive speeding", // Optional
  "media": [] // Optional media attachments
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report submitted successfully",
  "report": {
    "id": "report_uuid",
    "incidentType": "speeding",
    "location": {
      "lat": 37.338,
      "lng": -121.886
    },
    "licensePlateHash": "hashed_value", // SHA-256 hash
    "description": "Vehicle was speeding in a 25mph zone",
    "subcategory": "Excessive speeding",
    "status": "pending",
    "createdAt": "2025-07-10T23:00:00.000Z",
    "anonymousId": "session_uuid"
  }
}
```

### Get User Reports (Authenticated)
```http
GET /api/v2/incidents/user
```
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "reports": [
    {
      "id": "report_uuid",
      "incidentType": "speeding",
      "status": "verified",
      "location": {
        "lat": 37.338,
        "lng": -121.886
      },
      "createdAt": "2025-07-10T23:00:00.000Z",
      "canDispute": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

### Dispute Report
```http
POST /api/v2/incidents/:id/dispute
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "reason": "incorrect_location",
  "description": "The incident did not occur at this location",
  "evidence": ["evidence_url_1", "evidence_url_2"]
}
```

## Heat Map Data

### Get Heat Map Data
```http
GET /api/v1/heatmap/data
```

**Query Parameters:**
- `timeRange`: `24h`, `7d`, `30d` (default: `24h`)
- `incidentType`: Specific incident type filter (optional)
- `bounds`: Map bounds for filtering `swLat,swLng,neLat,neLng` (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "points": [
      {
        "lat": 37.338,
        "lng": -121.886,
        "count": 5,
        "incidentTypes": ["speeding", "tailgating"]
      }
    ],
    "summary": {
      "totalIncidents": 150,
      "timeRange": "24h",
      "lastUpdated": "2025-07-10T23:00:00.000Z"
    }
  }
}
```

### Get Incident Statistics
```http
GET /api/v1/heatmap/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 1250,
    "byType": {
      "speeding": 450,
      "tailgating": 200,
      "illegal_parking": 150,
      "potholes": 100
    },
    "byDay": {
      "2025-07-10": 25,
      "2025-07-09": 30,
      "2025-07-08": 22
    }
  }
}
```

## User Management

### Get User Profile
```http
GET /api/v2/users/profile
```
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isVerified": true,
    "isIdentityVerified": false,
    "role": "user",
    "driverScore": 85,
    "joinedAt": "2025-07-01T00:00:00.000Z",
    "preferences": {
      "notifications": true,
      "newsletter": false
    }
  }
}
```

### Update User Profile
```http
PUT /api/v2/users/profile
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "preferences": {
    "notifications": true,
    "newsletter": true
  }
}
```

### Change Password
```http
PUT /api/v2/users/change-password
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "CurrentPass123",
  "newPassword": "NewSecurePass123"
}
```

## Vehicle Management

### Get User Vehicles
```http
GET /api/v2/vehicles
```
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "vehicles": [
    {
      "id": "vehicle_uuid",
      "make": "Toyota",
      "model": "Camry",
      "year": 2022,
      "color": "Blue",
      "licensePlate": "ABC123",
      "isVerified": true,
      "verificationStatus": "approved",
      "createdAt": "2025-07-01T00:00:00.000Z"
    }
  ]
}
```

### Add Vehicle
```http
POST /api/v2/vehicles
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "make": "Toyota",
  "model": "Camry", 
  "year": 2022,
  "color": "Blue",
  "licensePlate": "ABC123",
  "registrationDocument": "base64_encoded_image" // Optional
}
```

### Update Vehicle
```http
PUT /api/v2/vehicles/:id
```
**Headers:** `Authorization: Bearer <token>`

### Delete Vehicle
```http
DELETE /api/v2/vehicles/:id
```
**Headers:** `Authorization: Bearer <token>`

## Driver Score System

### Get Driver Score
```http
GET /api/v2/driver-score
```
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "driverScore": {
    "currentScore": 85,
    "scoreCategory": "Good Driver",
    "breakdown": {
      "baseScore": 100,
      "violations": -15,
      "timeRecovery": 5,
      "bonusPoints": 0
    },
    "history": [
      {
        "date": "2025-07-10",
        "score": 85,
        "change": -5,
        "reason": "Speeding violation reported"
      }
    ],
    "milestones": [
      {
        "name": "Good Driver",
        "threshold": 80,
        "achieved": true,
        "achievedAt": "2025-07-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Get Score History
```http
GET /api/v2/driver-score/history
```
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `period`: `week`, `month`, `year` (default: `month`)

## Identity Verification

### Start Identity Verification
```http
POST /api/v2/identity/verify
```
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "verificationUrl": "https://verify.stripe.com/...",
  "sessionId": "vi_session_id"
}
```

### Check Verification Status
```http
GET /api/v2/identity/status
```
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "status": "verified", // pending, verified, failed
  "verifiedAt": "2025-07-10T00:00:00.000Z",
  "requirements": []
}
```

## Rewards Marketplace

### Get Available Rewards
```http
GET /api/v2/rewards
```
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `category`: Filter by reward category
- `minScore`: Minimum driver score required

**Response:**
```json
{
  "success": true,
  "rewards": [
    {
      "id": "reward_uuid",
      "partnerId": "partner_uuid",
      "title": "10% Off Car Wash",
      "description": "Get 10% off any car wash service",
      "category": "automotive",
      "discountType": "percentage",
      "discountValue": 10,
      "minDriverScore": 70,
      "isActive": true,
      "expiresAt": "2025-12-31T23:59:59.000Z"
    }
  ]
}
```

### Redeem Reward
```http
POST /api/v2/rewards/:id/redeem
```
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "redemption": {
    "id": "redemption_uuid",
    "rewardId": "reward_uuid",
    "code": "REWARD123",
    "instructions": "Show this code at checkout",
    "expiresAt": "2025-08-10T00:00:00.000Z",
    "redeemedAt": "2025-07-10T00:00:00.000Z"
  }
}
```

## Admin Endpoints

### Get All Users (Admin Only)
```http
GET /api/v2/admin/users
```
**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search by email or name
- `role`: Filter by user role
- `verified`: Filter by verification status

### Get User Details (Admin Only)
```http
GET /api/v2/admin/users/:id
```
**Headers:** `Authorization: Bearer <admin_token>`

### Update User Role (Admin Only)
```http
PUT /api/v2/admin/users/:id/role
```
**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "role": "admin" // user, admin
}
```

### Get Pending Vehicle Verifications (Admin Only)
```http
GET /api/v2/admin/vehicles/pending
```
**Headers:** `Authorization: Bearer <admin_token>`

### Approve/Reject Vehicle Verification (Admin Only)
```http
PUT /api/v2/admin/vehicles/:id/verify
```
**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "status": "approved", // approved, rejected
  "notes": "Vehicle verified successfully"
}
```

### Get Dispute Reports (Admin Only)
```http
GET /api/v2/admin/disputes
```
**Headers:** `Authorization: Bearer <admin_token>`

### Resolve Dispute (Admin Only)
```http
PUT /api/v2/admin/disputes/:id/resolve
```
**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "resolution": "upheld", // upheld, overturned
  "notes": "Dispute resolved in favor of user",
  "actionTaken": "Report removed from system"
}
```

## Health Check

### Service Health Check
```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "Way-Share API is running",
  "timestamp": "2025-07-10T23:00:00.000Z",
  "database": {
    "status": "healthy",
    "timestamp": "2025-07-10T23:00:00.000Z"
  }
}
```

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  },
  "timestamp": "2025-07-10T23:00:00.000Z"
}
```

### Common HTTP Status Codes
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `422 Unprocessable Entity`: Validation errors
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### Error Codes
- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_ERROR`: Invalid credentials
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `DUPLICATE_RESOURCE`: Resource already exists
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `DATABASE_ERROR`: Database operation failed
- `EXTERNAL_SERVICE_ERROR`: Third-party service error

## Rate Limiting

### Limits
- **General API**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 10 requests per 15 minutes per IP
- **Report submission**: 20 requests per hour per user

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1625097600
```

## Data Types and Enums

### Incident Types
```typescript
enum IncidentType {
  // Vehicle-specific (require license plate)
  SPEEDING = 'speeding',
  TAILGATING = 'tailgating',
  PHONE_USE = 'phone_use',
  FAILURE_TO_YIELD = 'failure_to_yield',
  ROAD_RAGE = 'road_rage',
  AGGRESSIVE_DRIVING = 'aggressive_driving',
  ILLEGAL_PARKING = 'illegal_parking',
  PARKING_VIOLATIONS = 'parking_violations',
  UNSECURED_LOADS = 'unsecured_loads',
  LITTERING = 'littering',
  FAILURE_TO_SIGNAL = 'failure_to_signal',
  IMPAIRED_DRIVING = 'impaired_driving',
  RECKLESS_DRIVING = 'reckless_driving',
  
  // Location-based (no license plate required)
  ROCK_CHIPS = 'rock_chips',
  POTHOLES = 'potholes',
  ROAD_SURFACE_ISSUES = 'road_surface_issues',
  TRAFFIC_SIGNAL_PROBLEMS = 'traffic_signal_problems',
  DANGEROUS_ROAD_CONDITIONS = 'dangerous_road_conditions',
  DEBRIS_IN_ROAD = 'debris_in_road',
  DEAD_ANIMALS = 'dead_animals',
  FALLEN_OBSTACLES = 'fallen_obstacles'
}
```

### User Roles
```typescript
enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}
```

### Report Status
```typescript
enum ReportStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  DISMISSED = 'dismissed',
  DISPUTED = 'disputed'
}
```

## WebSocket Events (Future)

### Real-time Notifications
```javascript
// Connect to WebSocket
const socket = io('wss://your-domain.com', {
  auth: { token: 'jwt_token' }
});

// Listen for events
socket.on('new_incident', (data) => {
  console.log('New incident nearby:', data);
});

socket.on('score_updated', (data) => {
  console.log('Driver score updated:', data);
});
```

## SDK Examples

### JavaScript/TypeScript
```typescript
import axios from 'axios';

class WayShareAPI {
  private baseURL = 'https://your-domain.com/api/v1';
  private token?: string;

  setToken(token: string) {
    this.token = token;
  }

  async submitReport(report: IncidentReport) {
    const response = await axios.post(`${this.baseURL}/reports`, report, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    return response.data;
  }

  async getHeatMapData(params?: HeatMapParams) {
    const response = await axios.get(`${this.baseURL}/heatmap/data`, {
      params
    });
    return response.data;
  }
}
```

### Python
```python
import requests

class WayShareAPI:
    def __init__(self, base_url="https://your-domain.com/api/v1"):
        self.base_url = base_url
        self.token = None
    
    def set_token(self, token):
        self.token = token
    
    def submit_report(self, report_data):
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.post(
            f"{self.base_url}/reports", 
            json=report_data, 
            headers=headers
        )
        return response.json()
```

---

**API Version**: v1 & v2  
**Last Updated**: July 10, 2025  
**OpenAPI Spec**: Available at `/api/docs` (when enabled)  
**Postman Collection**: [Download](./postman/Way-Share-API.postman_collection.json)