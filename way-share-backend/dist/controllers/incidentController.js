"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIncidentTypeDetails = exports.getIncidentTypes = void 0;
const incidentTypeHelpers_1 = require("../utils/incidentTypeHelpers");
const types_1 = require("../types");
const getIncidentTypes = async (_req, res, _next) => {
    try {
        const incidentTypes = (0, incidentTypeHelpers_1.getIncidentTypesByCategory)();
        res.json({
            success: true,
            data: incidentTypes,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch incident types',
        });
    }
};
exports.getIncidentTypes = getIncidentTypes;
const getIncidentTypeDetails = async (req, res, _next) => {
    try {
        const { type } = req.params;
        if (!Object.values(types_1.IncidentType).includes(type)) {
            res.status(400).json({
                success: false,
                error: 'Invalid incident type',
            });
            return;
        }
        const metadata = (0, incidentTypeHelpers_1.getIncidentTypeMetadata)(type);
        if (!metadata) {
            res.status(404).json({
                success: false,
                error: 'Incident type metadata not found',
            });
            return;
        }
        res.json({
            success: true,
            data: metadata,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch incident type details',
        });
    }
};
exports.getIncidentTypeDetails = getIncidentTypeDetails;
