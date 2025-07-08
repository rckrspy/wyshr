import { IncidentType } from '../types';

// Helper to determine if an incident type requires a license plate
export const requiresLicensePlate = (incidentType: IncidentType): boolean => {
  const vehicleSpecificTypes: IncidentType[] = [
    IncidentType.SPEEDING,
    IncidentType.TAILGATING,
    IncidentType.PHONE_USE,
    IncidentType.FAILURE_TO_YIELD,
    IncidentType.ILLEGAL_PARKING,
    IncidentType.ROAD_RAGE,
    IncidentType.AGGRESSIVE_DRIVING,
    IncidentType.PARKING_VIOLATIONS,
    IncidentType.UNSECURED_LOADS,
    IncidentType.LITTERING,
    IncidentType.FAILURE_TO_SIGNAL,
    IncidentType.IMPAIRED_DRIVING,
    IncidentType.RECKLESS_DRIVING,
  ];

  return vehicleSpecificTypes.includes(incidentType);
};

// Helper to get display name for incident type
export const getIncidentTypeDisplayName = (incidentType: IncidentType): string => {
  const displayNames: Record<IncidentType, string> = {
    // Vehicle-specific incidents
    [IncidentType.SPEEDING]: 'Speeding',
    [IncidentType.TAILGATING]: 'Tailgating',
    [IncidentType.PHONE_USE]: 'Phone Use',
    [IncidentType.FAILURE_TO_YIELD]: 'Failure to Yield',
    [IncidentType.ILLEGAL_PARKING]: 'Illegal Parking',
    [IncidentType.ROAD_RAGE]: 'Road Rage',
    [IncidentType.AGGRESSIVE_DRIVING]: 'Aggressive Driving',
    [IncidentType.PARKING_VIOLATIONS]: 'Parking Violations',
    [IncidentType.UNSECURED_LOADS]: 'Unsecured Loads',
    [IncidentType.LITTERING]: 'Littering',
    [IncidentType.FAILURE_TO_SIGNAL]: 'Failure to Signal',
    [IncidentType.IMPAIRED_DRIVING]: 'Impaired Driving',
    [IncidentType.RECKLESS_DRIVING]: 'Reckless Driving',
    // Location-based hazards
    [IncidentType.ROCK_CHIPS]: 'Rock Chips',
    [IncidentType.POTHOLES]: 'Potholes',
    [IncidentType.DEBRIS_IN_ROAD]: 'Debris in Road',
    [IncidentType.ROAD_SURFACE_ISSUES]: 'Road Surface Issues',
    [IncidentType.TRAFFIC_SIGNAL_PROBLEMS]: 'Traffic Signal Problems',
    [IncidentType.DANGEROUS_ROAD_CONDITIONS]: 'Dangerous Road Conditions',
    [IncidentType.DEAD_ANIMALS]: 'Dead Animals',
    [IncidentType.FALLEN_OBSTACLES]: 'Fallen Obstacles',
  };

  return displayNames[incidentType] || incidentType;
};