import type { ReactNode } from 'react';
import type { RouteObject } from 'react-router-dom';
import MainPage from '@/Pages/MainPage';
import PetPersonalityProfilePage from '@/Pages/PetPersonalityProfilePage';
import PetPersonalityRegisterPage from '@/Pages/PetPersonalityRegisterPage';

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
  } satisfies AppRoute,
  pets: {
    new: {
      path: '/pets/new',
      element: <PetPersonalityRegisterPage />,
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
