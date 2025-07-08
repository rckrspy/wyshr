-- Migration: Enhanced Incident Types
-- This migration adds new incident types and makes license plate optional for location-based hazards

-- Add new incident types to existing enum
ALTER TYPE incident_type ADD VALUE IF NOT EXISTS 'parking_violations';
ALTER TYPE incident_type ADD VALUE IF NOT EXISTS 'unsecured_loads';
ALTER TYPE incident_type ADD VALUE IF NOT EXISTS 'littering';
ALTER TYPE incident_type ADD VALUE IF NOT EXISTS 'failure_to_signal';
ALTER TYPE incident_type ADD VALUE IF NOT EXISTS 'impaired_driving';
ALTER TYPE incident_type ADD VALUE IF NOT EXISTS 'reckless_driving';
ALTER TYPE incident_type ADD VALUE IF NOT EXISTS 'rock_chips';
ALTER TYPE incident_type ADD VALUE IF NOT EXISTS 'potholes';
ALTER TYPE incident_type ADD VALUE IF NOT EXISTS 'debris_in_road';
ALTER TYPE incident_type ADD VALUE IF NOT EXISTS 'road_surface_issues';
ALTER TYPE incident_type ADD VALUE IF NOT EXISTS 'traffic_signal_problems';
ALTER TYPE incident_type ADD VALUE IF NOT EXISTS 'dangerous_road_conditions';
ALTER TYPE incident_type ADD VALUE IF NOT EXISTS 'dead_animals';
ALTER TYPE incident_type ADD VALUE IF NOT EXISTS 'fallen_obstacles';

-- Make license plate optional
ALTER TABLE reports ALTER COLUMN license_plate_hash DROP NOT NULL;

-- Add subcategory field
ALTER TABLE reports ADD COLUMN IF NOT EXISTS subcategory VARCHAR(50);

-- Create incident type metadata table
CREATE TABLE IF NOT EXISTS incident_type_metadata (
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
    '["Trees", "Branches", "Rocks", "Mudslide"]'::jsonb)
ON CONFLICT (incident_type) DO UPDATE SET
    requires_license_plate = EXCLUDED.requires_license_plate,
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    subcategories = EXCLUDED.subcategories;

-- Create indexes for the new fields
CREATE INDEX IF NOT EXISTS idx_reports_subcategory ON reports (subcategory) WHERE subcategory IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_incident_metadata_category ON incident_type_metadata (category);

-- Update the heat map function to handle reports without license plates
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