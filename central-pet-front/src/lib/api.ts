import axios, { type InternalAxiosRequestConfig } from 'axios';
import { getStoredUserId } from '@/storage/auth';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const userId = getStoredUserId();

  if (userId) {
    config.headers.set('x-user-id', userId);
  }

  return config;
});
