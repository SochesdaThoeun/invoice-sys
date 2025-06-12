import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';

const BASE_URL = 'http://localhost:3000/api';

export const createApiClient = (baseURL: string = BASE_URL): AxiosInstance => {
  const apiClient = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });

  // Add request interceptor to include auth token
  apiClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Add response interceptor to handle common errors
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle common errors here (e.g. 401 unauthorized, network errors, etc.)
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        // Optionally redirect to login page or dispatch a logout action
      }
      return Promise.reject(error);
    }
  );

  return apiClient;
};

export const api = createApiClient();

// Generic API call wrapper with error handling
export const apiCall = async <T>(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    console.log(`API Request: ${method.toUpperCase()} ${url}`, data);
    const response = await api[method](url, method === 'get' ? config : data, method !== 'get' ? config : undefined);
    console.log(`API Success: ${method.toUpperCase()} ${url}`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`API Error: ${method.toUpperCase()} ${url}`, error);
    console.error('Error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error.response?.data || { message: error.message };
  }
}; 