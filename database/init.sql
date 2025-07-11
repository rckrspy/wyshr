-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for incident types
CREATE TYPE incident_type AS ENUM (
    'speeding',
    'tailgating',
    'phone_use',
    'failure_to_yield',
    'illegal_parking',
    'road_rage',
    'aggressive_driving',
    'parking_violations',
    'unsecured_loads',
    'littering',
    'failure_to_signal',
    'impaired_driving',
    'reckless_driving',
    'rock_chips',
    'potholes',
    'debris_in_road',
    'road_surface_issues',
    'traffic_signal_problems',
    'dangerous_road_conditions',
    'dead_animals',
    'fallen_obstacles'
);

-- Create reports table (MVP - anonymous reports only)
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(32) NOT NULL,
    license_plate_hash VARCHAR(16), -- Now optional for location-based hazards
    incident_type incident_type NOT NULL,
    subcategory VARCHAR(50),
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    rounded_location GEOGRAPHY(POINT, 4326) NOT NULL,
    description TEXT,
    media_url TEXT,
    city VARCHAR(100) DEFAULT 'San Jose',
    state VARCHAR(2) DEFAULT 'CA',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_reports_created_at ON reports (created_at DESC);
CREATE INDEX idx_reports_incident_type ON reports (incident_type);
CREATE INDEX idx_reports_license_plate_hash ON reports (license_plate_hash) WHERE license_plate_hash IS NOT NULL;
CREATE INDEX idx_reports_subcategory ON reports (subcategory) WHERE subcategory IS NOT NULL;

-- Spatial index for location queries
CREATE INDEX idx_reports_location ON reports USING GIST (location);
CREATE INDEX idx_reports_rounded_location ON reports USING GIST (rounded_location);

-- Index for heat map queries
CREATE INDEX idx_reports_heatmap ON reports (created_at DESC, incident_type);

-- Create view for heat map data (aggregated by rounded location)
CREATE OR REPLACE VIEW heatmap_data AS
SELECT 
    ST_X(rounded_location::geometry) AS lng,
    ST_Y(rounded_location::geometry) AS lat,
    COUNT(*) AS report_count,
    incident_type,
    DATE_TRUNC('hour', created_at) AS hour_bucket
FROM reports
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY rounded_location, incident_type, hour_bucket;

-- Function to round coordinates to nearest 100m (approximately 0.001 degrees)
CREATE OR REPLACE FUNCTION round_coordinates(lat DOUBLE PRECISION, lng DOUBLE PRECISION)
RETURNS GEOGRAPHY AS $$
BEGIN
    RETURN ST_SetSRID(
        ST_MakePoint(
            ROUND(lng::numeric, 3),
            ROUND(lat::numeric, 3)
        ),
        4326
    )::geography;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get heat map data with time filtering
