import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';

interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  identityVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Removed unused AuthTokens interface

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  message?: string;
}

// RefreshTokenRequest is empty since refresh token comes from HTTP-only cookie
type RefreshTokenRequest = Record<string, never>;

interface RefreshTokenResponse {
  success: boolean;
  data: {
    accessToken: string;
  };
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  password: string;
}

interface MessageResponse {
  message: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    // Authentication endpoints
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    logout: builder.mutation<MessageResponse, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
        body: {}, // Empty body, refresh token comes from HTTP-only cookie
      }),
    }),

    refreshToken: builder.mutation<RefreshTokenResponse, RefreshTokenRequest>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
        body: {}, // Empty body, refresh token comes from HTTP-only cookie
      }),
    }),

    verifyEmail: builder.mutation<MessageResponse, string>({
      query: (token) => ({
        url: `/auth/verify-email/${token}`,
        method: 'GET',
      }),
    }),

    forgotPassword: builder.mutation<MessageResponse, ForgotPasswordRequest>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),

    resetPassword: builder.mutation<MessageResponse, ResetPasswordRequest>({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),

    // User profile endpoints
    getProfile: builder.query<{ user: User }, void>({
      query: () => '/user/profile',
      providesTags: ['User'],
    }),

    updateProfile: builder.mutation<{ user: User }, Partial<User>>({
      query: (updates) => ({
        url: '/user/profile',
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['User'],
    }),

    deleteAccount: builder.mutation<MessageResponse, void>({
      query: () => ({
        url: '/user/account',
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useVerifyEmailMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useDeleteAccountMutation,
} = authApi;