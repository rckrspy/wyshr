-- Phase 2.3: Private Incident Management
-- This migration adds support for private incident tracking, notifications, and disputes

-- Modify reports table to support verified owner notifications
ALTER TABLE reports
ADD COLUMN owner_user_id UUID REFERENCES users(id),
ADD COLUMN license_plate_plaintext VARCHAR(15),
ADD COLUMN is_owner_notified BOOLEAN DEFAULT FALSE,
ADD COLUMN owner_viewed_at TIMESTAMP,
ADD COLUMN incident_status VARCHAR(50) DEFAULT 'active' CHECK (incident_status IN ('active', 'disputed', 'resolved', 'archived'));

-- Create index for efficient owner queries
CREATE INDEX idx_reports_owner_user ON reports(owner_user_id) WHERE owner_user_id IS NOT NULL;
CREATE INDEX idx_reports_status ON reports(incident_status);

-- Notification tracking table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('incident_reported', 'dispute_resolved', 'dispute_rejected', 'vehicle_verified')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP,
    push_sent BOOLEAN DEFAULT FALSE,
    push_sent_at TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for notification queries
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- Notification preferences table
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    email_incidents BOOLEAN DEFAULT TRUE,
    push_incidents BOOLEAN DEFAULT TRUE,
    email_disputes BOOLEAN DEFAULT TRUE,
    push_disputes BOOLEAN DEFAULT TRUE,
    email_vehicle_updates BOOLEAN DEFAULT TRUE,
    push_vehicle_updates BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Incident disputes table
CREATE TABLE incident_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    dispute_type VARCHAR(50) NOT NULL CHECK (dispute_type IN ('not_me', 'incorrect_details', 'wrong_vehicle', 'false_report', 'other')),
    description TEXT NOT NULL,
    supporting_evidence_urls TEXT[],
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'resolved', 'rejected')),
    admin_response TEXT,
    admin_user_id UUID REFERENCES admin_users(id),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for dispute queries
CREATE INDEX idx_disputes_report ON incident_disputes(report_id);
CREATE INDEX idx_disputes_user ON incident_disputes(user_id);
CREATE INDEX idx_disputes_status ON incident_disputes(status);

-- Private notes for incidents
CREATE TABLE incident_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for notes queries
CREATE INDEX idx_notes_report_user ON incident_notes(report_id, user_id);

-- View for user incidents with aggregated data
CREATE VIEW user_incidents AS
SELECT 
    r.*,
    CASE WHEN r.media_url IS NOT NULL THEN ARRAY[r.media_url] ELSE ARRAY[]::text[] END as media_urls,
    d.id as dispute_id,
    d.status as dispute_status,
    d.dispute_type,
    n.note as user_note,
    COUNT(DISTINCT d.id) as dispute_count
FROM reports r
LEFT JOIN incident_disputes d ON r.id = d.report_id AND d.user_id = r.owner_user_id
LEFT JOIN incident_notes n ON r.id = n.report_id AND n.user_id = r.owner_user_id
WHERE r.owner_user_id IS NOT NULL
GROUP BY r.id, d.id, d.status, d.dispute_type, n.note;

-- Function to check if a report belongs to a verified vehicle owner
CREATE OR REPLACE FUNCTION check_verified_vehicle_owner(
    p_license_plate VARCHAR,
    p_state VARCHAR
) RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT user_id INTO v_user_id
    FROM verified_vehicles
    WHERE UPPER(license_plate) = UPPER(p_license_plate)
    AND UPPER(state) = UPPER(p_state)
    AND status = 'verified'
    LIMIT 1;
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;

-- Update function for timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incident_disputes_updated_at
    BEFORE UPDATE ON incident_disputes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incident_notes_updated_at
    BEFORE UPDATE ON incident_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Sample data for notification types (for reference)
INSERT INTO notification_preferences (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;

-- Verification queries
SELECT 'Reports table modifications' as check_item, 
       COUNT(*) FILTER (WHERE column_name IN ('owner_user_id', 'license_plate_plaintext', 'is_owner_notified', 'owner_viewed_at', 'incident_status')) as count
FROM information_schema.columns 
WHERE table_name = 'reports';

SELECT 'New tables created' as check_item, 
       COUNT(*) as count
FROM information_schema.tables 
WHERE table_name IN ('notifications', 'notification_preferences', 'incident_disputes', 'incident_notes')
AND table_schema = 'public';

SELECT 'Indexes created' as check_item,
       COUNT(*) as count
FROM pg_indexes
WHERE indexname LIKE 'idx_reports_%' 
   OR indexname LIKE 'idx_notifications_%'
   OR indexname LIKE 'idx_disputes_%'
   OR indexname LIKE 'idx_notes_%';

SELECT 'Function created' as check_item,
       COUNT(*) as count
FROM information_schema.routines
WHERE routine_name = 'check_verified_vehicle_owner';