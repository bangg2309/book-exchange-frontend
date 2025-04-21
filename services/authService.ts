import api from './api';
import { ApiResponse } from '@/types/apiResponse';
import { toastService } from './toastService';

// Add singleton variables to track refresh state
let _refreshInProgress = false;
let _refreshPromise: Promise<string | null> | null = null;
let _tokenExpiryTime: number | null = null;

// Add variable to track the last refresh time
let _lastRefreshTime = 0;
const REFRESH_COOLDOWN = 30000; // 30 seconds cooldown between refresh attempts
// Add variable to track the next scheduled refresh
let _nextScheduledRefresh: number | null = null;

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  authenticated: boolean;
  userInfo: any; // Replace with your User type
  expiresIn?: number; // Added to track token expiry
}

// API specific response interface
interface ApiAuthResponse {
  code: number;
  message: string;
  result: {
    accessToken: string;
    refreshToken: string;
    authenticated: boolean;
    userInfo: any;
    expiresIn?: number; // Added to track token expiry
  };
}

interface UserInfo {
  id: string | null;
  username: string;
  email: string | null;
  roles: Array<{
    name: string;
    description: string;
    permissions: any[];
  }>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

// Utility functions for token management
const tokenUtils = {
  // Parse and store token expiry time
  setTokenExpiry: (expiresIn?: number) => {
    if (expiresIn) {
      // Convert seconds to milliseconds and add to current time
      _tokenExpiryTime = Date.now() + (expiresIn * 1000);
      console.log(`Token will expire at: ${new Date(_tokenExpiryTime).toISOString()}`);
    } else {
      // Default to 15 minutes if not specified
      _tokenExpiryTime = Date.now() + (15 * 60 * 1000);
    }
  },
  
  // Check if token is about to expire (within the next 2 minutes)
  isTokenExpiringSoon: (): boolean => {
    if (!_tokenExpiryTime) return false;
    // Return true if token expires within 2 minutes (120000 ms)
    return _tokenExpiryTime - Date.now() < 120000;
  },
  
  // Check if token is expired
  isTokenExpired: (): boolean => {
    if (!_tokenExpiryTime) return false;
    return Date.now() >= _tokenExpiryTime;
  }
};

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post<ApiAuthResponse>('/auth/token', credentials);
      
      // Check if we have a valid response with the expected structure
      if (!response.data || !response.data.result) {
        throw new Error('Invalid response from server');
      }

      const authData = response.data.result;
      
      // Store the accessToken in localStorage
      localStorage.setItem('token', authData.accessToken);
      localStorage.setItem('refreshToken', authData.refreshToken);
      
      // Set token expiry time
      tokenUtils.setTokenExpiry(authData.expiresIn);
      
      // Make sure userInfo is not undefined before storing
      if (authData.userInfo) {
        localStorage.setItem('user', JSON.stringify(authData.userInfo));
        
        // Check if user is admin and store it
        const isAdmin = authData.userInfo.roles?.some(
          (role: any) => role && role.name && role.name.toUpperCase() === 'ADMIN'
        );
        localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
      } else {
        console.warn('userInfo is undefined in login response');
      }
      
      // Notify components about authentication change
      if (typeof window !== 'undefined') {
        try {
          window.dispatchEvent(new Event('auth-changed'));
          console.log('Auth changed event dispatched after login');
        } catch (e) {
          console.error('Failed to dispatch auth-changed event:', e);
        }
      }

      // Hiển thị toast thành công
      toastService.success('Đăng nhập thành công!');

