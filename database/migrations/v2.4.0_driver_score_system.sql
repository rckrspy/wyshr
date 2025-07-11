-- Way-Share Database Migration v2.4.0
-- Driver Score System Implementation
-- This migration adds the driver scoring system with score tracking,
-- event logging, and incident weight configuration

BEGIN;

-- Driver scores table for tracking current and historical scores
CREATE TABLE driver_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_score INTEGER NOT NULL DEFAULT 80 CHECK (current_score >= 0 AND current_score <= 100),
    previous_score INTEGER CHECK (previous_score >= 0 AND previous_score <= 100),
    score_updated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Score events table for tracking all score-impacting events
CREATE TABLE score_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('incident_reported', 'dispute_resolved', 'time_elapsed', 'manual_adjustment')),
    report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
    dispute_id UUID REFERENCES incident_disputes(id) ON DELETE SET NULL,
    score_impact INTEGER NOT NULL, -- Positive or negative impact on score
    description TEXT,
    previous_score INTEGER NOT NULL,
    new_score INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Incident weights table for configurable scoring rules
CREATE TABLE incident_weights (
    incident_type incident_type PRIMARY KEY,
    base_penalty INTEGER NOT NULL CHECK (base_penalty >= 0 AND base_penalty <= 50),
    severity_multiplier DECIMAL(3,2) DEFAULT 1.0 CHECK (severity_multiplier >= 0.5 AND severity_multiplier <= 3.0),
    category VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Score milestones table for gamification
CREATE TABLE score_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    milestone_type VARCHAR(50) NOT NULL CHECK (milestone_type IN ('perfect_score', 'improvement', 'streak', 'recovery')),
    milestone_value INTEGER NOT NULL,
    achieved_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, milestone_type, milestone_value)
);

-- Create indexes for performance
CREATE INDEX idx_driver_scores_user_id ON driver_scores(user_id);
CREATE INDEX idx_score_events_user_id ON score_events(user_id);
CREATE INDEX idx_score_events_created_at ON score_events(created_at);
CREATE INDEX idx_score_events_report_id ON score_events(report_id) WHERE report_id IS NOT NULL;
CREATE INDEX idx_score_milestones_user_id ON score_milestones(user_id);

-- Insert default incident weights based on severity
INSERT INTO incident_weights (incident_type, base_penalty, severity_multiplier, category, description) VALUES
-- Vehicle incidents (higher penalties)
('speeding', 10, 1.5, 'Vehicle', 'Exceeding posted speed limits'),
('aggressive_driving', 15, 2.0, 'Vehicle', 'Dangerous or aggressive driving behavior'),
('phone_use', 12, 1.8, 'Vehicle', 'Using phone while driving'),
('failure_to_yield', 10, 1.5, 'Vehicle', 'Failure to yield right of way'),
('illegal_parking', 5, 1.0, 'Vehicle', 'Illegal parking violations'),
('parking_violations', 5, 1.0, 'Vehicle', 'General parking violations'),
('failure_to_signal', 5, 1.0, 'Vehicle', 'Failure to signal turns or lane changes'),
('tailgating', 8, 1.5, 'Vehicle', 'Following too closely'),
('road_rage', 20, 2.5, 'Vehicle', 'Aggressive road rage behavior'),
('reckless_driving', 15, 2.0, 'Vehicle', 'Reckless driving behavior'),
('impaired_driving', 20, 2.5, 'Vehicle', 'Driving while impaired'),
('unsecured_loads', 8, 1.2, 'Vehicle', 'Unsecured cargo or loads'),
('littering', 3, 1.0, 'Vehicle', 'Throwing trash from vehicle'),
-- Infrastructure incidents (no penalties)
('potholes', 0, 1.0, 'Infrastructure', 'Road surface damage'),
('debris_in_road', 0, 1.0, 'Infrastructure', 'Debris on roadway'),
('road_surface_issues', 0, 1.0, 'Infrastructure', 'General road surface problems'),
('traffic_signal_problems', 0, 1.0, 'Infrastructure', 'Non-functioning traffic signals'),
('dangerous_road_conditions', 0, 1.0, 'Infrastructure', 'Hazardous road conditions'),
('dead_animals', 0, 1.0, 'Infrastructure', 'Dead animals on roadway'),
('fallen_obstacles', 0, 1.0, 'Infrastructure', 'Fallen trees or obstacles'),
('rock_chips', 0, 1.0, 'Infrastructure', 'Rock chip hazards');

