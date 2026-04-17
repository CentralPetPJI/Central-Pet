import type { ReactNode } from 'react';
import type { RouteObject } from 'react-router-dom';
import MainPage from '@/Pages/MainPage';
import MyPetsPage from '@/Pages/MyPetsPage';
import AdoptionRequestsReceivedPage from '@/Pages/AdoptionRequestsReceived/AdoptionRequestsReceivedPage';
import PetPersonalityRegisterPage from '@/Pages/Pet/PetPersonalityRegisterPage.tsx';
import PetPersonalityProfilePage from '@/Pages/Pet/PetPersonalityProfilePage.tsx';
import Login from '@/Pages/Login/Login';
import Register from '@/Pages/Register/Register';
import ProfilePage from '@/Pages/Profile/ProfilePage';
import InstitutionsPage from '@/Pages/Institutions/InstitutionsPage';
import InstitutionDetailPage from '@/Pages/Institutions/InstitutionDetailPage';

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
    received: {
      path: '/adoption-requests/received',
      element: <AdoptionRequestsReceivedPage />,
    } satisfies AppRoute,
  },
  institutions: {
    list: {
      path: '/institutions',
      element: <InstitutionsPage />,
    } satisfies AppRoute,
    detail: {
      path: '/institutions/:id',
      element: <InstitutionDetailPage />,
      build: (id: number | string) => `/institutions/${id}`,
    } satisfies DynamicAppRoute,
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
