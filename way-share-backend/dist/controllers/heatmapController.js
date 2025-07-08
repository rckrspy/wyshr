"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHeatMapTiles = exports.getIncidentStats = exports.getHeatMapData = void 0;
const heatmapService_1 = require("../services/heatmapService");
const getHeatMapData = async (req, res, next) => {
    try {
        const { timeRange = '24h', incidentType } = req.query;
        const data = await heatmapService_1.heatmapService.getHeatMapData(timeRange, incidentType);
        res.json({
            success: true,
            data,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getHeatMapData = getHeatMapData;
const getIncidentStats = async (_req, res, next) => {
    try {
        const stats = await heatmapService_1.heatmapService.getIncidentStats();
        res.json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getIncidentStats = getIncidentStats;
const getHeatMapTiles = async (req, res, next) => {
    try {
        const north = parseFloat(req.query.north);
        const south = parseFloat(req.query.south);
        const east = parseFloat(req.query.east);
        const west = parseFloat(req.query.west);
        const zoom = parseInt(req.query.zoom) || 10;
        if (isNaN(north) || isNaN(south) || isNaN(east) || isNaN(west)) {
            res.status(400).json({
                success: false,
                error: 'Invalid map bounds',
            });
            return;
        }
        const points = await heatmapService_1.heatmapService.getHeatMapTiles({ north, south, east, west }, zoom);
        res.json({
            success: true,
            data: {
                points,
                zoom,
                bounds: { north, south, east, west },
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getHeatMapTiles = getHeatMapTiles;
