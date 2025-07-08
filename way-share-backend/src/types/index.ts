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

export interface ApiResponse<T = any> {
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