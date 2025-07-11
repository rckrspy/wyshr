import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { rewardsService, QuoteRequest } from '../services/rewardsService';

export class RewardsController {
  async getPartners(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.query;
      
      let partners;
      if (category) {
        partners = await rewardsService.getPartnersByCategory(category as string);
      } else {
        partners = await rewardsService.getActivePartners();
      }
      
      res.json({
        success: true,
        data: partners
      });
    } catch (error) {
      console.error('Error fetching reward partners:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch reward partners'
      });
    }
  }

  async getPartner(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const partner = await rewardsService.getPartnerById(id);
      
      if (!partner) {
        res.status(404).json({
          success: false,
          message: 'Partner not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: partner
      });
    } catch (error) {
      console.error('Error fetching reward partner:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch reward partner'
      });
    }
  }

  async checkEligibility(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { partner_id } = req.query;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }
      
      const eligibility = await rewardsService.checkEligibility(
        userId,
        partner_id as string
      );
      
      res.json({
        success: true,
        data: eligibility
      });
    } catch (error) {
      console.error('Error checking eligibility:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check eligibility'
      });
    }
  }

  async requestQuote(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }
      
      const { partner_id, contact_method, contact_email, contact_phone, notes } = req.body;
      
      // Validation
      if (!partner_id || !contact_method) {
        res.status(400).json({
          success: false,
          message: 'Partner ID and contact method are required'
        });
        return;
      }
      
      if (contact_method === 'email' && !contact_email) {
        res.status(400).json({
          success: false,
          message: 'Email address is required for email contact method'
        });
        return;
      }
      
      if (contact_method === 'phone' && !contact_phone) {
        res.status(400).json({
          success: false,
          message: 'Phone number is required for phone contact method'
        });
        return;
      }
      
      const quoteRequest: QuoteRequest = {
        partner_id,
        user_id: userId,
        contact_method,
        contact_email,
        contact_phone,
        notes
      };
      
      const lead = await rewardsService.requestQuote(quoteRequest);
      
      res.status(201).json({
        success: true,
        data: lead,
        message: 'Quote request submitted successfully'
      });
    } catch (error) {
      console.error('Error requesting quote:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to request quote'
        });
      }
    }
  }

  async getUserLeads(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }
      
      const leads = await rewardsService.getUserLeads(userId);
      
      res.json({
        success: true,
        data: leads
      });
    } catch (error) {
      console.error('Error fetching user leads:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch leads'
      });
    }
  }

  async getRewardsStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await rewardsService.getRewardsStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching rewards stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch rewards statistics'
      });
    }
  }
}

export const rewardsController = new RewardsController();