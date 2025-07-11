import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import { Report, HeatMapData, IncidentStats, ApiResponse } from '../../types';

const baseUrl = import.meta.env.VITE_API_URL || 'https://localhost/api/v1';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const sessionId = (getState() as RootState).session.sessionId;
      if (sessionId) {
        headers.set('x-session-id', sessionId);
      }
      return headers;
    },
  }),
  tagTypes: ['Report', 'HeatMap', 'Stats'],
  endpoints: (builder) => ({
    // Submit a report
    submitReport: builder.mutation<ApiResponse<{ reportId: string; sessionId: string }>, FormData>({
      query: (formData) => ({
        url: '/reports',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['HeatMap', 'Stats'],
    }),

    // Get heat map data
    getHeatMapData: builder.query<HeatMapData, { timeRange?: string; incidentType?: string }>({
      query: ({ timeRange = '24h', incidentType } = {}) => ({
        url: '/heatmap/data',
        params: { timeRange, incidentType },
      }),
      transformResponse: (response: ApiResponse<HeatMapData>) => response.data!,
      providesTags: ['HeatMap'],
    }),

    // Get incident statistics
    getIncidentStats: builder.query<IncidentStats, void>({
      query: () => '/heatmap/stats',
      transformResponse: (response: ApiResponse<IncidentStats>) => response.data!,
      providesTags: ['Stats'],
    }),

    // Get recent reports (for testing only)
    getRecentReports: builder.query<Report[], { limit?: number }>({
      query: ({ limit = 10 } = {}) => ({
        url: '/reports/recent',
        params: { limit },
      }),
      transformResponse: (response: ApiResponse<Report[]>) => response.data!,
      providesTags: ['Report'],
    }),
  }),
});

export const {
  useSubmitReportMutation,
  useGetHeatMapDataQuery,
  useGetIncidentStatsQuery,
  useGetRecentReportsQuery,
} = api;