-- Create function to calculate time-based score recovery
CREATE OR REPLACE FUNCTION calculate_score_recovery(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    last_incident_date TIMESTAMP;
    days_without_incident INTEGER;
    recovery_points INTEGER;
BEGIN
    -- Get the date of the last incident for this user
    SELECT MAX(created_at) INTO last_incident_date
    FROM reports
    WHERE owner_user_id = user_id;
    
    -- If no incidents, check when user was created
    IF last_incident_date IS NULL THEN
        SELECT created_at INTO last_incident_date
        FROM users
        WHERE id = user_id;
    END IF;
    
    -- Calculate days without incident
    days_without_incident := EXTRACT(DAY FROM NOW() - last_incident_date)::INTEGER;
    
    -- Award 1 point per 30 days without incident, max 20 points
    recovery_points := LEAST(FLOOR(days_without_incident / 30.0)::INTEGER, 20);
    
    RETURN recovery_points;
END;
$$ LANGUAGE plpgsql;

-- Create function to initialize driver score for new verified users
CREATE OR REPLACE FUNCTION initialize_driver_score()
RETURNS TRIGGER AS $$
BEGIN
    -- When a user's identity is verified, create their initial driver score
    IF NEW.identity_verified = TRUE AND OLD.identity_verified = FALSE THEN
        INSERT INTO driver_scores (user_id, current_score, previous_score)
        VALUES (NEW.id, 80, 80)
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-initialize driver scores
CREATE TRIGGER init_driver_score_on_verification
    AFTER UPDATE OF identity_verified ON users
    FOR EACH ROW
    WHEN (NEW.identity_verified = TRUE)
    EXECUTE FUNCTION initialize_driver_score();

-- Create view for driver score analytics
CREATE VIEW driver_score_analytics AS
WITH score_stats AS (
    SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY current_score) as median_score
    FROM driver_scores
)
SELECT 
    ds.user_id,
    ds.current_score,
    ds.score_updated_at,
    COUNT(DISTINCT se.id) as total_events,
    COUNT(DISTINCT CASE WHEN se.event_type = 'incident_reported' THEN se.id END) as incident_count,
    COUNT(DISTINCT CASE WHEN se.event_type = 'dispute_resolved' THEN se.id END) as disputes_won,
    COALESCE(SUM(CASE WHEN se.score_impact < 0 THEN se.score_impact ELSE 0 END), 0) as total_penalties,
    COALESCE(SUM(CASE WHEN se.score_impact > 0 THEN se.score_impact ELSE 0 END), 0) as total_recoveries,
    ss.median_score,
    PERCENT_RANK() OVER (ORDER BY ds.current_score) as score_percentile
FROM driver_scores ds
LEFT JOIN score_events se ON ds.user_id = se.user_id
CROSS JOIN score_stats ss
GROUP BY ds.user_id, ds.current_score, ds.score_updated_at, ss.median_score;

-- Create stored procedure for updating driver scores
CREATE OR REPLACE PROCEDURE update_driver_score(
    p_user_id UUID,
    p_event_type VARCHAR(50),
    p_score_impact INTEGER,
    p_description TEXT,
    p_report_id UUID DEFAULT NULL,
    p_dispute_id UUID DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_score INTEGER;
    v_new_score INTEGER;
BEGIN
    -- Get current score
    SELECT current_score INTO v_current_score
    FROM driver_scores
    WHERE user_id = p_user_id
    FOR UPDATE;
    
    -- If no score exists, initialize it
    IF v_current_score IS NULL THEN
        INSERT INTO driver_scores (user_id, current_score, previous_score)
        VALUES (p_user_id, 80, 80);
        v_current_score := 80;
    END IF;
    
    -- Calculate new score (ensure it stays within 0-100)
    v_new_score := GREATEST(0, LEAST(100, v_current_score + p_score_impact));
    
    -- Update driver score
    UPDATE driver_scores
    SET previous_score = current_score,
        current_score = v_new_score,
        score_updated_at = NOW(),
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Log the event
    INSERT INTO score_events (
        user_id, event_type, report_id, dispute_id,
        score_impact, description, previous_score, new_score
    ) VALUES (
        p_user_id, p_event_type, p_report_id, p_dispute_id,
        p_score_impact, p_description, v_current_score, v_new_score
    );
    
    -- Check for milestones
    IF v_new_score = 100 AND v_current_score < 100 THEN
        INSERT INTO score_milestones (user_id, milestone_type, milestone_value)
        VALUES (p_user_id, 'perfect_score', 100)
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF v_new_score > v_current_score AND v_current_score < 50 AND v_new_score >= 50 THEN
        INSERT INTO score_milestones (user_id, milestone_type, milestone_value)
        VALUES (p_user_id, 'recovery', 50)
        ON CONFLICT DO NOTHING;
    END IF;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER update_driver_scores_updated_at BEFORE UPDATE ON driver_scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incident_weights_updated_at BEFORE UPDATE ON incident_weights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verification queries
SELECT 'Driver scores table created' AS status, COUNT(*) as count FROM information_schema.tables WHERE table_name = 'driver_scores';
SELECT 'Score events table created' AS status, COUNT(*) as count FROM information_schema.tables WHERE table_name = 'score_events';
SELECT 'Incident weights table created' AS status, COUNT(*) as count FROM information_schema.tables WHERE table_name = 'incident_weights';
SELECT 'Score milestones table created' AS status, COUNT(*) as count FROM information_schema.tables WHERE table_name = 'score_milestones';
SELECT 'Incident weights populated' AS status, COUNT(*) as count FROM incident_weights;
SELECT 'Driver score analytics view created' AS status, COUNT(*) as count FROM information_schema.views WHERE table_name = 'driver_score_analytics';

COMMIT;