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