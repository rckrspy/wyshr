import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';

export interface DriverScore {
  currentScore: number;
  previousScore: number;
  change: number;
  percentile: number;
  incidentCount: number;
  disputesWon: number;
}

export interface ScoreEvent {
  eventType: string;
  scoreImpact: number;
  description: string;
  previousScore: number;
  newScore: number;
  createdAt: string;
}

export interface ScoreBreakdown {
  incidentType: string;
  count: number;
  totalImpact: number;
}

export interface Milestone {
  milestoneType: string;
  milestoneValue: number;
  achievedAt: string;
}

export interface IncidentWeight {
  incidentType: string;
  basePenalty: number;
  severityMultiplier: number;
}

export const driverScoreApi = createApi({
  reducerPath: 'driverScoreApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['DriverScore'],
  endpoints: (builder) => ({
    getDriverScore: builder.query<DriverScore, void>({
      query: () => '/driver-score',
      transformResponse: (response: { success: boolean; data: DriverScore }) => response.data,
      providesTags: ['DriverScore'],
    }),

    getScoreHistory: builder.query<ScoreEvent[], number | void>({
      query: (limit = 50) => `/driver-score/history?limit=${limit}`,
      transformResponse: (response: { success: boolean; data: ScoreEvent[] }) => response.data,
      providesTags: ['DriverScore'],
    }),

    getScoreBreakdown: builder.query<ScoreBreakdown[], void>({
      query: () => '/driver-score/breakdown',
      transformResponse: (response: { success: boolean; data: ScoreBreakdown[] }) => response.data,
      providesTags: ['DriverScore'],
    }),

    getScorePercentile: builder.query<{ percentile: number; currentScore: number; betterThan: number }, void>({
      query: () => '/driver-score/percentile',
      transformResponse: (response: { success: boolean; data: { percentile: number; currentScore: number; betterThan: number } }) => response.data,
      providesTags: ['DriverScore'],
    }),

    getMilestones: builder.query<Milestone[], void>({
      query: () => '/driver-score/milestones',
      transformResponse: (response: { success: boolean; data: Milestone[] }) => response.data,
      providesTags: ['DriverScore'],
    }),

    getIncidentWeights: builder.query<IncidentWeight[], void>({
      query: () => '/driver-score/weights',
      transformResponse: (response: { success: boolean; data: IncidentWeight[] }) => response.data,
    }),

    triggerTimeRecovery: builder.mutation<{ success: boolean; message: string }, { userId?: string }>({
      query: (body) => ({
        url: '/driver-score/recover',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['DriverScore'],
    }),
  }),
});

export const {
  useGetDriverScoreQuery,
  useGetScoreHistoryQuery,
  useGetScoreBreakdownQuery,
  useGetScorePercentileQuery,
  useGetMilestonesQuery,
  useGetIncidentWeightsQuery,
  useTriggerTimeRecoveryMutation,
} = driverScoreApi;