import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Mutex } from 'async-mutex';
import { RootState } from '../store';
import { logout, updateTokens } from '../slices/authSlice';

// Create a mutex to prevent multiple simultaneous refresh attempts
const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL_V2 || 'https://localhost/api/v2',
  credentials: 'include', // Enable sending cookies
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth?.tokens?.accessToken;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Wait until the mutex is available
  await mutex.waitForUnlock();

  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Check if another instance is already refreshing the token
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        // Try to refresh the token using HTTP-only cookie
        const refreshResult = await baseQuery(
          {
            url: '/auth/refresh',
            method: 'POST',
            body: {}, // Empty body, refresh token comes from HTTP-only cookie
          },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          // Update tokens in store - backend returns { success: true, data: { accessToken } }
          const responseData = refreshResult.data as { data?: { accessToken?: string }; accessToken?: string };
          const accessToken = responseData.data?.accessToken || responseData.accessToken;
          
          if (accessToken) {
            const newTokens = {
              accessToken,
              refreshToken: '', // HTTP-only cookie managed by server
            };
            api.dispatch(updateTokens(newTokens));
            
            // Retry the original query
            result = await baseQuery(args, api, extraOptions);
          } else {
            // No access token in response, logout
            api.dispatch(logout());
          }
        } else {
          // Refresh failed, logout
          api.dispatch(logout());
        }
      } finally {
        release();
      }
    } else {
      // Wait for the ongoing refresh to complete
      await mutex.waitForUnlock();
      // Retry the original query
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};