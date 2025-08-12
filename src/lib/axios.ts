import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';
import { tokenUtils } from './auth-utils';

// Extend the AxiosRequestConfig interface to include our custom _retry property
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Create axios instance with enhanced configuration
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_API || 'http://localhost:8000',
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

// Request interceptor to add auth headers and logging
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = tokenUtils.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
        {
          data: config.data,
          params: config.params,
          headers: config.headers
        }
      );
    }

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for enhanced error handling and logging
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `✅ API Response: ${response.status} ${response.config.url}`,
        {
          data: response.data,
          headers: response.headers
        }
      );
    }

    return response;
  },
  async (error: AxiosError) => {
    // Enhanced error handling with token refresh
    const { response, request, message, config } = error;

    if (response) {
      // Server responded with error status
      const responseData = response.data as any;
      const errorMessage =
        responseData?.message || responseData?.error || 'Server error occurred';
      const status = response.status;

      console.error(`❌ API Error ${status}: ${errorMessage}`, {
        url: response.config?.url,
        method: response.config?.method,
        data: response.data
      });

      // Handle specific error statuses
      switch (status) {
        case 401:
          // Unauthorized - try to refresh token
          console.error('🔐 Unauthorized request - attempting token refresh');

          if (config && !(config as CustomAxiosRequestConfig)._retry) {
            (config as CustomAxiosRequestConfig)._retry = true;

            try {
              const refreshSuccess = await tokenUtils.refreshTokens();
              if (refreshSuccess && config) {
                // Retry the original request with new token
                const newToken = tokenUtils.getAccessToken();
                if (newToken && config.headers) {
                  config.headers.Authorization = `Bearer ${newToken}`;
                  return axiosInstance(config);
                }
              }
            } catch (refreshError) {
              console.error('❌ Token refresh failed:', refreshError);
              // Redirect to login or clear auth
              tokenUtils.clearAuth();
              // You can add redirect logic here
            }
          }
          break;
        case 403:
          console.error('🚫 Forbidden request - user lacks permission');
          break;
        case 404:
          console.error('🔍 Resource not found');
          break;
        case 422:
          console.error('📝 Validation error - check request data');
          break;
        case 429:
          console.error('⏰ Rate limit exceeded - too many requests');
          break;
        case 500:
          console.error('💥 Internal server error');
          break;
        case 502:
        case 503:
        case 504:
          console.error('🌐 Service unavailable - backend issues');
          break;
        default:
          console.error(`❓ Unexpected error status: ${status}`);
      }
    } else if (request) {
      // Request was made but no response received
      console.error('🌐 Network error - no response received', {
        message,
        url: request.responseURL
      });
    } else {
      // Something else happened
      console.error('❓ Request setup error:', message);
    }

    return Promise.reject(error);
  }
);

// Add request/response timeout handling
axiosInstance.defaults.timeout = 15000;

// Add retry logic for failed requests
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    // Retry logic for network errors (not for 4xx/5xx status codes)
    if (!response && config && !(config as CustomAxiosRequestConfig)._retry) {
      (config as CustomAxiosRequestConfig)._retry = true;

      try {
        console.log('🔄 Retrying failed request...');
        return await axiosInstance(config);
      } catch (retryError) {
        console.error('❌ Retry failed:', retryError);
        return Promise.reject(retryError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

// Export types for better TypeScript support
export type { AxiosResponse, AxiosError };
