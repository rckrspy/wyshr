"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncidentType = void 0;
var IncidentType;
(function (IncidentType) {
    // Vehicle-specific incidents (license plate required)
    IncidentType["SPEEDING"] = "speeding";
    IncidentType["TAILGATING"] = "tailgating";
    IncidentType["PHONE_USE"] = "phone_use";
    IncidentType["FAILURE_TO_YIELD"] = "failure_to_yield";
    IncidentType["ILLEGAL_PARKING"] = "illegal_parking";
    IncidentType["ROAD_RAGE"] = "road_rage";
    IncidentType["AGGRESSIVE_DRIVING"] = "aggressive_driving";
    IncidentType["PARKING_VIOLATIONS"] = "parking_violations";
    IncidentType["UNSECURED_LOADS"] = "unsecured_loads";
    IncidentType["LITTERING"] = "littering";
    IncidentType["FAILURE_TO_SIGNAL"] = "failure_to_signal";
    IncidentType["IMPAIRED_DRIVING"] = "impaired_driving";
    IncidentType["RECKLESS_DRIVING"] = "reckless_driving";
    // Location-based hazards (no license plate required)
    IncidentType["ROCK_CHIPS"] = "rock_chips";
    IncidentType["POTHOLES"] = "potholes";
    IncidentType["DEBRIS_IN_ROAD"] = "debris_in_road";
    IncidentType["ROAD_SURFACE_ISSUES"] = "road_surface_issues";
    IncidentType["TRAFFIC_SIGNAL_PROBLEMS"] = "traffic_signal_problems";
    IncidentType["DANGEROUS_ROAD_CONDITIONS"] = "dangerous_road_conditions";
    IncidentType["DEAD_ANIMALS"] = "dead_animals";
    IncidentType["FALLEN_OBSTACLES"] = "fallen_obstacles";
})(IncidentType || (exports.IncidentType = IncidentType = {}));
