import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { authService } from './authService';

// Store pending requests that are waiting for token refresh
const pendingRequests: Function[] = [];
let isRefreshing = false;

const api = axios.create({
    baseURL: 'http://localhost:8081',
    headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
    },
    withCredentials: true,
});

// Function to process queued requests after token refresh
const processQueue = (error: Error | null, token: string | null = null) => {
    pendingRequests.forEach((callback) => callback(error, token));
    // Clear the queue
    pendingRequests.length = 0;
};

// Add a request interceptor
api.interceptors.request.use(
    async (config) => {
        // Skip token handling for refresh endpoint
        if (config.url?.includes('/auth/refresh')) {
            console.log('Refresh token request detected - removing Authorization header');
            
            // For refresh token requests, we MUST NOT send the Authorization header
            if (config.headers) {
                delete config.headers.Authorization;
            }
            
            console.log('Refresh token request payload:', config.data);
            return config;
        }
        
        // For auth endpoints (except refresh), use current token
        if (config.url?.includes('/auth/')) {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        }
        
        // For all other API requests, ensure token is valid but don't force a refresh
        try {
            // Only use the current token without triggering a refresh
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (err) {
            console.error('Error preparing request:', err);
        }
        
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add a response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error: AxiosError) => {
        // Extract response and request config
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        
        // Only handle 401 errors for non-auth endpoints or failed refresh attempts
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            // Skip token refresh logic for auth endpoints
            if (originalRequest.url?.includes('/auth/') && 
                (originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/token'))) {
                // Auth endpoints that return 401 should just fail
                return Promise.reject(error);
            }
            
            // Mark this request as retried
            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;
                
                try {
                    // Attempt to refresh token
                    const newToken = await authService.refreshToken();
                    
                    if (newToken) {
                        // Successfully refreshed token, process pending requests
                        processQueue(null, newToken);
                        
                        // Update authorization header
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        } else {
                            originalRequest.headers = { Authorization: `Bearer ${newToken}` };
                        }
                        
                        // Retry the original request
                        return axios(originalRequest);
                    } else {
                        // Refresh failed, reject all pending requests
                        processQueue(new Error('Failed to refresh token'));
                        
                        // Clear auth state and redirect only if not on login page
                        // This prevents infinite redirect loops
                        if (!window.location.pathname.includes('/login')) {
                            // Clear auth state
                            localStorage.removeItem('token');
                            localStorage.removeItem('refreshToken');
                            localStorage.removeItem('user');
                            localStorage.removeItem('isAdmin');
                            
                            // Dispatch auth-changed event
                            window.dispatchEvent(new Event('auth-changed'));
                            
                            // Extract error message from response if possible
                            let errorMessage = 'Your session has expired. Please log in again.';
                            if (error.response?.data?.message) {
                                errorMessage = error.response.data.message;
                            }
                            
                            // Show notification
                            if (typeof window !== 'undefined') {
                                alert(errorMessage);
                            }
                            
                            // Redirect to login
                            window.location.href = '/login';
                        } else {
                            // On login page, just fail silently
                            console.log('Auth failed on login page, no redirect needed');
                        }
                        
                        return Promise.reject(error);
                    }
                } catch (refreshError) {
                    // Handle refresh error
                    processQueue(new Error('Failed to refresh token'));
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            } else {
                // Token refresh already in progress, queue this request
                return new Promise((resolve, reject) => {
                    pendingRequests.push((error: Error | null, token: string | null) => {
                        if (error) {
                            reject(error);
                        } else {
                            // Update authorization header
                            if (originalRequest.headers && token) {
                                originalRequest.headers.Authorization = `Bearer ${token}`;
                            } else if (token) {
                                originalRequest.headers = { Authorization: `Bearer ${token}` };
                            }
                            resolve(axios(originalRequest));
                        }
                    });
                });
            }
        }
        
        // Handle other errors
        console.error('Response error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
        });
        
        // Extract and format server error message if available
        if (error.response && error.response.data) {
            const errorData = error.response.data;
            // Use API error message if available instead of default axios message
            if (errorData.message) {
                error.message = errorData.message;
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;
