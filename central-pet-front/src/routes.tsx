import type { ReactNode } from 'react';
import { useRoutes, type RouteObject } from 'react-router-dom';
import MainPage from '@/Pages/MainPage';
import MyPetsPage from '@/Pages/MyPetsPage';
import AdoptionRequestsPage from '@/Pages/AdoptionRequests/AdoptionRequestsPage';
import PetPersonalityRegisterPage from '@/Pages/Pet/PetPersonalityRegisterPage.tsx';
import PetPersonalityProfilePage from '@/Pages/Pet/PetPersonalityProfilePage.tsx';
import Login from '@/Pages/Login/Login';
import Register from '@/Pages/Register/Register';
import ProfilePage from '@/Pages/Profile/ProfilePage';

type AppRoute = RouteObject & {
  element?: ReactNode;
};

type DynamicAppRoute = AppRoute & {
  build: (_id: number | string) => string;
};

export const routes = {
  home: {
    path: '/',
    element: <MainPage />,
  } satisfies AppRoute,
  login: {
    path: '/login',
    element: <Login />,
  } satisfies AppRoute,
  register: {
    path: '/register',
    element: <Register />,
  } satisfies AppRoute,
  profile: {
    path: '/profile',
    element: <ProfilePage />,
  } satisfies AppRoute,
  adoptionRequests: {
    path: '/adoption-requests',
    element: <AdoptionRequestsPage />,
  } satisfies AppRoute,
  pets: {
    new: {
      path: '/pets/new',
      element: <PetPersonalityRegisterPage />,
    } satisfies AppRoute,
    mine: {
      path: '/pets/mine',
      element: <MyPetsPage />,
    } satisfies AppRoute,
    detail: {
      path: '/pets/:petId',
      element: <PetPersonalityProfilePage />,
      build: (petId: number | string) => `/pets/${petId}`,
    } satisfies DynamicAppRoute,
    edit: {
      path: '/pets/:petId/edit',
      element: <PetPersonalityRegisterPage />,
      build: (petId: number | string) => `/pets/${petId}/edit`,
    } satisfies DynamicAppRoute,
  },
} as const;

/**
 * Extrai todas as rotas com propriedade `path` de um objeto de rotas aninhado.
 * Usa cache para evitar recomputações e evita recursão desnecessária quando um valor já é uma rota.
 * @param obj Objeto de rotas
 * @returns Lista de rotas para o React Router
 */
const extractRoutesCache = new WeakMap<Record<string, unknown>, RouteObject[]>();

export function extractRoutes(obj: Record<string, unknown>): RouteObject[] {
  if (extractRoutesCache.has(obj)) return extractRoutesCache.get(obj)!;

  const result: RouteObject[] = [];
  Object.values(obj).forEach((value) => {
    if (typeof value === 'object' && value !== null) {
      if ('path' in value) {
        // Quando o objeto já representa uma rota, adiciona e não continua descendendo nele
        result.push(value as RouteObject);
        return;
      }
      // Busca recursiva para rotas aninhadas
      result.push(...extractRoutes(value as Record<string, unknown>));
    }
  });

  extractRoutesCache.set(obj, result);
  return result;
}

export const useAppRoutes = () => {
  return useRoutes(extractRoutes(routes));
};
