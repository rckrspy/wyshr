import { db } from './database';

export interface RewardPartner {
  id: string;
  name: string;
  logo_url?: string;
  description?: string;
  category: string;
  website_url?: string;
  is_active: boolean;
  minimum_score: number;
  created_at: Date;
  updated_at: Date;
}

export interface RewardLead {
  id: string;
  user_id: string;
  partner_id: string;
  driver_score: number;
  contact_email?: string;
  contact_phone?: string;
  contact_method: string;
  status: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface QuoteRequest {
  partner_id: string;
  user_id: string;
  contact_method: 'email' | 'phone';
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
}

export interface EligibilityResult {
  partner_id: string;
  eligible: boolean;
  score_required: number;
  user_score: number;
  score_gap?: number;
}

class RewardsService {
  async getActivePartners(): Promise<RewardPartner[]> {
    const query = `
      SELECT * FROM reward_partners 
      WHERE is_active = true 
      ORDER BY category, name
    `;
    
    const result = await db.query<RewardPartner>(query);
    return result;
  }

  async getPartnersByCategory(category: string): Promise<RewardPartner[]> {
    const query = `
      SELECT * FROM reward_partners 
      WHERE is_active = true AND category = $1
      ORDER BY name
    `;
    
    const result = await db.query<RewardPartner>(query, [category]);
    return result;
  }

  async getPartnerById(partnerId: string): Promise<RewardPartner | null> {
    const query = `
      SELECT * FROM reward_partners 
      WHERE id = $1 AND is_active = true
    `;
    
    const result = await db.query<RewardPartner>(query, [partnerId]);
    return result[0] || null;
  }

  async checkEligibility(userId: string, partnerId?: string): Promise<EligibilityResult[]> {
    // Get user's current driver score
    const userScoreQuery = `
      SELECT current_score FROM driver_scores 
      WHERE user_id = $1 
      ORDER BY score_updated_at DESC 
      LIMIT 1
    `;
    
    const scoreResult = await db.query<{ current_score: number }>(userScoreQuery, [userId]);
    const userScore = scoreResult[0]?.current_score || 80; // Default score

    // Get partners to check
    let partnersQuery = `
      SELECT id, name, minimum_score 
      FROM reward_partners 
      WHERE is_active = true
    `;
    
    const queryParams = [];
    if (partnerId) {
      partnersQuery += ` AND id = $1`;
      queryParams.push(partnerId);
    }
    
    const partnersResult = await db.query<{ id: string; name: string; minimum_score: number }>(partnersQuery, queryParams);
    
    return partnersResult.map((partner) => ({
      partner_id: partner.id,
      eligible: userScore >= partner.minimum_score,
      score_required: partner.minimum_score,
      user_score: userScore,
      score_gap: userScore < partner.minimum_score ? partner.minimum_score - userScore : undefined
    }));
  }

  async requestQuote(quoteRequest: QuoteRequest): Promise<RewardLead> {
    const { partner_id, user_id, contact_method, contact_email, contact_phone, notes } = quoteRequest;
    
    // Verify partner exists and is active
    const partner = await this.getPartnerById(partner_id);
    if (!partner) {
      throw new Error('Partner not found or inactive');
    }

    // Check eligibility
    const eligibility = await this.checkEligibility(user_id, partner_id);
    if (!eligibility[0]?.eligible) {
      throw new Error('User not eligible for this partner');
    }

    // Get user's current driver score
    const scoreQuery = `
      SELECT current_score FROM driver_scores 
      WHERE user_id = $1 
      ORDER BY score_updated_at DESC 
      LIMIT 1
    `;
    
    const scoreResult = await db.query<{ current_score: number }>(scoreQuery, [user_id]);
    const driverScore = scoreResult[0]?.current_score || 80;

    // Create lead
    const insertQuery = `
      INSERT INTO reward_leads (
        user_id, partner_id, driver_score, contact_email, 
        contact_phone, contact_method, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      user_id,
      partner_id,
      driverScore,
      contact_email,
      contact_phone,
      contact_method,
      notes
    ];
    
    const result = await db.query<RewardLead>(insertQuery, values);
    
    console.log(`Quote requested for user ${user_id} with partner ${partner_id}`);
    
    return result[0];
  }

  async getUserLeads(userId: string): Promise<(RewardLead & { partner_name: string })[]> {
    const query = `
      SELECT rl.*, rp.name as partner_name
      FROM reward_leads rl
      JOIN reward_partners rp ON rl.partner_id = rp.id
      WHERE rl.user_id = $1
      ORDER BY rl.created_at DESC
    `;
    
    const result = await db.query<RewardLead & { partner_name: string }>(query, [userId]);
    return result;
  }

  async getPartnerLeads(partnerId: string): Promise<RewardLead[]> {
    const query = `
      SELECT * FROM reward_leads 
      WHERE partner_id = $1 
      ORDER BY created_at DESC
    `;
    
    const result = await db.query<RewardLead>(query, [partnerId]);
    return result;
  }

  async updateLeadStatus(leadId: string, status: string, notes?: string): Promise<void> {
    const query = `
      UPDATE reward_leads 
      SET status = $1, notes = $2, updated_at = NOW()
      WHERE id = $3
    `;
    
    await db.query(query, [status, notes, leadId]);
    console.log(`Lead ${leadId} status updated to ${status}`);
  }

  async getRewardsStats(): Promise<{
    total_partners: number;
    active_partners: number;
    total_leads: number;
    pending_leads: number;
    conversion_rate: number;
  }> {
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM reward_partners) as total_partners,
        (SELECT COUNT(*) FROM reward_partners WHERE is_active = true) as active_partners,
        (SELECT COUNT(*) FROM reward_leads) as total_leads,
        (SELECT COUNT(*) FROM reward_leads WHERE status = 'pending') as pending_leads,
        (SELECT 
          CASE 
            WHEN COUNT(*) = 0 THEN 0 
            ELSE (COUNT(*) FILTER (WHERE status = 'converted')::float / COUNT(*) * 100)
          END 
          FROM reward_leads
        ) as conversion_rate
    `;
    
    const result = await db.query<{
      total_partners: number;
      active_partners: number;
      total_leads: number;
      pending_leads: number;
      conversion_rate: number;
    }>(statsQuery);
    return result[0];
  }
}

export const rewardsService = new RewardsService();