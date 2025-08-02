import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_API,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth headers if needed
axiosInstance.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    // const token = getAuthToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors here
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.error('Unauthorized request');
    } else if (error.response?.status === 500) {
      // Handle server errors
      console.error('Server error');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
