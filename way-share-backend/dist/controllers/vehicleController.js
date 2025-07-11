"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVerificationStatus = exports.uploadVerificationDocument = exports.deleteVehicle = exports.getVehicle = exports.getUserVehicles = exports.createVehicle = void 0;
const vehicleVerificationService_1 = require("../services/vehicleVerificationService");
const identityVerificationService_1 = require("../services/identityVerificationService");
const uploadService_1 = require("../services/uploadService");
const createVehicle = async (req, res) => {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        // Check if user has verified identity
        const identityStatus = await identityVerificationService_1.identityVerificationService.getVerificationStatus(req.userId);
        if (!identityStatus.isVerified) {
            res.status(403).json({
                error: 'Identity verification required',
                message: 'Please verify your identity before adding vehicles'
            });
            return;
        }
        const { licensePlate, state, make, model, year, color, vin } = req.body;
        const vehicle = await vehicleVerificationService_1.vehicleVerificationService.createVehicle({
            userId: req.userId,
            licensePlate,
            state,
            make,
            model,
            year,
            color,
            vin
        });
        res.status(201).json({
            message: 'Vehicle added successfully',
            vehicle: {
                id: vehicle.id,
                licensePlate: vehicle.license_plate,
                state: vehicle.state,
                make: vehicle.make,
                model: vehicle.model,
                year: vehicle.year,
                color: vehicle.color,
                status: vehicle.status,
                createdAt: vehicle.created_at
            }
        });
    }
    catch (error) {
        console.error('Create vehicle error:', error);
        if (error instanceof Error && error.message === 'Vehicle already registered') {
            res.status(409).json({ error: 'Vehicle already registered' });
        }
        else {
            res.status(500).json({ error: 'Failed to add vehicle' });
        }
    }
};
exports.createVehicle = createVehicle;
const getUserVehicles = async (req, res) => {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const vehicles = await vehicleVerificationService_1.vehicleVerificationService.getUserVehicles(req.userId);
        res.json({
            vehicles: vehicles.map(v => ({
                id: v.id,
                licensePlate: v.license_plate,
                state: v.state,
                make: v.make,
                model: v.model,
                year: v.year,
                color: v.color,
                status: v.status,
                verifiedAt: v.verified_at,
                expiresAt: v.expires_at,
                createdAt: v.created_at
            }))
        });
    }
    catch (error) {
        console.error('Get vehicles error:', error);
        res.status(500).json({ error: 'Failed to get vehicles' });
    }
};
exports.getUserVehicles = getUserVehicles;
const getVehicle = async (req, res) => {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { id } = req.params;
        const vehicle = await vehicleVerificationService_1.vehicleVerificationService.getVehicle(id, req.userId);
        if (!vehicle) {
            res.status(404).json({ error: 'Vehicle not found' });
            return;
        }
        res.json({
            vehicle: {
                id: vehicle.id,
                licensePlate: vehicle.license_plate,
                state: vehicle.state,
                make: vehicle.make,
                model: vehicle.model,
                year: vehicle.year,
                color: vehicle.color,
                vin: vehicle.vin,
                status: vehicle.status,
                verifiedAt: vehicle.verified_at,
                expiresAt: vehicle.expires_at,
                createdAt: vehicle.created_at
            }
        });
    }
    catch (error) {
        console.error('Get vehicle error:', error);
        res.status(500).json({ error: 'Failed to get vehicle' });
    }
};
exports.getVehicle = getVehicle;
const deleteVehicle = async (req, res) => {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { id } = req.params;
        const deleted = await vehicleVerificationService_1.vehicleVerificationService.deleteVehicle(id, req.userId);
        if (!deleted) {
            res.status(404).json({ error: 'Vehicle not found' });
            return;
        }
        res.json({ message: 'Vehicle deleted successfully' });
    }
    catch (error) {
        console.error('Delete vehicle error:', error);
        res.status(500).json({ error: 'Failed to delete vehicle' });
    }
};
exports.deleteVehicle = deleteVehicle;
const uploadVerificationDocument = async (req, res) => {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { id } = req.params;
        const { documentType } = req.body;
        if (!req.file) {
            res.status(400).json({ error: 'Document file required' });
            return;
        }
        // Validate document type
        if (!['insurance', 'registration', 'title'].includes(documentType)) {
            res.status(400).json({ error: 'Invalid document type' });
            return;
        }
        // Check vehicle ownership
        const vehicle = await vehicleVerificationService_1.vehicleVerificationService.getVehicle(id, req.userId);
        if (!vehicle) {
            res.status(404).json({ error: 'Vehicle not found' });
            return;
        }
        // Upload document to storage (S3 or local)
        const documentUrl = await uploadService_1.uploadService.uploadDocument(req.file, `vehicles/${id}/${documentType}`, req.userId);
        // Get user's verified name for comparison
        const identityStatus = await identityVerificationService_1.identityVerificationService.getVerificationStatus(req.userId);
        const verifiedName = identityStatus.verification?.verified_name || '';
        // Submit for verification
        const verification = await vehicleVerificationService_1.vehicleVerificationService.submitVerificationDocument({
            vehicleId: id,
            documentType: documentType,
            documentUrl,
            verifiedName
        });
        res.json({
            message: 'Document uploaded and submitted for verification',
            verification: {
                id: verification.id,
                documentType: verification.document_type,
                status: verification.status,
                requiresManualReview: verification.manual_review_required,
                confidence: verification.extraction_confidence
            }
        });
    }
    catch (error) {
        console.error('Upload document error:', error);
        res.status(500).json({ error: 'Failed to upload document' });
    }
};
exports.uploadVerificationDocument = uploadVerificationDocument;
const getVerificationStatus = async (req, res) => {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { id } = req.params;
        // Check vehicle ownership
        const vehicle = await vehicleVerificationService_1.vehicleVerificationService.getVehicle(id, req.userId);
        if (!vehicle) {
            res.status(404).json({ error: 'Vehicle not found' });
            return;
        }
        const status = await vehicleVerificationService_1.vehicleVerificationService.getVerificationStatus(id);
        res.json({
            vehicle: {
                id: status.vehicle.id,
                status: status.vehicle.status,
                verifiedAt: status.vehicle.verified_at,
                expiresAt: status.vehicle.expires_at
            },
            verifications: status.verifications.map(v => ({
                id: v.id,
                documentType: v.document_type,
                status: v.status,
                uploadedAt: v.created_at,
                reviewedAt: v.reviewed_at,
                requiresManualReview: v.manual_review_required
            })),
            isVerified: status.isVerified,
            requiresAction: status.requiresAction
        });
    }
    catch (error) {
        console.error('Get verification status error:', error);
        res.status(500).json({ error: 'Failed to get verification status' });
    }
};
exports.getVerificationStatus = getVerificationStatus;
