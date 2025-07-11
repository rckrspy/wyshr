import { pool } from './database';
import { ocrService } from './ocrService';
import { AnonymizationService } from '../utils/anonymization';

interface Vehicle {
  id: string;
  user_id: string;
  license_plate: string;
  state: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  vin?: string;
  status: 'pending_verification' | 'verified' | 'rejected' | 'expired';
  verification_document_url?: string;
  verified_at?: Date;
  expires_at?: Date;
  created_at: Date;
  updated_at: Date;
}

interface VehicleVerification {
  id: string;
  vehicle_id: string;
  document_type: 'insurance' | 'registration' | 'title';
  document_url: string;
  document_metadata?: Record<string, unknown>;
  extracted_data?: Record<string, unknown>;
  extracted_name?: string;
  extraction_confidence?: number;
  manual_review_required: boolean;
  reviewed_by?: string;
  reviewed_at?: Date;
  review_notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: Date;
}

interface CreateVehicleDto {
  userId: string;
  licensePlate: string;
  state: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  vin?: string;
}

interface VerifyVehicleDto {
  vehicleId: string;
  documentType: 'insurance' | 'registration' | 'title';
  documentUrl: string;
  verifiedName: string;
}

class VehicleVerificationService {
  /**
   * Create a new vehicle for verification
   */
  async createVehicle(data: CreateVehicleDto): Promise<Vehicle> {
    const { userId, licensePlate, state, make, model, year, color, vin } = data;
    
    // Hash the license plate for storage
    const licensePlateHash = AnonymizationService.hashLicensePlate(licensePlate);
    
    // Check if vehicle already exists
    const existing = await pool.query(
      'SELECT id FROM verified_vehicles WHERE license_plate_hash = $1 AND state = $2',
      [licensePlateHash, state.toUpperCase()]
    );
    
    if (existing.rows.length > 0) {
      throw new Error('Vehicle already registered');
    }
    
    const result = await pool.query(
      `INSERT INTO verified_vehicles 
       (user_id, license_plate, license_plate_hash, state, make, model, year, color, vin, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending_verification')
       RETURNING *`,
      [
        userId,
        licensePlate.toUpperCase(),
        licensePlateHash,
        state.toUpperCase(),
        make,
        model,
        year,
        color,
        vin?.toUpperCase()
      ]
    );
    
    return result.rows[0];
  }

