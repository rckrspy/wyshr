import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../api/authApiSlice';

interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  identityVerified?: boolean;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const getStoredTokens = (): AuthTokens | null => {
  try {
    const stored = localStorage.getItem('authTokens');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const getStoredUser = (): User | null => {
  try {
    const stored = localStorage.getItem('userData');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  user: getStoredUser(),
  tokens: getStoredTokens(),
  isAuthenticated: !!getStoredTokens() && !!getStoredUser(),
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; tokens: AuthTokens }>
    ) => {
      const { user, tokens } = action.payload;
      state.user = user;
      state.tokens = tokens;
      state.isAuthenticated = true;
      try {
        localStorage.setItem('authTokens', JSON.stringify(tokens));
        localStorage.setItem('userData', JSON.stringify(user));
      } catch (error) {
        console.warn('Failed to save tokens to localStorage:', error);
      }
    },
    logout: (state) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      try {
        localStorage.removeItem('authTokens');
        localStorage.removeItem('userData');
      } catch (error) {
        console.warn('Failed to remove tokens from localStorage:', error);
      }
    },
    updateTokens: (state, action: PayloadAction<AuthTokens>) => {
      state.tokens = action.payload;
      try {
        localStorage.setItem('authTokens', JSON.stringify(action.payload));
      } catch (error) {
        console.warn('Failed to save tokens to localStorage:', error);
      }
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      try {
        localStorage.setItem('userData', JSON.stringify(action.payload));
      } catch (error) {
        console.warn('Failed to save user data to localStorage:', error);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Handle API state changes
    builder.addMatcher(
      authApi.endpoints.login.matchFulfilled,
      (state, { payload }) => {
        state.user = payload.user;
        // API response has accessToken directly, refreshToken is in HTTP-only cookie
        const tokens = {
          accessToken: payload.accessToken,
          refreshToken: '', // Will be managed by HTTP-only cookie
        };
        state.tokens = tokens;
        state.isAuthenticated = true;
        try {
          localStorage.setItem('authTokens', JSON.stringify(tokens));
          localStorage.setItem('userData', JSON.stringify(payload.user));
        } catch (error) {
          console.warn('Failed to save tokens to localStorage:', error);
        }
      }
    );
    
    builder.addMatcher(
      authApi.endpoints.register.matchFulfilled,
      (state, { payload }) => {
        state.user = payload.user;
        // API response has accessToken directly, refreshToken is in HTTP-only cookie
        const tokens = {
          accessToken: payload.accessToken,
          refreshToken: '', // Will be managed by HTTP-only cookie
        };
        state.tokens = tokens;
        state.isAuthenticated = true;
        try {
          localStorage.setItem('authTokens', JSON.stringify(tokens));
          localStorage.setItem('userData', JSON.stringify(payload.user));
        } catch (error) {
          console.warn('Failed to save tokens to localStorage:', error);
        }
      }
    );
    
    builder.addMatcher(
      authApi.endpoints.refreshToken.matchFulfilled,
      (state, { payload }) => {
        const newTokens = {
          accessToken: payload.data.accessToken,
          refreshToken: '', // HTTP-only cookie managed by server
        };
        state.tokens = newTokens;
        try {
          localStorage.setItem('authTokens', JSON.stringify(newTokens));
        } catch (error) {
          console.warn('Failed to save tokens to localStorage:', error);
        }
      }
    );
    
    builder.addMatcher(
      authApi.endpoints.getProfile.matchFulfilled,
      (state, { payload }) => {
        state.user = payload.user;
        // If we successfully got the profile, the user is authenticated
        state.isAuthenticated = true;
        try {
          localStorage.setItem('userData', JSON.stringify(payload.user));
        } catch (error) {
          console.warn('Failed to save user data to localStorage:', error);
        }
      }
    );
    
    builder.addMatcher(
      authApi.endpoints.getProfile.matchRejected,
      (state) => {
        // Profile fetch failed, clear auth state
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
        try {
          localStorage.removeItem('authTokens');
          localStorage.removeItem('userData');
        } catch (error) {
          console.warn('Failed to remove tokens from localStorage:', error);
        }
      }
    );
  },
});

export const { setCredentials, logout, updateTokens, setUser, setLoading } = authSlice.actions;
export default authSlice.reducer;