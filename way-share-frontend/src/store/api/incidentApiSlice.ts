import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';

export interface Incident {
  id: string;
  report_id: string;
  owner_user_id: string;
  incident_type: string;
  license_plate_plaintext: string;
  state: string;
  location_lat: number;
  location_lng: number;
  description?: string;
  is_owner_notified: boolean;
  owner_viewed_at?: string;
  incident_status: string;
  owner_notes?: string;
  created_at: string;
  updated_at: string;
  media_urls?: string[];
}

export interface IncidentStats {
  totalIncidents: number;
  viewedIncidents: number;
  unresolvedIncidents: number;
  disputedIncidents: number;
}

export interface IncidentListResponse {
  success: boolean;
  data: {
    incidents: Incident[];
    stats: IncidentStats;
    pagination: {
      limit: number;
      offset: number;
      total: number;
    };
  };
}

export interface IncidentDetailResponse {
  success: boolean;
  data: Incident;
}

export interface Dispute {
  id: string;
  report_id: string;
  user_id: string;
  dispute_type: 'not_me' | 'incorrect_details' | 'wrong_vehicle' | 'false_report' | 'other';
  description: string;
  supporting_evidence_urls?: string[];
  status: 'pending' | 'approved' | 'rejected';
  admin_response?: string;
  created_at: string;
  resolved_at?: string;
}

export interface CreateDisputeRequest {
  disputeType: 'not_me' | 'incorrect_details' | 'wrong_vehicle' | 'false_report' | 'other';
  description: string;
  supportingEvidenceUrls?: string[];
}

export interface UpdateNoteRequest {
  note: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'incident_reported' | 'dispute_resolved' | 'dispute_rejected' | 'vehicle_verified';
  title: string;
  body: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  email_incidents: boolean;
  push_incidents: boolean;
  email_disputes: boolean;
  push_disputes: boolean;
  email_vehicle_updates: boolean;
  push_vehicle_updates: boolean;
}

export const incidentApi = createApi({
  reducerPath: 'incidentApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Incident', 'Notification', 'NotificationPreferences'],
  endpoints: (builder) => ({
    getUserIncidents: builder.query<IncidentListResponse['data'], { limit?: number; offset?: number }>({
      query: ({ limit = 20, offset = 0 }) => ({
        url: `/incidents?limit=${limit}&offset=${offset}`,
        method: 'GET',
      }),
      transformResponse: (response: IncidentListResponse) => response.data,
      providesTags: ['Incident'],
    }),
    getIncident: builder.query<Incident, string>({
      query: (id) => ({
        url: `/incidents/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: IncidentDetailResponse) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Incident', id }],
    }),
    markIncidentViewed: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/incidents/${id}/viewed`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Incident', id }, 'Incident'],
    }),
    createDispute: builder.mutation<{ success: boolean; data: Dispute }, { id: string; data: CreateDisputeRequest }>({
      query: ({ id, data }) => ({
        url: `/incidents/${id}/dispute`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Incident', id }],
    }),
    updateIncidentNote: builder.mutation<{ success: boolean }, { id: string; data: UpdateNoteRequest }>({
      query: ({ id, data }) => ({
        url: `/incidents/${id}/notes`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Incident', id }],
    }),
    getNotifications: builder.query<{ notifications: Notification[]; unreadCount: number; pagination: { limit: number; offset: number; total: number } }, void>({
      query: () => ({
        url: '/incidents/notifications',
        method: 'GET',
      }),
      transformResponse: (response: { success: boolean; data: { notifications: Notification[]; unreadCount: number; pagination: { limit: number; offset: number; total: number } } }) => response.data,
      providesTags: ['Notification'],
    }),
    markNotificationRead: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/incidents/notifications/${id}/read`,
        method: 'POST',
      }),
      invalidatesTags: ['Notification'],
    }),
    markAllNotificationsRead: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: '/incidents/notifications/read-all',
        method: 'POST',
      }),
      invalidatesTags: ['Notification'],
    }),
    getNotificationPreferences: builder.query<NotificationPreferences, void>({
      query: () => ({
        url: '/incidents/notifications/preferences',
        method: 'GET',
      }),
      transformResponse: (response: { success: boolean; data: NotificationPreferences }) => response.data,
      providesTags: ['NotificationPreferences'],
    }),
    updateNotificationPreferences: builder.mutation<{ success: boolean }, Partial<NotificationPreferences>>({
      query: (data) => ({
        url: '/incidents/notifications/preferences',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['NotificationPreferences'],
    }),
  }),
});

export const {
  useGetUserIncidentsQuery,
  useGetIncidentQuery,
  useMarkIncidentViewedMutation,
  useCreateDisputeMutation,
  useUpdateIncidentNoteMutation,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} = incidentApi;