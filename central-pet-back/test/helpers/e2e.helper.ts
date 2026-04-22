import request, { Response } from 'supertest';

type HttpServer = Parameters<typeof request>[0];

export interface UserData {
  fullName: string;
  email: string;
  password: string;
  role: string;
  cpf?: string;
  birthDate?: Date;
  acceptTerms?: boolean;
}

export interface Credentials {
  email: string;
  password: string;
}

export const createUser = async (httpServer: HttpServer, userData: UserData): Promise<Response> => {
  const response = await request(httpServer).post('/api/users').send(userData);
  expect(response.status).toBe(201);
  return response;
};

export const login = async (
  httpServer: HttpServer,
  credentials: Credentials,
): Promise<Response> => {
  const response = await request(httpServer).post('/api/auth/login').send(credentials);
  expect(response.status).toBe(201);
  return response;
};

export const getSessionCookie = (response: Response): string | undefined => {
  const raw = response.headers['set-cookie'];
  if (!raw) return undefined;
  const cookies: string[] = Array.isArray(raw) ? raw : [raw];
  const sessionCookie = cookies.find((cookie) => cookie.startsWith('central_pet_session='));
  return sessionCookie;
};
