export interface Report {
  id: string;
  sessionId: string;
  licensePlate?: string; // Always '[REDACTED]' in responses, optional for location-based hazards
  incidentType: IncidentType;
  subcategory?: string;
  latitude: number;
  longitude: number;
  description?: string;
  mediaUrl?: string;
  city: string;
  state: string;
  timestamp: Date;
}

export interface CreateReportDto {
  sessionId: string;
  licensePlate?: string; // Optional for location-based hazards
  incidentType: IncidentType;
  subcategory?: string;
  latitude: number;
  longitude: number;
  description?: string;
  mediaUrl?: string;
  city?: string;
  state?: string;
}

export enum IncidentType {
  // Vehicle-specific incidents (license plate required)
  SPEEDING = 'speeding',
  TAILGATING = 'tailgating',
  PHONE_USE = 'phone_use',
  FAILURE_TO_YIELD = 'failure_to_yield',
  ILLEGAL_PARKING = 'illegal_parking',
  ROAD_RAGE = 'road_rage',
  AGGRESSIVE_DRIVING = 'aggressive_driving',
  PARKING_VIOLATIONS = 'parking_violations',
  UNSECURED_LOADS = 'unsecured_loads',
  LITTERING = 'littering',
  FAILURE_TO_SIGNAL = 'failure_to_signal',
  IMPAIRED_DRIVING = 'impaired_driving',
  RECKLESS_DRIVING = 'reckless_driving',
  // Location-based hazards (no license plate required)
  ROCK_CHIPS = 'rock_chips',
  POTHOLES = 'potholes',
  DEBRIS_IN_ROAD = 'debris_in_road',
  ROAD_SURFACE_ISSUES = 'road_surface_issues',
  TRAFFIC_SIGNAL_PROBLEMS = 'traffic_signal_problems',
  DANGEROUS_ROAD_CONDITIONS = 'dangerous_road_conditions',
  DEAD_ANIMALS = 'dead_animals',
  FALLEN_OBSTACLES = 'fallen_obstacles',
}

export interface HeatMapData {
  lat: number;
  lng: number;
  count: number;
  incidentTypes: Record<IncidentType, number>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface IncidentTypeMetadata {
  incidentType: IncidentType;
  requiresLicensePlate: boolean;
  displayName: string;
  description: string;
  category: 'vehicle' | 'location';
  subcategories: string[];
}

// Authentication types
export interface User {
  id: string;
  email: string;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
  password_hash?: string; // Only included when fetching for authentication
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JWTPayload {
  userId: string;
  type: 'access';
  iat?: number;
  exp?: number;
}

// Notification types
export interface Notification {
  id: string;
  user_id: string;
  report_id?: string;
  type: 'incident_reported' | 'dispute_resolved' | 'dispute_rejected' | 'vehicle_verified';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  read_at?: Date;
  email_sent: boolean;
  email_sent_at?: Date;
  push_sent: boolean;
  push_sent_at?: Date;
  created_at: Date;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_incidents: boolean;
  push_incidents: boolean;
  email_disputes: boolean;
  push_disputes: boolean;
  email_vehicle_updates: boolean;
  push_vehicle_updates: boolean;
  created_at: Date;
  updated_at: Date;
}

// Incident management types
export interface IncidentDispute {
  id: string;
  report_id: string;
  user_id: string;
  dispute_type: 'not_me' | 'incorrect_details' | 'wrong_vehicle' | 'false_report' | 'other';
  description: string;
  supporting_evidence_urls?: string[];
  status: 'pending' | 'under_review' | 'resolved' | 'rejected';
  admin_response?: string;
  admin_user_id?: string;
  resolved_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface IncidentNote {
  id: string;
  report_id: string;
  user_id: string;
  note: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserIncident extends Report {
  owner_user_id: string;
  license_plate_plaintext: string;
  is_owner_notified: boolean;
  owner_viewed_at?: Date;
  incident_status: 'active' | 'disputed' | 'resolved' | 'archived';
  media_urls?: string[];
  dispute_id?: string;
  dispute_status?: string;
  dispute_type?: string;
  user_note?: string;
  dispute_count: number;
}