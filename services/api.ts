'use client';

import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { authService } from './authService';
import { toastService } from './toastService';

// Configure API defaults
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081';

// Log API configuration
console.log('API Configuration:', {
  API_BASE_URL,
  ENV_VALUE: process.env.NEXT_PUBLIC_API_BASE_URL
});

// Create a configured axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => Promise.reject(error)
);


/**
 * API service class with methods to make standardized requests
 */
export const apiService = {
  /**
   * Make a GET request
   */
  get: async <T>(url: string, params?: any): Promise<T> => {
    try {
      const config: AxiosRequestConfig = { params };
      const response: AxiosResponse<T> = await api.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Make a POST request with JSON data
   */
  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response: AxiosResponse<T> = await api.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Make a POST request with FormData (for file uploads)
   */
  postFormData: async <T>(url: string, formData: FormData): Promise<T> => {
    try {
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
      const response: AxiosResponse<T> = await api.post<T>(url, formData, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Make a PUT request
   */
  put: async <T>(url: string, data: any): Promise<T> => {
    try {
      console.log(`[API PUT] Request to ${url}`, { data });
      const response = await api.put<T>(url, data);
      console.log(`[API PUT] Response from ${url}`, { status: response.status, data: response.data });
      return response.data;
    } catch (error) {
      console.error(`[API PUT] Error for ${url}:`, error);
      throw error;
    }
  },

  /**
   * Make a DELETE request
   */
  delete: async <T>(url: string): Promise<T> => {
    try {
      const response: AxiosResponse<T> = await api.delete<T>(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default api;
