import axios, { type InternalAxiosRequestConfig } from 'axios';
import { getStoredUserId } from '@/storage';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

/**
 * Interceptor de requisição para autenticação
 *
 * - Modo Mock: adiciona header x-user-id do localStorage
 * - Modo JWT: não adiciona nada (cookies são enviados automaticamente)
 */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Só adiciona x-user-id em modo mock
  const userId = getStoredUserId();

  if (userId) {
    config.headers.set('x-user-id', userId);
  }

  return config;
});
