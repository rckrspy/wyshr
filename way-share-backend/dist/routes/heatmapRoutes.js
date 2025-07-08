"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const heatmapController_1 = require("../controllers/heatmapController");
const validation_1 = require("../middleware/validation");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
// Get heat map data
router.get('/data', validation_1.validateHeatMapQuery, (0, errorHandler_1.asyncHandler)(heatmapController_1.getHeatMapData));
// Get incident statistics
router.get('/stats', (0, errorHandler_1.asyncHandler)(heatmapController_1.getIncidentStats));
exports.default = router;
