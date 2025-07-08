"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateHeatMapQuery = exports.validateReportSubmission = void 0;
const errorHandler_1 = require("./errorHandler");
const types_1 = require("../types");
const incidentTypeHelpers_1 = require("../utils/incidentTypeHelpers");
const validateReportSubmission = (req, _res, next) => {
    const { licensePlate, incidentType, subcategory, location, description } = req.body;
    // Validate incident type first
    if (!incidentType || !Object.values(types_1.IncidentType).includes(incidentType)) {
        throw new errorHandler_1.AppError('Valid incident type is required', 400);
    }
    // Check if license plate is required based on incident type
    const licensePlateRequired = (0, incidentTypeHelpers_1.requiresLicensePlate)(incidentType);
    if (licensePlateRequired) {
        if (!licensePlate || typeof licensePlate !== 'string') {
            throw new errorHandler_1.AppError('License plate is required for vehicle-specific incidents', 400);
        }
        // Validate license plate format (basic check)
        if (licensePlate.length < 2 || licensePlate.length > 10) {
            throw new errorHandler_1.AppError('Invalid license plate format', 400);
        }
    }
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
        throw new errorHandler_1.AppError('Valid location coordinates are required', 400);
    }
    // Validate location bounds (San Jose area approximately)
    const { lat, lng } = location;
    if (lat < 37.0 || lat > 37.5 || lng < -122.2 || lng > -121.6) {
        throw new errorHandler_1.AppError('Location must be within San Jose area', 400);
    }
    // Validate optional description length
    if (description && description.length > 500) {
        throw new errorHandler_1.AppError('Description must be 500 characters or less', 400);
    }
    // Validate optional subcategory length
    if (subcategory && subcategory.length > 50) {
        throw new errorHandler_1.AppError('Subcategory must be 50 characters or less', 400);
    }
    next();
};
exports.validateReportSubmission = validateReportSubmission;
const validateHeatMapQuery = (req, _res, next) => {
    const { timeRange, incidentType } = req.query;
    // Validate time range
    if (timeRange) {
        const validTimeRanges = ['24h', '7d', '30d'];
        if (!validTimeRanges.includes(timeRange)) {
            throw new errorHandler_1.AppError('Invalid time range. Use 24h, 7d, or 30d', 400);
        }
    }
    // Validate incident type filter
    if (incidentType && !Object.values(types_1.IncidentType).includes(incidentType)) {
        throw new errorHandler_1.AppError('Invalid incident type filter', 400);
    }
    next();
};
exports.validateHeatMapQuery = validateHeatMapQuery;
