import type { ReactNode } from 'react';
import type { RouteObject } from 'react-router-dom';
import MainPage from '@/Pages/MainPage';
import MyPetsPage from '@/Pages/MyPetsPage';
import AdoptionRequestsReceivedPage from '@/Pages/AdoptionRequestsReceivedPage';
import PetPersonalityRegisterPage from '@/Pages/Pet/PetPersonalityRegisterPage.tsx';
import PetPersonalityProfilePage from '@/Pages/Pet/PetPersonalityProfilePage.tsx';
import Login from '@/Pages/Login/Login';
import Register from '@/Pages/Register/Register';

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
  adoptionRequests: {
    received: {
      path: '/adoption-requests/received',
      element: <AdoptionRequestsReceivedPage />,
    } satisfies AppRoute,
  },
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
