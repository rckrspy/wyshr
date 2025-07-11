-- Run this script to apply the enhanced incident types migration
-- Connect to your database and execute this file

-- First, check current incident types
SELECT unnest(enum_range(NULL::incident_type)) AS current_types;

-- Apply the migration
\i migrations/001_enhanced_incident_types.sql

-- Verify new incident types were added
SELECT unnest(enum_range(NULL::incident_type)) AS updated_types;

-- Check the incident type metadata
SELECT incident_type, requires_license_plate, display_name, category 
FROM incident_type_metadata 
ORDER BY category, display_name;

-- Verify license_plate_hash is now nullable
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'reports' 
AND column_name IN ('license_plate_hash', 'subcategory');

-- Apply v2.0.0 migration for user authentication
\echo 'Applying v2.0.0 - User Authentication migration...'
\i migrations/v2.0.0_user_authentication.sql

-- Verify user tables were created
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'user_sessions')
ORDER BY table_name;

-- Apply v2.1.0 migration for identity verification
\echo 'Applying v2.1.0 - Identity Verification migration...'
\i migrations/v2.1.0_identity_verification.sql

-- Apply v2.2.0 migration for admin system
\echo 'Applying v2.2.0 - Admin System migration...'
\i migrations/v2.2.0_admin_system.sql

-- Apply v2.3.0 migration for private incident management
\echo 'Applying v2.3.0 - Private Incident Management migration...'
\i migrations/v2.3.0_private_incident_management.sql

-- Verify Phase 2.3 tables were created
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('notifications', 'notification_preferences', 'incident_disputes', 'incident_notes')
ORDER BY table_name;

-- Apply v2.4.0 migration for driver score system
\echo 'Applying v2.4.0 - Driver Score System migration...'
\i migrations/v2.4.0_driver_score_system.sql

-- Verify Phase 2.4 tables were created
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('driver_scores', 'score_events', 'incident_weights', 'score_milestones')
ORDER BY table_name;