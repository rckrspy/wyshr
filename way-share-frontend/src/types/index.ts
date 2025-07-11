export interface Report {
  id?: string;
  sessionId: string;
  licensePlate?: string; // Now optional for location-based hazards
  licensePlateHash?: string;
  incidentType: IncidentType;
  subcategory?: string;
  location: {
    lat: number;
    lng: number;
  };
  description?: string;
  media?: File | null;
  mediaUrl?: string;
  createdAt?: string;
  status?: 'pending' | 'submitted' | 'failed';
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

export interface HeatMapPoint {
  lat: number;
  lng: number;
  count: number;
  incidentTypes: Record<IncidentType, number>;
}

export interface HeatMapData {
  points: HeatMapPoint[];
  totalReports: number;
  timeRange: string;
  lastUpdated: string;
}

export interface IncidentStats {
  total: number;
  byType: Record<IncidentType, number>;
  lastUpdated: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SessionState {
  sessionId: string | null;
  isOnline: boolean;
  pendingReports: Report[];
}

export interface UIState {
  isLoading: boolean;
  error: string | null;
  notification: {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  } | null;
}

export interface IncidentTypeMetadata {
  incidentType: IncidentType;
  requiresLicensePlate: boolean;
  displayName: string;
  description: string;
  category: 'vehicle' | 'location';
  subcategories: string[];
}

export interface IncidentCategory {
  name: string;
  displayName: string;
  incidents: IncidentTypeMetadata[];
}