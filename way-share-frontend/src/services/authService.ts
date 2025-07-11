import { store } from '../store/store';
import { authApi } from '../store/api/authApiSlice';
import { logout, updateTokens } from '../store/slices/authSlice';

class AuthService {
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;

  init() {
    // Check for existing tokens on startup
    const savedTokens = localStorage.getItem('authTokens');
    const savedUser = localStorage.getItem('userData');
    
    if (savedTokens && savedUser) {
      try {
        // Parse the saved tokens and user - types are already defined
        JSON.parse(savedTokens);
        JSON.parse(savedUser);
        
        // Verify the token is still valid by attempting to get profile
        this.validateSession();
      } catch {
        // Invalid JSON, clear the corrupted data
        localStorage.removeItem('authTokens');
        localStorage.removeItem('userData');
      }
    } else if (savedTokens) {
      // Have tokens but no user data - clear everything and re-authenticate
      localStorage.removeItem('authTokens');
      localStorage.removeItem('userData');
    }

    // Setup axios interceptor for 401 responses
    this.setupInterceptors();
  }

  private async validateSession() {
    try {
      // Try to get user profile to validate token
      await store.dispatch(authApi.endpoints.getProfile.initiate()).unwrap();
      this.scheduleTokenRefresh();
    } catch {
      // Token is invalid, clear auth state
      this.clearAuth();
    }
  }

  private setupInterceptors() {
    // Listen for 401 responses and try to refresh token
    // This would be implemented with an axios interceptor or RTK Query middleware
  }

  private scheduleTokenRefresh() {
    // Clear any existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Schedule refresh 5 minutes before token expires (access token expires in 15 minutes)
    this.refreshTimer = setTimeout(() => {
      this.refreshToken();
    }, 10 * 60 * 1000); // 10 minutes
  }

  private async refreshToken() {
    try {
      // Use empty body since refresh token comes from HTTP-only cookie
      const result = await store.dispatch(
        authApi.endpoints.refreshToken.initiate({})
      ).unwrap();

      // Backend returns { success: true, data: { accessToken } }
      const newTokens = {
        accessToken: result.data.accessToken,
        refreshToken: '', // HTTP-only cookie managed by server
      };
      
      store.dispatch(updateTokens(newTokens));
      this.scheduleTokenRefresh();
    } catch {
      // Refresh failed, clear auth and redirect to login
      this.clearAuth();
    }
  }

  private clearAuth() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    // Clear any stored data
    localStorage.removeItem('authTokens');
    localStorage.removeItem('userData');
    store.dispatch(logout());
  }

  logout() {
    this.clearAuth();
  }

  destroy() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}

export const authService = new AuthService();