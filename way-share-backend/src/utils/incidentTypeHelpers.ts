import { IncidentType, IncidentTypeMetadata } from '../types';

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

// Helper to get incident type metadata
export const getIncidentTypeMetadata = (incidentType: IncidentType): IncidentTypeMetadata | null => {
  const metadata: Record<IncidentType, IncidentTypeMetadata> = {
    // Vehicle-specific incidents
    [IncidentType.SPEEDING]: {
      incidentType: IncidentType.SPEEDING,
      requiresLicensePlate: true,
      displayName: 'Speeding',
      description: 'Driving significantly above posted speed limits',
      category: 'vehicle',
      subcategories: []
    },
    [IncidentType.TAILGATING]: {
      incidentType: IncidentType.TAILGATING,
      requiresLicensePlate: true,
      displayName: 'Tailgating',
      description: 'Following too closely behind another vehicle',
      category: 'vehicle',
      subcategories: []
    },
    [IncidentType.PHONE_USE]: {
      incidentType: IncidentType.PHONE_USE,
      requiresLicensePlate: true,
      displayName: 'Phone Use',
      description: 'Using mobile device while driving',
      category: 'vehicle',
      subcategories: []
    },
    [IncidentType.FAILURE_TO_YIELD]: {
      incidentType: IncidentType.FAILURE_TO_YIELD,
      requiresLicensePlate: true,
      displayName: 'Failure to Yield',
      description: 'Not yielding right of way when required',
      category: 'vehicle',
      subcategories: []
    },
    [IncidentType.ILLEGAL_PARKING]: {
      incidentType: IncidentType.ILLEGAL_PARKING,
      requiresLicensePlate: true,
      displayName: 'Illegal Parking',
      description: 'Parking in prohibited areas',
      category: 'vehicle',
      subcategories: []
    },
    [IncidentType.ROAD_RAGE]: {
      incidentType: IncidentType.ROAD_RAGE,
      requiresLicensePlate: true,
      displayName: 'Road Rage',
      description: 'Aggressive or violent behavior towards other drivers',
      category: 'vehicle',
      subcategories: []
    },
    [IncidentType.AGGRESSIVE_DRIVING]: {
      incidentType: IncidentType.AGGRESSIVE_DRIVING,
      requiresLicensePlate: true,
      displayName: 'Aggressive Driving',
      description: 'Dangerous driving behaviors',
      category: 'vehicle',
      subcategories: []
    },
    [IncidentType.PARKING_VIOLATIONS]: {
      incidentType: IncidentType.PARKING_VIOLATIONS,
      requiresLicensePlate: true,
      displayName: 'Parking Violations',
      description: 'Various parking infractions',
      category: 'vehicle',
      subcategories: ['Handicap violation', 'Fire zone parking', 'No parking zone', 'Expired meter', 'Blocking driveway', 'Double parking', 'Blocking fire hydrant']
    },
    [IncidentType.UNSECURED_LOADS]: {
      incidentType: IncidentType.UNSECURED_LOADS,
      requiresLicensePlate: true,
      displayName: 'Unsecured Loads',
      description: 'Dangerous cargo or equipment',
      category: 'vehicle',
      subcategories: ['Falling debris', 'Improperly secured cargo', 'Overloaded vehicle', 'Loose equipment']
    },
    [IncidentType.LITTERING]: {
      incidentType: IncidentType.LITTERING,
      requiresLicensePlate: true,
      displayName: 'Littering',
      description: 'Disposal of trash from vehicle',
      category: 'vehicle',
      subcategories: ['Throwing trash', 'Items falling', 'Cigarette disposal', 'Liquid disposal']
    },
    [IncidentType.FAILURE_TO_SIGNAL]: {
      incidentType: IncidentType.FAILURE_TO_SIGNAL,
      requiresLicensePlate: true,
      displayName: 'Failure to Signal',
      description: 'Not using turn signals properly',
      category: 'vehicle',
      subcategories: ['No turn signal', 'No lane change signal', 'Broken signal lights']
    },
    [IncidentType.IMPAIRED_DRIVING]: {
      incidentType: IncidentType.IMPAIRED_DRIVING,
      requiresLicensePlate: true,
      displayName: 'Impaired Driving',
      description: 'Suspected intoxication or impairment',
      category: 'vehicle',
      subcategories: ['Suspected DUI', 'Erratic behavior', 'Swerving', 'Inconsistent speed']
    },
    [IncidentType.RECKLESS_DRIVING]: {
      incidentType: IncidentType.RECKLESS_DRIVING,
      requiresLicensePlate: true,
      displayName: 'Reckless Driving',
      description: 'Extremely dangerous driving',
      category: 'vehicle',
      subcategories: ['Running red lights', 'Running stop signs', 'Dangerous maneuvers', 'Wrong way driving']
    },
    // Location-based hazards
    [IncidentType.ROCK_CHIPS]: {
      incidentType: IncidentType.ROCK_CHIPS,
      requiresLicensePlate: false,
      displayName: 'Rock Chips',
      description: 'Road surface causing windshield damage',
      category: 'location',
      subcategories: []
    },
    [IncidentType.POTHOLES]: {
      incidentType: IncidentType.POTHOLES,
      requiresLicensePlate: false,
      displayName: 'Potholes',
      description: 'Road surface hazards requiring repair',
      category: 'location',
      subcategories: []
    },
    [IncidentType.ROAD_SURFACE_ISSUES]: {
      incidentType: IncidentType.ROAD_SURFACE_ISSUES,
      requiresLicensePlate: false,
      displayName: 'Road Surface Issues',
      description: 'General road surface problems',
      category: 'location',
      subcategories: ['Damaged pavement', 'Missing lane markings', 'Uneven surface', 'Cracks']
    },
    [IncidentType.TRAFFIC_SIGNAL_PROBLEMS]: {
      incidentType: IncidentType.TRAFFIC_SIGNAL_PROBLEMS,
      requiresLicensePlate: false,
      displayName: 'Traffic Signal Problems',
      description: 'Issues with traffic control devices',
      category: 'location',
      subcategories: ['Broken lights', 'Timing issues', 'Power outage', 'Malfunctioning signals']
    },
    [IncidentType.DANGEROUS_ROAD_CONDITIONS]: {
      incidentType: IncidentType.DANGEROUS_ROAD_CONDITIONS,
      requiresLicensePlate: false,
      displayName: 'Dangerous Road Conditions',
      description: 'Environmental or infrastructure hazards',
      category: 'location',
      subcategories: ['Ice', 'Flooding', 'Construction hazards', 'Poor visibility', 'Missing signs', 'Broken guardrails', 'Streetlight outages']
    },
    [IncidentType.DEBRIS_IN_ROAD]: {
      incidentType: IncidentType.DEBRIS_IN_ROAD,
      requiresLicensePlate: false,
      displayName: 'Debris in Road',
      description: 'Objects blocking or endangering traffic',
      category: 'location',
      subcategories: ['Large objects', 'Construction materials', 'Accident debris', 'Natural debris']
    },
    [IncidentType.DEAD_ANIMALS]: {
      incidentType: IncidentType.DEAD_ANIMALS,
      requiresLicensePlate: false,
      displayName: 'Dead Animals',
      description: 'Roadkill creating driving hazards',
      category: 'location',
      subcategories: []
    },
    [IncidentType.FALLEN_OBSTACLES]: {
      incidentType: IncidentType.FALLEN_OBSTACLES,
      requiresLicensePlate: false,
      displayName: 'Fallen Obstacles',
      description: 'Natural obstacles on roadway',
      category: 'location',
      subcategories: ['Trees', 'Branches', 'Rocks', 'Mudslide']
    },
  };

  return metadata[incidentType] || null;
};

// Get all incident types grouped by category
export const getIncidentTypesByCategory = () => {
  const vehicleTypes: IncidentTypeMetadata[] = [];
  const locationTypes: IncidentTypeMetadata[] = [];

  Object.values(IncidentType).forEach(type => {
    const metadata = getIncidentTypeMetadata(type);
    if (metadata) {
      if (metadata.category === 'vehicle') {
        vehicleTypes.push(metadata);
      } else {
        locationTypes.push(metadata);
      }
    }
  });

  return {
    vehicle: vehicleTypes,
    location: locationTypes
  };
};