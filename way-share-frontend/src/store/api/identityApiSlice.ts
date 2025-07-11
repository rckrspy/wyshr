import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';

interface IdentityVerification {
  id: string;
  status: 'pending' | 'processing' | 'verified' | 'failed' | 'cancelled';
  verifiedName?: string;
  verifiedAt?: string;
  failureReason?: string;
  createdAt: string;
}

interface VerificationStatus {
  isVerified: boolean;
  verification: IdentityVerification | null;
}

interface CreateSessionRequest {
  returnUrl: string;
  refreshUrl: string;
}

interface CreateSessionResponse {
  sessionId: string;
  url: string;
  message: string;
}

interface CheckSessionResponse {
  status: string;
  url?: string;
  lastError?: {
    code?: string;
    message?: string;
  };
}

export const identityApi = createApi({
  reducerPath: 'identityApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['IdentityVerification'],
  endpoints: (builder) => ({
    // Create verification session
    createVerificationSession: builder.mutation<CreateSessionResponse, CreateSessionRequest>({
      query: (body) => ({
        url: '/identity/session',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['IdentityVerification'],
    }),

    // Get verification status
    getVerificationStatus: builder.query<VerificationStatus, void>({
      query: () => '/identity/status',
      providesTags: ['IdentityVerification'],
    }),

    // Check specific session status
    checkSessionStatus: builder.query<CheckSessionResponse, string>({
      query: (sessionId) => `/identity/session/${sessionId}`,
    }),

    // Cancel verification
    cancelVerification: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/identity/cancel',
        method: 'POST',
      }),
      invalidatesTags: ['IdentityVerification'],
    }),
  }),
});

export const {
  useCreateVerificationSessionMutation,
  useGetVerificationStatusQuery,
  useCheckSessionStatusQuery,
  useCancelVerificationMutation,
} = identityApi;