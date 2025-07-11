-- Phase 2.5: Rewards Marketplace Database Schema
-- Migration version: v2.5.0

-- Rewards partner companies
CREATE TABLE reward_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- insurance, maintenance, retail
    website_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    minimum_score INTEGER DEFAULT 70,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Lead generation for reward partners
CREATE TABLE reward_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES reward_partners(id),
    driver_score INTEGER NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_method VARCHAR(50) NOT NULL, -- email, phone
    status VARCHAR(50) DEFAULT 'pending', -- pending, contacted, converted, expired
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_reward_partners_category ON reward_partners(category);
CREATE INDEX idx_reward_partners_active ON reward_partners(is_active);
CREATE INDEX idx_reward_leads_user_id ON reward_leads(user_id);
CREATE INDEX idx_reward_leads_partner_id ON reward_leads(partner_id);
CREATE INDEX idx_reward_leads_status ON reward_leads(status);
CREATE INDEX idx_reward_leads_created_at ON reward_leads(created_at);

-- Insert sample reward partners
INSERT INTO reward_partners (name, category, description, minimum_score, logo_url, website_url) VALUES
('SafeDriver Insurance', 'insurance', 'Get discounts on auto insurance based on your driving score', 75, '/images/partners/safedriver.png', 'https://example.com/safedriver'),
('QuickFix Auto Service', 'maintenance', 'Priority scheduling and discounts for vehicle maintenance', 70, '/images/partners/quickfix.png', 'https://example.com/quickfix'),
('GreenDrive Rewards', 'retail', 'Earn points for safe driving, redeem for gas and retail purchases', 80, '/images/partners/greendrive.png', 'https://example.com/greendrive'),
('FleetCare Solutions', 'insurance', 'Commercial vehicle insurance with driver score-based pricing', 85, '/images/partners/fleetcare.png', 'https://example.com/fleetcare');

-- Verification queries
SELECT 'reward_partners table created' as status, COUNT(*) as partner_count FROM reward_partners;
SELECT 'reward_leads table created' as status, COUNT(*) as lead_count FROM reward_leads;