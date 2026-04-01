import axios, { type InternalAxiosRequestConfig } from 'axios';
import { getStoredMockUserId } from './mock-auth';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const mockUserId = getStoredMockUserId();

  if (mockUserId) {
    config.headers.set('x-mock-user-id', mockUserId);
  }

  return config;
});
