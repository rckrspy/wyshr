import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';

export interface RewardPartner {
  id: string;
  name: string;
  logo_url?: string;
  description?: string;
  category: string;
  website_url?: string;
  is_active: boolean;
  minimum_score: number;
  created_at: string;
  updated_at: string;
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
  created_at: string;
  updated_at: string;
  partner_name?: string;
}

export interface EligibilityResult {
  partner_id: string;
  eligible: boolean;
  score_required: number;
  user_score: number;
  score_gap?: number;
}

export interface QuoteRequest {
  partner_id: string;
  contact_method: 'email' | 'phone';
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
}

export interface RewardsStats {
  total_partners: number;
  active_partners: number;
  total_leads: number;
  pending_leads: number;
  conversion_rate: number;
}

export const rewardsApiSlice = createApi({
  reducerPath: 'rewardsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['RewardPartner', 'RewardLead', 'Eligibility', 'RewardsStats'],
  endpoints: (builder) => ({
    getPartners: builder.query<{ success: boolean; data: RewardPartner[] }, string | undefined>({
      query: (category) => ({
        url: '/rewards/partners',
        params: category ? { category } : undefined,
      }),
      providesTags: ['RewardPartner'],
    }),
    getPartner: builder.query<{ success: boolean; data: RewardPartner }, string>({
      query: (id) => `/rewards/partners/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'RewardPartner', id }],
    }),
    checkEligibility: builder.query<{ success: boolean; data: EligibilityResult[] }, string | undefined>({
      query: (partnerId) => ({
        url: '/rewards/eligibility',
        params: partnerId ? { partner_id: partnerId } : undefined,
      }),
      providesTags: ['Eligibility'],
    }),
    requestQuote: builder.mutation<{ success: boolean; data: RewardLead; message: string }, QuoteRequest>({
      query: (quoteRequest) => ({
        url: '/rewards/request-quote',
        method: 'POST',
        body: quoteRequest,
      }),
      invalidatesTags: ['RewardLead', 'Eligibility'],
    }),
    getUserLeads: builder.query<{ success: boolean; data: RewardLead[] }, void>({
      query: () => '/rewards/my-leads',
      providesTags: ['RewardLead'],
    }),
    getRewardsStats: builder.query<{ success: boolean; data: RewardsStats }, void>({
      query: () => '/rewards/stats',
      providesTags: ['RewardsStats'],
    }),
  }),
});

export const {
  useGetPartnersQuery,
  useGetPartnerQuery,
  useCheckEligibilityQuery,
  useRequestQuoteMutation,
  useGetUserLeadsQuery,
  useGetRewardsStatsQuery,
} = rewardsApiSlice;