CREATE OR REPLACE FUNCTION get_heatmap_data(
    time_range INTERVAL DEFAULT INTERVAL '24 hours',
    filter_incident_type incident_type DEFAULT NULL
)
RETURNS TABLE (
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    count BIGINT,
    incident_types JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ST_Y(rounded_location::geometry) AS lat,
        ST_X(rounded_location::geometry) AS lng,
        COUNT(*) AS count,
        jsonb_object_agg(r.incident_type::text, incident_count) AS incident_types
    FROM (
        SELECT 
            rounded_location,
            incident_type,
            COUNT(*) AS incident_count
        FROM reports
        WHERE 
            created_at > NOW() - time_range
            AND (filter_incident_type IS NULL OR incident_type = filter_incident_type)
        GROUP BY rounded_location, incident_type
    ) r
    GROUP BY rounded_location;
END;
$$ LANGUAGE plpgsql;

-- Create incident type metadata table
CREATE TABLE incident_type_metadata (
    incident_type incident_type PRIMARY KEY,
    requires_license_plate BOOLEAN NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    subcategories JSONB,
    category VARCHAR(50) NOT NULL
);

-- Insert metadata for all incident types
INSERT INTO incident_type_metadata (incident_type, requires_license_plate, display_name, description, category, subcategories) VALUES
-- Existing vehicle-specific incidents
('speeding', true, 'Speeding', 'Driving significantly above posted speed limits', 'vehicle', '[]'::jsonb),
('tailgating', true, 'Tailgating', 'Following too closely behind another vehicle', 'vehicle', '[]'::jsonb),
('phone_use', true, 'Phone Use', 'Using mobile device while driving', 'vehicle', '[]'::jsonb),
('failure_to_yield', true, 'Failure to Yield', 'Not yielding right of way when required', 'vehicle', '[]'::jsonb),
('road_rage', true, 'Road Rage', 'Aggressive or violent behavior towards other drivers', 'vehicle', '[]'::jsonb),
('aggressive_driving', true, 'Aggressive Driving', 'Dangerous driving behaviors', 'vehicle', '[]'::jsonb),
('illegal_parking', true, 'Illegal Parking', 'Parking in prohibited areas', 'vehicle', '[]'::jsonb),

-- New vehicle-specific incidents with subcategories
('parking_violations', true, 'Parking Violations', 'Various parking infractions', 'vehicle', 
    '["Handicap violation", "Fire zone parking", "No parking zone", "Expired meter", "Blocking driveway", "Double parking", "Blocking fire hydrant"]'::jsonb),
('unsecured_loads', true, 'Unsecured Loads', 'Dangerous cargo or equipment', 'vehicle',
    '["Falling debris", "Improperly secured cargo", "Overloaded vehicle", "Loose equipment"]'::jsonb),
('littering', true, 'Littering', 'Disposal of trash from vehicle', 'vehicle',
    '["Throwing trash", "Items falling", "Cigarette disposal", "Liquid disposal"]'::jsonb),
('failure_to_signal', true, 'Failure to Signal', 'Not using turn signals properly', 'vehicle',
    '["No turn signal", "No lane change signal", "Broken signal lights"]'::jsonb),
('impaired_driving', true, 'Impaired Driving', 'Suspected intoxication or impairment', 'vehicle',
    '["Suspected DUI", "Erratic behavior", "Swerving", "Inconsistent speed"]'::jsonb),
('reckless_driving', true, 'Reckless Driving', 'Extremely dangerous driving', 'vehicle',
    '["Running red lights", "Running stop signs", "Dangerous maneuvers", "Wrong way driving"]'::jsonb),

-- Location-based hazards (no license plate required)
('rock_chips', false, 'Rock Chips', 'Road surface causing windshield damage', 'location', '[]'::jsonb),
('potholes', false, 'Potholes', 'Road surface hazards requiring repair', 'location', '[]'::jsonb),
('road_surface_issues', false, 'Road Surface Issues', 'General road surface problems', 'location',
    '["Damaged pavement", "Missing lane markings", "Uneven surface", "Cracks"]'::jsonb),
('traffic_signal_problems', false, 'Traffic Signal Problems', 'Issues with traffic control devices', 'location',
    '["Broken lights", "Timing issues", "Power outage", "Malfunctioning signals"]'::jsonb),
('dangerous_road_conditions', false, 'Dangerous Road Conditions', 'Environmental or infrastructure hazards', 'location',
    '["Ice", "Flooding", "Construction hazards", "Poor visibility", "Missing signs", "Broken guardrails", "Streetlight outages"]'::jsonb),
('debris_in_road', false, 'Debris in Road', 'Objects blocking or endangering traffic', 'location',
    '["Large objects", "Construction materials", "Accident debris", "Natural debris"]'::jsonb),
('dead_animals', false, 'Dead Animals', 'Roadkill creating driving hazards', 'location', '[]'::jsonb),
('fallen_obstacles', false, 'Fallen Obstacles', 'Natural obstacles on roadway', 'location',
    '["Trees", "Branches", "Rocks", "Mudslide"]'::jsonb);

-- Create index for the metadata table
CREATE INDEX idx_incident_metadata_category ON incident_type_metadata (category);

-- Sample data for testing (remove in production)
INSERT INTO reports (
    session_id, 
    license_plate_hash, 
    incident_type, 
    location, 
    rounded_location,
    description
) VALUES 
    ('test123', 'a1b2c3d4', 'speeding', 
     ST_SetSRID(ST_MakePoint(-121.8863, 37.3382), 4326),
     round_coordinates(37.3382, -121.8863),
     'Vehicle speeding through school zone'),
    ('test124', 'e5f6g7h8', 'phone_use', 
     ST_SetSRID(ST_MakePoint(-121.9000, 37.3350), 4326),
     round_coordinates(37.3350, -121.9000),
     'Driver texting while driving'),
    ('test125', 'i9j0k1l2', 'tailgating', 
     ST_SetSRID(ST_MakePoint(-121.8950, 37.3400), 4326),
     round_coordinates(37.3400, -121.8950),
     'Following too closely on highway');

-- Create application role for migrations
CREATE ROLE wayshare_app WITH LOGIN;

-- Apply Phase 2 migrations
\echo 'Applying Phase 2 migrations...'

-- Apply v2.0.0 migration for user authentication
\echo 'Applying v2.0.0 - User Authentication migration...'
\i /docker-entrypoint-initdb.d/migrations/v2.0.0_user_authentication.sql

-- Apply v2.1.0 migration for identity verification
\echo 'Applying v2.1.0 - Identity Verification migration...'
\i /docker-entrypoint-initdb.d/migrations/v2.1.0_identity_verification.sql

-- Apply v2.2.0 migration for admin system
\echo 'Applying v2.2.0 - Admin System migration...'
\i /docker-entrypoint-initdb.d/migrations/v2.2.0_admin_system.sql

-- Apply v2.3.0 migration for private incident management
\echo 'Applying v2.3.0 - Private Incident Management migration...'
\i /docker-entrypoint-initdb.d/migrations/v2.3.0_private_incident_management.sql

-- Apply v2.4.0 migration for driver score system
\echo 'Applying v2.4.0 - Driver Score System migration...'
\i /docker-entrypoint-initdb.d/migrations/v2.4.0_driver_score_system.sql

\echo 'Phase 2 migrations complete!'