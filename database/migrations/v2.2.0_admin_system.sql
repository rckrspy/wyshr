-- Way-Share v2.2.0: Admin System for Manual Reviews
-- Phase 2.2: Week 6 - Admin Review Interface

-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'reviewer')),
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create review logs for audit trail
CREATE TABLE IF NOT EXISTS review_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id UUID REFERENCES admin_users(id),
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('vehicle_verification', 'identity_verification', 'incident_dispute')),
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('approved', 'rejected', 'requested_info', 'escalated')),
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create admin activity logs
CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admin_users(id),
    action_type VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX idx_admin_users_role ON admin_users(role);
CREATE INDEX idx_review_logs_reviewer ON review_logs(reviewer_id);
CREATE INDEX idx_review_logs_entity ON review_logs(entity_type, entity_id);
CREATE INDEX idx_review_logs_created ON review_logs(created_at);
CREATE INDEX idx_admin_activity_admin ON admin_activity_logs(admin_id);
CREATE INDEX idx_admin_activity_created ON admin_activity_logs(created_at);

-- Add update trigger for admin_users
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for pending reviews
CREATE VIEW pending_reviews AS
SELECT 
    'vehicle_verification' as review_type,
    vv.id as entity_id,
    vv.created_at,
    u.email as user_email,
    veh.license_plate,
    veh.state,
    iv.verified_name as owner_name
FROM vehicle_verifications vv
JOIN verified_vehicles veh ON vv.vehicle_id = veh.id
JOIN users u ON veh.user_id = u.id
LEFT JOIN identity_verifications iv ON u.identity_verification_id = iv.id
WHERE vv.manual_review_required = true 
AND vv.status = 'pending'
AND NOT EXISTS (
    SELECT 1 FROM review_logs rl 
    WHERE rl.entity_type = 'vehicle_verification' 
    AND rl.entity_id = vv.id
);

-- Create function to check admin permissions
CREATE OR REPLACE FUNCTION check_admin_permission(
    admin_user_id UUID,
    required_permission TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    admin_record RECORD;
BEGIN
    SELECT role, permissions, is_active 
    INTO admin_record
    FROM admin_users 
    WHERE id = admin_user_id;
    
    IF NOT FOUND OR NOT admin_record.is_active THEN
        RETURN FALSE;
    END IF;
    
    -- Admins have all permissions
    IF admin_record.role = 'admin' THEN
        RETURN TRUE;
    END IF;
    
    -- Check specific permission in JSON
    RETURN admin_record.permissions ? required_permission 
        AND (admin_record.permissions->required_permission)::boolean = true;
END;
$$ LANGUAGE plpgsql;

-- Create function to log admin activity
CREATE OR REPLACE FUNCTION log_admin_activity(
    p_admin_id UUID,
    p_action_type VARCHAR(100),
    p_resource_type VARCHAR(50) DEFAULT NULL,
    p_resource_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
) RETURNS void AS $$
BEGIN
    INSERT INTO admin_activity_logs 
    (admin_id, action_type, resource_type, resource_id, metadata)
    VALUES 
    (p_admin_id, p_action_type, p_resource_type, p_resource_id, p_metadata);
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE admin_users IS 'Admin users with roles and permissions for manual review processes';
COMMENT ON COLUMN admin_users.role IS 'admin: full access, reviewer: limited to review actions';
COMMENT ON COLUMN admin_users.permissions IS 'JSON object with specific permissions for reviewers';

COMMENT ON TABLE review_logs IS 'Audit trail of all manual review decisions';
COMMENT ON COLUMN review_logs.entity_type IS 'Type of entity being reviewed';
COMMENT ON COLUMN review_logs.action IS 'Decision made by reviewer';

COMMENT ON TABLE admin_activity_logs IS 'Comprehensive activity logging for admin actions';

-- Insert default admin permissions template
INSERT INTO admin_users (user_id, role, permissions, created_at)
SELECT id, 'admin', '{"all": true}', NOW()
FROM users
WHERE email = 'admin@wayshare.com'
ON CONFLICT (user_id) DO NOTHING;

-- Verification queries
SELECT 
    'Admin tables created' as status,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users') as admin_users_exists,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'review_logs') as review_logs_exists,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_activity_logs') as activity_logs_exists;