      return authData;
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Extract the error message from the API response
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        // Use the server's error message if available
        const errorMessage = errorData.message || 'Authentication failed';
        // Hiển thị toast lỗi
        toastService.error(errorMessage);
        throw new Error(errorMessage);
      }
      
      // If no specific error message is available from the API, throw a generic error
      const message = 'Login failed. Please check your credentials and try again.';
      toastService.error(message);
      throw new Error(message);
    }
  },

  loginWithProvider: async (provider: string, token: string): Promise<any> => {
    try {
      const response = await api.post<ApiAuthResponse>(`/auth/${provider}`, { token });
      
      // Check if we have a valid response
      if (!response.data || !response.data.result) {
        throw new Error(`Invalid response from ${provider} authentication`);
      }
      
      const authData = response.data.result;
      
      // Store auth data
      localStorage.setItem('token', authData.accessToken);
      localStorage.setItem('refreshToken', authData.refreshToken);
      
      if (authData.userInfo) {
        localStorage.setItem('user', JSON.stringify(authData.userInfo));
      } else {
        console.warn('userInfo is undefined in provider login response');
      }
      
      return authData;
    } catch (error) {
      console.error(`${provider} login error:`, error);
      throw new Error(`Failed to authenticate with ${provider}`);
    }
  },

  logout: async (): Promise<void> => {
    try {
      // Get the refresh token before clearing storage
      const refreshToken = localStorage.getItem('refreshToken');
      
      // Call logout endpoint with the refresh token using the correct field name 'token'
      if (refreshToken) {
        await api.post('/auth/logout', { token: refreshToken });
      } else {
        // Still try to logout even without refresh token
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage regardless of API call success
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('isAdmin');
      
      // Dispatch auth changed event to update UI components in the same window
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-changed'));
      }
      
      // Show success toast
      toastService.success('Đăng xuất thành công!');
      
      // Redirect to home page after logout
      window.location.href = '/';
    }
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    if (!user) return null;
    
    try {
      return JSON.parse(user);
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  },

  setupTokenRefresh: (refreshInterval = 4 * 60 * 1000) => {
    // Clear any existing refresh interval
    if (window.__tokenRefreshInterval) {
      clearInterval(window.__tokenRefreshInterval);
    }
    
    // Set up periodic token refresh check - minimum 2 minutes interval
    const actualInterval = Math.max(refreshInterval, 2 * 60 * 1000); 
    console.log(`Setting up token refresh with interval: ${actualInterval/1000} seconds`);
    
    // Schedule the first refresh if we're authenticated
    if (authService.isAuthenticated()) {
      _nextScheduledRefresh = Date.now() + actualInterval;
      console.log(`Next token refresh scheduled at: ${new Date(_nextScheduledRefresh).toLocaleTimeString()}`);
    }
    
    window.__tokenRefreshInterval = setInterval(async () => {
      if (authService.isAuthenticated()) {
        const now = Date.now();
        
        // Only refresh if we've reached the scheduled time
        if (_nextScheduledRefresh && now >= _nextScheduledRefresh) {
          console.log(`Executing scheduled token refresh at: ${new Date().toLocaleTimeString()}`);
          
          try {
            await authService.refreshToken();
            // Schedule next refresh exactly at the interval
            _nextScheduledRefresh = Date.now() + actualInterval;
            console.log(`Next token refresh scheduled at: ${new Date(_nextScheduledRefresh).toLocaleTimeString()}`);
          } catch (err) {
            console.log('Scheduled token refresh failed:', err);
            // Still schedule next attempt
            _nextScheduledRefresh = Date.now() + actualInterval;
          }
        } else {
          const timeUntilNextRefresh = _nextScheduledRefresh ? Math.floor((_nextScheduledRefresh - now) / 1000) : 'unknown';
          console.log(`Periodic check: Next scheduled refresh in ${timeUntilNextRefresh}s`);
        }
      } else {
        // Not authenticated, clear the interval and reset scheduled refresh
        console.log('Not authenticated, clearing refresh interval');
        clearInterval(window.__tokenRefreshInterval);
        _nextScheduledRefresh = null;
      }
    }, 60000) as unknown as number; // Check every minute to keep logs reasonable
    
    // Only refresh on visibility change if we're past the scheduled time
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && 
          authService.isAuthenticated() &&
          _nextScheduledRefresh && Date.now() >= _nextScheduledRefresh) {
        console.log('Tab became visible, executing scheduled token refresh');
        authService.refreshToken().catch(err => {
          console.log('Visibility change token refresh failed:', err);
        });
        // Schedule next refresh
        _nextScheduledRefresh = Date.now() + actualInterval;
      }
    });
    
    // Setup listener for storage events to handle logout in other tabs
    window.addEventListener('storage', (event) => {
      if (event.key === 'token' && !event.newValue) {
        // Token was removed in another tab, clear local interval
        clearInterval(window.__tokenRefreshInterval);
        _nextScheduledRefresh = null;
      }
    });
  },

  getUserInfo: async (): Promise<UserInfo | null> => {
    try {
      // Try to get user from localStorage first
      const cachedUser = authService.getCurrentUser();
      if (cachedUser) {
        console.log('getUserInfo - Using cached user data');
        return cachedUser;
      }
      
      console.log('getUserInfo - Fetching from API');
      const response = await api.get<ApiResponse<UserInfo>>('/users/my-info');
      
      if (response.data.code === 1000 && response.data.result) {
        const userInfo = response.data.result;
        console.log('getUserInfo - Successfully fetched user info:', JSON.stringify(userInfo));
        
        // Store user info in localStorage
        localStorage.setItem('user', JSON.stringify(userInfo));
        
        // Check if user is admin and store it
        const isAdmin = userInfo.roles?.some(
          (role: any) => role && role.name && role.name.toUpperCase() === 'ADMIN'
        );
        localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
        
        // Dispatch auth-changed event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth-changed'));
        }
        
        return userInfo;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      // If API call fails, still try to use cached data
      return authService.getCurrentUser();
    }
  },

  isAdmin: (): boolean => {
    const user = authService.getCurrentUser();
    
    if (!user) {
      console.log('isAdmin check: No user found in localStorage');
      return false;
    }
    
    // Debug user data with string formatting to avoid circular references
    try {
      console.log('isAdmin check - User data:', JSON.stringify(user));
    } catch (e) {
      console.log('isAdmin check - User data exists but could not be stringified');
    }
    
    // More robust role checking
    if (!user.roles || !Array.isArray(user.roles)) {
      console.log('isAdmin check: User has no roles or roles is not an array');
      return false;
    }
    
    // Check roles and print them for debugging
    console.log('isAdmin check - Roles array:', user.roles.map((r: { name: string }) => r.name).join(', '));
    
    // Check if user has ADMIN role - case insensitive check with extra safety
    const isAdminRole = user.roles.some((role: { name: string }) => {
      if (!role || typeof role !== 'object') return false;
      if (!role.name || typeof role.name !== 'string') return false;
      return role.name.toUpperCase() === 'ADMIN';
    });
    
    console.log('isAdmin check - Has ADMIN role:', isAdminRole);
    
    // Return true if admin role is present
    return isAdminRole;
  },

  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  getRedirectPath: (): string => {
    // Force a fresh check of admin status
    const isUserAdmin = authService.isAdmin();
    console.log('getRedirectPath - User is admin:', isUserAdmin);
    
    // Redirect to admin for admin users, profile for regular users
    return isUserAdmin ? '/admin' : '/profile';
  },

  register: async (data: RegisterData): Promise<any> => {
    try {
      const response = await api.post('/auth/register', data);
      
      // Hiển thị toast thành công
      toastService.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản');
      
      return response.data;
    } catch (error: any) {
      // Handle error with appropriate error message
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const errorMessage = errorData.message || 'Registration failed';
        
        // Hiển thị toast lỗi
        toastService.error(errorMessage);
        
        throw new Error(errorMessage);
      }
      
      // Default error message if we don't have a specific error from API
      const errorMessage = 'Đăng ký thất bại. Vui lòng kiểm tra thông tin và thử lại.';
      toastService.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  socialLogin: async (provider: string): Promise<void> => {
    try {
      const url = `/auth/${provider.toLowerCase()}/authorize`;
      const response = await api.get(url);
      
      // Check for valid response
      if (response.data?.redirectUrl) {
        // Redirect to the OAuth provider's login page
        window.location.href = response.data.redirectUrl;
      } else {
        toastService.error(`Invalid response for ${provider} authentication`);
        throw new Error(`Invalid response for ${provider} authentication`);
      }
    } catch (error: any) {
      console.error(`${provider} auth error:`, error);
      const errorMessage = error.response?.data?.message || `Failed to authenticate with ${provider}`;
      toastService.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  refreshToken: async (): Promise<string | null> => {
    try {
      // If we already have a refresh attempt in progress, return that promise
      if (_refreshInProgress && _refreshPromise) {
        console.log('Refresh already in progress, returning existing promise');
        return _refreshPromise;
      }
      
      // Enforce cool down period between refresh attempts
      const now = Date.now();
      if (now - _lastRefreshTime < REFRESH_COOLDOWN) {
        console.log('Token refresh on cooldown, waiting...');
        return localStorage.getItem('token');
      }
      
      _lastRefreshTime = now;
      
      // Set flag to indicate refresh is in progress
      _refreshInProgress = true;
      
      // Create a new promise for this refresh attempt
      _refreshPromise = (async () => {
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          
          if (!refreshToken) {
            console.warn('No refresh token available');
            toastService.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            return null;
          }
          
          // Add token to request
          const response = await api.post<ApiAuthResponse>('/auth/refresh', { token: refreshToken });
          
          if (!response.data || !response.data.result) {
            throw new Error('Invalid refresh token response');
          }
          
          const authData = response.data.result;
          
          // Store the new tokens
          localStorage.setItem('token', authData.accessToken);
          localStorage.setItem('refreshToken', authData.refreshToken || refreshToken);
          
          // Set token expiry time
          tokenUtils.setTokenExpiry(authData.expiresIn);
          
          return authData.accessToken;
        } catch (error: any) {
          console.error('Token refresh failed:', error);
          
          if (error.response?.status === 401) {
            // Clear auth data on 401 Unauthorized
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem('isAdmin');
            
            // Show session expired toast
            toastService.error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
            
            // Dispatch auth changed event
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('auth-changed'));
            }
          }
          
          return null;
        } finally {
          // Reset the in-progress flag and promise
          _refreshInProgress = false;
          _refreshPromise = null;
        }
      })();
      
      return _refreshPromise;
    } catch (error) {
      console.error('Error in refreshToken:', error);
      _refreshInProgress = false;
      _refreshPromise = null;
      return null;
    }
  },
  
  // Updated method to check and refresh token if needed
  ensureValidToken: async (): Promise<string | null> => {
    // If not authenticated, return null immediately
    if (!authService.isAuthenticated()) {
      return null;
    }
    
    // Get current token
    const currentToken = localStorage.getItem('token');
    
    // If token is expired, refresh it immediately
    if (tokenUtils.isTokenExpired()) {
      console.log('Token is expired, refreshing');
      return authService.refreshToken();
    }
    
    // If token is expiring soon (within 2 minutes), refresh in background
    // But only if we haven't recently refreshed
    if (tokenUtils.isTokenExpiringSoon() && (Date.now() - _lastRefreshTime > REFRESH_COOLDOWN)) {
      console.log('Token is expiring soon, refreshing in background');
      // Don't await to avoid blocking the current request
      authService.refreshToken().catch(err => {
        console.log('Background token refresh failed:', err);
      });
    }
    
    // Return the current token
    return currentToken;
  }
};

// Add this to global window object for TypeScript
declare global {
  interface Window {
    __tokenRefreshInterval: number;
  }
}