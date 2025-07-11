"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleVerificationService = void 0;
const database_1 = require("./database");
const ocrService_1 = require("./ocrService");
const anonymization_1 = require("../utils/anonymization");
class VehicleVerificationService {
    /**
     * Create a new vehicle for verification
     */
    async createVehicle(data) {
        const { userId, licensePlate, state, make, model, year, color, vin } = data;
        // Hash the license plate for storage
        const licensePlateHash = anonymization_1.AnonymizationService.hashLicensePlate(licensePlate);
        // Check if vehicle already exists
        const existing = await database_1.pool.query('SELECT id FROM verified_vehicles WHERE license_plate_hash = $1 AND state = $2', [licensePlateHash, state.toUpperCase()]);
        if (existing.rows.length > 0) {
            throw new Error('Vehicle already registered');
        }
        const result = await database_1.pool.query(`INSERT INTO verified_vehicles 
       (user_id, license_plate, license_plate_hash, state, make, model, year, color, vin, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending_verification')
       RETURNING *`, [
            userId,
            licensePlate.toUpperCase(),
            licensePlateHash,
            state.toUpperCase(),
            make,
            model,
            year,
            color,
            vin?.toUpperCase()
        ]);
        return result.rows[0];
    }
    /**
     * Get all vehicles for a user
     */
    async getUserVehicles(userId) {
        const result = await database_1.pool.query('SELECT * FROM verified_vehicles WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        return result.rows;
    }
    /**
     * Get a specific vehicle
     */
    async getVehicle(vehicleId, userId) {
        const result = await database_1.pool.query('SELECT * FROM verified_vehicles WHERE id = $1 AND user_id = $2', [vehicleId, userId]);
        return result.rows.length > 0 ? result.rows[0] : null;
    }
    /**
     * Delete a vehicle
     */
    async deleteVehicle(vehicleId, userId) {
        const result = await database_1.pool.query('DELETE FROM verified_vehicles WHERE id = $1 AND user_id = $2', [vehicleId, userId]);
        return (result.rowCount || 0) > 0;
    }
    /**
     * Submit a document for vehicle verification
     */
    async submitVerificationDocument(data) {
        const { vehicleId, documentType, documentUrl, verifiedName } = data;
        // Get vehicle details
        const vehicleResult = await database_1.pool.query('SELECT * FROM verified_vehicles WHERE id = $1', [vehicleId]);
        if (vehicleResult.rows.length === 0) {
            throw new Error('Vehicle not found');
        }
        const vehicle = vehicleResult.rows[0];
        // Process document with OCR
        const ocrResult = await ocrService_1.ocrService.processVehicleDocument(documentUrl, verifiedName, vehicle.license_plate);
        // Create verification record
        const verificationResult = await database_1.pool.query(`INSERT INTO vehicle_verifications
       (vehicle_id, document_type, document_url, extracted_data, extracted_name, 
        extraction_confidence, manual_review_required, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`, [
            vehicleId,
            documentType,
            documentUrl,
            JSON.stringify(ocrResult.extractedData),
            ocrResult.extractedData.name,
            ocrResult.confidence,
            ocrResult.requiresReview,
            ocrResult.requiresReview ? 'pending' : 'approved'
        ]);
        const verification = verificationResult.rows[0];
        // If auto-approved, update vehicle status
        if (!ocrResult.requiresReview && ocrResult.success) {
            await this.approveVehicle(vehicleId);
        }
        return verification;
    }
    /**
     * Get verification status for a vehicle
     */
    async getVerificationStatus(vehicleId) {
        const vehicleResult = await database_1.pool.query('SELECT * FROM verified_vehicles WHERE id = $1', [vehicleId]);
        if (vehicleResult.rows.length === 0) {
            throw new Error('Vehicle not found');
        }
        const vehicle = vehicleResult.rows[0];
        const verificationsResult = await database_1.pool.query('SELECT * FROM vehicle_verifications WHERE vehicle_id = $1 ORDER BY created_at DESC', [vehicleId]);
        const verifications = verificationsResult.rows;
        const isVerified = vehicle.status === 'verified';
        const requiresAction = verifications.some(v => v.status === 'pending');
        return {
            vehicle,
            verifications,
            isVerified,
            requiresAction
        };
    }
    /**
     * Approve a vehicle (internal use or admin)
     */
    async approveVehicle(vehicleId, expiresInDays = 365) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);
        await database_1.pool.query(`UPDATE verified_vehicles 
       SET status = 'verified', verified_at = NOW(), expires_at = $1, updated_at = NOW()
       WHERE id = $2`, [expiresAt, vehicleId]);
    }
    /**
     * Reject a vehicle
     */
    async rejectVehicle(vehicleId) {
        await database_1.pool.query(`UPDATE verified_vehicles 
       SET status = 'rejected', updated_at = NOW()
       WHERE id = $1`, [vehicleId]);
    }
    /**
     * Check if a license plate belongs to a verified vehicle
     */
    async findVerifiedVehicle(licensePlate, state) {
        const licensePlateHash = anonymization_1.AnonymizationService.hashLicensePlate(licensePlate);
        const result = await database_1.pool.query(`SELECT user_id, id as vehicle_id 
       FROM verified_vehicles 
       WHERE license_plate_hash = $1 
       AND state = $2 
       AND status = 'verified'
       AND (expires_at IS NULL OR expires_at > NOW())`, [licensePlateHash, state.toUpperCase()]);
        if (result.rows.length > 0) {
            return {
                userId: result.rows[0].user_id,
                vehicleId: result.rows[0].vehicle_id
            };
        }
        return null;
    }
    /**
     * Get vehicles requiring manual review
     */
    async getVehiclesRequiringReview() {
        const result = await database_1.pool.query(`SELECT 
        vv.*,
        vr.id as verification_id,
        vr.document_type,
        vr.document_url,
        vr.extracted_data,
        vr.extraction_confidence,
        u.email as user_email,
        iv.verified_name
       FROM vehicle_verifications vr
       JOIN verified_vehicles vv ON vr.vehicle_id = vv.id
       JOIN users u ON vv.user_id = u.id
       LEFT JOIN identity_verifications iv ON u.identity_verification_id = iv.id
       WHERE vr.manual_review_required = true 
       AND vr.status = 'pending'
       ORDER BY vr.created_at ASC`);
        return result.rows;
    }
    /**
     * Submit manual review decision
     */
    async submitReview(verificationId, reviewerId, decision, notes) {
        const client = await database_1.pool.connect();
        try {
            await client.query('BEGIN');
            // Update verification record
            const verificationResult = await client.query(`UPDATE vehicle_verifications
         SET status = $1, reviewed_by = $2, reviewed_at = NOW(), review_notes = $3
         WHERE id = $4
         RETURNING vehicle_id`, [decision, reviewerId, notes, verificationId]);
            if (verificationResult.rows.length === 0) {
                throw new Error('Verification not found');
            }
            const vehicleId = verificationResult.rows[0].vehicle_id;
            // Update vehicle status based on decision
            if (decision === 'approved') {
                await this.approveVehicle(vehicleId);
            }
            else {
                await this.rejectVehicle(vehicleId);
            }
            await client.query('COMMIT');
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    /**
     * Check and update expired vehicles
     */
    async checkExpiredVehicles() {
        const result = await database_1.pool.query(`UPDATE verified_vehicles
       SET status = 'expired', updated_at = NOW()
       WHERE status = 'verified' 
       AND expires_at < NOW()
       RETURNING id`);
        return result.rowCount || 0;
    }
}
exports.vehicleVerificationService = new VehicleVerificationService();