  /**
   * Get all vehicles for a user
   */
  async getUserVehicles(userId: string): Promise<Vehicle[]> {
    const result = await pool.query(
      'SELECT * FROM verified_vehicles WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    return result.rows;
  }

  /**
   * Get a specific vehicle
   */
  async getVehicle(vehicleId: string, userId: string): Promise<Vehicle | null> {
    const result = await pool.query(
      'SELECT * FROM verified_vehicles WHERE id = $1 AND user_id = $2',
      [vehicleId, userId]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Delete a vehicle
   */
  async deleteVehicle(vehicleId: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM verified_vehicles WHERE id = $1 AND user_id = $2',
      [vehicleId, userId]
    );
    
    return (result.rowCount || 0) > 0;
  }

  /**
   * Submit a document for vehicle verification
   */
  async submitVerificationDocument(data: VerifyVehicleDto): Promise<VehicleVerification> {
    const { vehicleId, documentType, documentUrl, verifiedName } = data;
    
    // Get vehicle details
    const vehicleResult = await pool.query(
      'SELECT * FROM verified_vehicles WHERE id = $1',
      [vehicleId]
    );
    
    if (vehicleResult.rows.length === 0) {
      throw new Error('Vehicle not found');
    }
    
    const vehicle = vehicleResult.rows[0];
    
    // Process document with OCR
    const ocrResult = await ocrService.processVehicleDocument(
      documentUrl,
      verifiedName,
      vehicle.license_plate
    );
    
    // Create verification record
    const verificationResult = await pool.query(
      `INSERT INTO vehicle_verifications
       (vehicle_id, document_type, document_url, extracted_data, extracted_name, 
        extraction_confidence, manual_review_required, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        vehicleId,
        documentType,
        documentUrl,
        JSON.stringify(ocrResult.extractedData),
        ocrResult.extractedData.name,
        ocrResult.confidence,
        ocrResult.requiresReview,
        ocrResult.requiresReview ? 'pending' : 'approved'
      ]
    );
    
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
  async getVerificationStatus(vehicleId: string): Promise<{
    vehicle: Vehicle;
    verifications: VehicleVerification[];
    isVerified: boolean;
    requiresAction: boolean;
  }> {
    const vehicleResult = await pool.query(
      'SELECT * FROM verified_vehicles WHERE id = $1',
      [vehicleId]
    );
    
    if (vehicleResult.rows.length === 0) {
      throw new Error('Vehicle not found');
    }
    
    const vehicle = vehicleResult.rows[0];
    
    const verificationsResult = await pool.query(
      'SELECT * FROM vehicle_verifications WHERE vehicle_id = $1 ORDER BY created_at DESC',
      [vehicleId]
    );
    
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
  async approveVehicle(vehicleId: string, expiresInDays: number = 365): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    
    await pool.query(
      `UPDATE verified_vehicles 
       SET status = 'verified', verified_at = NOW(), expires_at = $1, updated_at = NOW()
       WHERE id = $2`,
      [expiresAt, vehicleId]
    );
  }

  /**
   * Reject a vehicle
   */
  async rejectVehicle(vehicleId: string): Promise<void> {
    await pool.query(
      `UPDATE verified_vehicles 
       SET status = 'rejected', updated_at = NOW()
       WHERE id = $1`,
      [vehicleId]
    );
  }

  /**
   * Check if a license plate belongs to a verified vehicle
   */
  async findVerifiedVehicle(licensePlate: string, state: string): Promise<{
    userId: string;
    vehicleId: string;
  } | null> {
    const licensePlateHash = AnonymizationService.hashLicensePlate(licensePlate);
    
    const result = await pool.query(
      `SELECT user_id, id as vehicle_id 
       FROM verified_vehicles 
       WHERE license_plate_hash = $1 
       AND state = $2 
       AND status = 'verified'
       AND (expires_at IS NULL OR expires_at > NOW())`,
      [licensePlateHash, state.toUpperCase()]
    );
    
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
  async getVehiclesRequiringReview(): Promise<Array<{
    id: string;
    user_id: string;
    license_plate: string;
    state: string;
    make?: string;
    model?: string;
    year?: number;
    color?: string;
    vin?: string;
    status: string;
    verification_id: string;
    document_type: string;
    document_url: string;
    extracted_data?: Record<string, unknown>;
    extraction_confidence?: number;
    user_email: string;
    verified_name?: string;
  }>> {
    const result = await pool.query(
      `SELECT 
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
       ORDER BY vr.created_at ASC`
    );
    
    return result.rows;
  }

  /**
   * Submit manual review decision
   */
  async submitReview(
    verificationId: string,
    reviewerId: string,
    decision: 'approved' | 'rejected',
    notes?: string
  ): Promise<void> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update verification record
      const verificationResult = await client.query(
        `UPDATE vehicle_verifications
         SET status = $1, reviewed_by = $2, reviewed_at = NOW(), review_notes = $3
         WHERE id = $4
         RETURNING vehicle_id`,
        [decision, reviewerId, notes, verificationId]
      );
      
      if (verificationResult.rows.length === 0) {
        throw new Error('Verification not found');
      }
      
      const vehicleId = verificationResult.rows[0].vehicle_id;
      
      // Update vehicle status based on decision
      if (decision === 'approved') {
        await this.approveVehicle(vehicleId);
      } else {
        await this.rejectVehicle(vehicleId);
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check and update expired vehicles
   */
  async checkExpiredVehicles(): Promise<number> {
    const result = await pool.query(
      `UPDATE verified_vehicles
       SET status = 'expired', updated_at = NOW()
       WHERE status = 'verified' 
       AND expires_at < NOW()
       RETURNING id`
    );
    
    return result.rowCount || 0;
  }
}

export const vehicleVerificationService = new VehicleVerificationService();