-- Way-Share v2.1.0: Identity Verification Tables
-- Phase 2.2: Identity & Vehicle Verification

-- Create identity verification table for Stripe Identity integration
CREATE TABLE IF NOT EXISTS identity_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stripe_verification_id VARCHAR(255) UNIQUE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'processing', 'verified', 'failed', 'cancelled')),
    verified_name VARCHAR(255),
    verified_at TIMESTAMP,
    failure_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Update users table to track identity verification
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS identity_verification_id UUID REFERENCES identity_verifications(id);

-- Create verified vehicles table
CREATE TABLE IF NOT EXISTS verified_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    license_plate VARCHAR(15) NOT NULL,
    license_plate_hash VARCHAR(64) NOT NULL, -- SHA-256 hash for quick lookups
    state VARCHAR(2) NOT NULL,
    make VARCHAR(50),
    model VARCHAR(50),
    year INTEGER CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
    color VARCHAR(30),
    vin VARCHAR(17),
    status VARCHAR(50) DEFAULT 'pending_verification' CHECK (status IN ('pending_verification', 'verified', 'rejected', 'expired')),
    verification_document_url TEXT,
    verified_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(license_plate_hash, state)
);

-- Create vehicle verification documents table
CREATE TABLE IF NOT EXISTS vehicle_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES verified_vehicles(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('insurance', 'registration', 'title')),
    document_url TEXT NOT NULL,
    document_metadata JSONB DEFAULT '{}',
    extracted_data JSONB DEFAULT '{}',
    extracted_name VARCHAR(255),
    extraction_confidence DECIMAL(3,2) CHECK (extraction_confidence >= 0 AND extraction_confidence <= 1),
    manual_review_required BOOLEAN DEFAULT FALSE,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    review_notes TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_identity_verifications_user_id ON identity_verifications(user_id);
CREATE INDEX idx_identity_verifications_status ON identity_verifications(status);
CREATE INDEX idx_identity_verifications_stripe_id ON identity_verifications(stripe_verification_id);

CREATE INDEX idx_verified_vehicles_user_id ON verified_vehicles(user_id);
CREATE INDEX idx_verified_vehicles_plate_hash ON verified_vehicles(license_plate_hash, state);
CREATE INDEX idx_verified_vehicles_status ON verified_vehicles(status);
CREATE INDEX idx_verified_vehicles_expires ON verified_vehicles(expires_at) WHERE expires_at IS NOT NULL;

CREATE INDEX idx_vehicle_verifications_vehicle_id ON vehicle_verifications(vehicle_id);
CREATE INDEX idx_vehicle_verifications_status ON vehicle_verifications(status);
CREATE INDEX idx_vehicle_verifications_manual_review ON vehicle_verifications(manual_review_required) WHERE manual_review_required = TRUE;

-- Add update triggers
CREATE TRIGGER update_identity_verifications_updated_at BEFORE UPDATE ON identity_verifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verified_vehicles_updated_at BEFORE UPDATE ON verified_vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE identity_verifications IS 'Stores Stripe Identity verification sessions and results';
COMMENT ON COLUMN identity_verifications.stripe_verification_id IS 'Stripe Identity verification session ID';
COMMENT ON COLUMN identity_verifications.metadata IS 'Additional data from Stripe Identity webhook';

COMMENT ON TABLE verified_vehicles IS 'Vehicles verified as owned by authenticated users';
COMMENT ON COLUMN verified_vehicles.license_plate_hash IS 'SHA-256 hash of license plate for privacy-preserving lookups';
COMMENT ON COLUMN verified_vehicles.expires_at IS 'When verification expires (e.g., insurance expiry)';

COMMENT ON TABLE vehicle_verifications IS 'Documents submitted for vehicle ownership verification';
COMMENT ON COLUMN vehicle_verifications.extracted_data IS 'OCR-extracted data from document';
COMMENT ON COLUMN vehicle_verifications.extraction_confidence IS 'OCR confidence score (0-1)';

-- Verification queries
SELECT 
    'Identity verification tables created' as status,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'identity_verifications') as identity_verifications_exists,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'verified_vehicles') as verified_vehicles_exists,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'vehicle_verifications') as vehicle_verifications_exists;