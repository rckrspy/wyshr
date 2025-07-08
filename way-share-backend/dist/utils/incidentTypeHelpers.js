"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIncidentTypesByCategory = exports.getIncidentTypeMetadata = exports.requiresLicensePlate = void 0;
const types_1 = require("../types");
// Helper to determine if an incident type requires a license plate
const requiresLicensePlate = (incidentType) => {
    const vehicleSpecificTypes = [
        types_1.IncidentType.SPEEDING,
        types_1.IncidentType.TAILGATING,
        types_1.IncidentType.PHONE_USE,
        types_1.IncidentType.FAILURE_TO_YIELD,
        types_1.IncidentType.ILLEGAL_PARKING,
        types_1.IncidentType.ROAD_RAGE,
        types_1.IncidentType.AGGRESSIVE_DRIVING,
        types_1.IncidentType.PARKING_VIOLATIONS,
        types_1.IncidentType.UNSECURED_LOADS,
        types_1.IncidentType.LITTERING,
        types_1.IncidentType.FAILURE_TO_SIGNAL,
        types_1.IncidentType.IMPAIRED_DRIVING,
        types_1.IncidentType.RECKLESS_DRIVING,
    ];
    return vehicleSpecificTypes.includes(incidentType);
};
exports.requiresLicensePlate = requiresLicensePlate;
// Helper to get incident type metadata
const getIncidentTypeMetadata = (incidentType) => {
    const metadata = {
        // Vehicle-specific incidents
        [types_1.IncidentType.SPEEDING]: {
            incidentType: types_1.IncidentType.SPEEDING,
            requiresLicensePlate: true,
            displayName: 'Speeding',
            description: 'Driving significantly above posted speed limits',
            category: 'vehicle',
            subcategories: []
        },
        [types_1.IncidentType.TAILGATING]: {
            incidentType: types_1.IncidentType.TAILGATING,
            requiresLicensePlate: true,
            displayName: 'Tailgating',
            description: 'Following too closely behind another vehicle',
            category: 'vehicle',
            subcategories: []
        },
        [types_1.IncidentType.PHONE_USE]: {
            incidentType: types_1.IncidentType.PHONE_USE,
            requiresLicensePlate: true,
            displayName: 'Phone Use',
            description: 'Using mobile device while driving',
            category: 'vehicle',
            subcategories: []
        },
        [types_1.IncidentType.FAILURE_TO_YIELD]: {
            incidentType: types_1.IncidentType.FAILURE_TO_YIELD,
            requiresLicensePlate: true,
            displayName: 'Failure to Yield',
            description: 'Not yielding right of way when required',
            category: 'vehicle',
            subcategories: []
        },
        [types_1.IncidentType.ILLEGAL_PARKING]: {
            incidentType: types_1.IncidentType.ILLEGAL_PARKING,
            requiresLicensePlate: true,
            displayName: 'Illegal Parking',
            description: 'Parking in prohibited areas',
            category: 'vehicle',
            subcategories: []
        },
        [types_1.IncidentType.ROAD_RAGE]: {
            incidentType: types_1.IncidentType.ROAD_RAGE,
            requiresLicensePlate: true,
            displayName: 'Road Rage',
            description: 'Aggressive or violent behavior towards other drivers',
            category: 'vehicle',
            subcategories: []
        },
        [types_1.IncidentType.AGGRESSIVE_DRIVING]: {
            incidentType: types_1.IncidentType.AGGRESSIVE_DRIVING,
            requiresLicensePlate: true,
            displayName: 'Aggressive Driving',
            description: 'Dangerous driving behaviors',
            category: 'vehicle',
            subcategories: []
        },
        [types_1.IncidentType.PARKING_VIOLATIONS]: {
            incidentType: types_1.IncidentType.PARKING_VIOLATIONS,
            requiresLicensePlate: true,
            displayName: 'Parking Violations',
            description: 'Various parking infractions',
            category: 'vehicle',
            subcategories: ['Handicap violation', 'Fire zone parking', 'No parking zone', 'Expired meter', 'Blocking driveway', 'Double parking', 'Blocking fire hydrant']
        },
        [types_1.IncidentType.UNSECURED_LOADS]: {
            incidentType: types_1.IncidentType.UNSECURED_LOADS,
            requiresLicensePlate: true,
            displayName: 'Unsecured Loads',
            description: 'Dangerous cargo or equipment',
            category: 'vehicle',
            subcategories: ['Falling debris', 'Improperly secured cargo', 'Overloaded vehicle', 'Loose equipment']
        },
        [types_1.IncidentType.LITTERING]: {
            incidentType: types_1.IncidentType.LITTERING,
            requiresLicensePlate: true,
            displayName: 'Littering',
            description: 'Disposal of trash from vehicle',
            category: 'vehicle',
            subcategories: ['Throwing trash', 'Items falling', 'Cigarette disposal', 'Liquid disposal']
        },
        [types_1.IncidentType.FAILURE_TO_SIGNAL]: {
            incidentType: types_1.IncidentType.FAILURE_TO_SIGNAL,
            requiresLicensePlate: true,
            displayName: 'Failure to Signal',
            description: 'Not using turn signals properly',
            category: 'vehicle',
            subcategories: ['No turn signal', 'No lane change signal', 'Broken signal lights']
        },
        [types_1.IncidentType.IMPAIRED_DRIVING]: {
            incidentType: types_1.IncidentType.IMPAIRED_DRIVING,
            requiresLicensePlate: true,
            displayName: 'Impaired Driving',
            description: 'Suspected intoxication or impairment',
            category: 'vehicle',
            subcategories: ['Suspected DUI', 'Erratic behavior', 'Swerving', 'Inconsistent speed']
        },
        [types_1.IncidentType.RECKLESS_DRIVING]: {
            incidentType: types_1.IncidentType.RECKLESS_DRIVING,
            requiresLicensePlate: true,
            displayName: 'Reckless Driving',
            description: 'Extremely dangerous driving',
            category: 'vehicle',
            subcategories: ['Running red lights', 'Running stop signs', 'Dangerous maneuvers', 'Wrong way driving']
        },
        // Location-based hazards
        [types_1.IncidentType.ROCK_CHIPS]: {
            incidentType: types_1.IncidentType.ROCK_CHIPS,
            requiresLicensePlate: false,
            displayName: 'Rock Chips',
            description: 'Road surface causing windshield damage',
            category: 'location',
            subcategories: []
        },
        [types_1.IncidentType.POTHOLES]: {
            incidentType: types_1.IncidentType.POTHOLES,
            requiresLicensePlate: false,
            displayName: 'Potholes',
            description: 'Road surface hazards requiring repair',
            category: 'location',
            subcategories: []
        },
        [types_1.IncidentType.ROAD_SURFACE_ISSUES]: {
            incidentType: types_1.IncidentType.ROAD_SURFACE_ISSUES,
            requiresLicensePlate: false,
            displayName: 'Road Surface Issues',
            description: 'General road surface problems',
            category: 'location',
            subcategories: ['Damaged pavement', 'Missing lane markings', 'Uneven surface', 'Cracks']
        },
        [types_1.IncidentType.TRAFFIC_SIGNAL_PROBLEMS]: {
            incidentType: types_1.IncidentType.TRAFFIC_SIGNAL_PROBLEMS,
            requiresLicensePlate: false,
            displayName: 'Traffic Signal Problems',
            description: 'Issues with traffic control devices',
            category: 'location',
            subcategories: ['Broken lights', 'Timing issues', 'Power outage', 'Malfunctioning signals']
        },
        [types_1.IncidentType.DANGEROUS_ROAD_CONDITIONS]: {
            incidentType: types_1.IncidentType.DANGEROUS_ROAD_CONDITIONS,
            requiresLicensePlate: false,
            displayName: 'Dangerous Road Conditions',
            description: 'Environmental or infrastructure hazards',
            category: 'location',
            subcategories: ['Ice', 'Flooding', 'Construction hazards', 'Poor visibility', 'Missing signs', 'Broken guardrails', 'Streetlight outages']
        },
        [types_1.IncidentType.DEBRIS_IN_ROAD]: {
            incidentType: types_1.IncidentType.DEBRIS_IN_ROAD,
            requiresLicensePlate: false,
            displayName: 'Debris in Road',
            description: 'Objects blocking or endangering traffic',
            category: 'location',
            subcategories: ['Large objects', 'Construction materials', 'Accident debris', 'Natural debris']
        },
        [types_1.IncidentType.DEAD_ANIMALS]: {
            incidentType: types_1.IncidentType.DEAD_ANIMALS,
            requiresLicensePlate: false,
            displayName: 'Dead Animals',
            description: 'Roadkill creating driving hazards',
            category: 'location',
            subcategories: []
        },
        [types_1.IncidentType.FALLEN_OBSTACLES]: {
            incidentType: types_1.IncidentType.FALLEN_OBSTACLES,
            requiresLicensePlate: false,
            displayName: 'Fallen Obstacles',
            description: 'Natural obstacles on roadway',
            category: 'location',
            subcategories: ['Trees', 'Branches', 'Rocks', 'Mudslide']
        },
    };
    return metadata[incidentType] || null;
};
exports.getIncidentTypeMetadata = getIncidentTypeMetadata;
// Get all incident types grouped by category
const getIncidentTypesByCategory = () => {
    const vehicleTypes = [];
    const locationTypes = [];
    Object.values(types_1.IncidentType).forEach(type => {
        const metadata = (0, exports.getIncidentTypeMetadata)(type);
        if (metadata) {
            if (metadata.category === 'vehicle') {
                vehicleTypes.push(metadata);
            }
            else {
                locationTypes.push(metadata);
            }
        }
    });
    return {
        vehicle: vehicleTypes,
        location: locationTypes
    };
};
exports.getIncidentTypesByCategory = getIncidentTypesByCategory;
