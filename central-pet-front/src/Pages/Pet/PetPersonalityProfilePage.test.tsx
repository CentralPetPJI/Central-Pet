import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PetPersonalityProfilePage from '@/Pages/Pet/PetPersonalityProfilePage';

const { getMock, deleteMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  deleteMock: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  api: {
    get: getMock,
    post: vi.fn(),
    delete: deleteMock,
  },
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    currentUser: { id: 'user-1' },
  }),
}));

vi.mock('@/routes', () => ({
  routes: {
    login: { path: '/login' },
    pets: {
      mine: { path: '/pets/mine' },
      edit: { build: (id: string) => `/pets/${id}/edit` },
    },
  },
}));

vi.mock('@/storage/pets', () => ({
  resolveBackendId: (petId: string) => petId,
}));

vi.mock('@/Pages/Pet/AdoptionRequestArea.tsx', () => ({
  default: () => <div>Área de adoção</div>,
}));

vi.mock('@/Components/Moderation/ReportPetModal', () => ({
  default: () => null,
}));

vi.mock('@/Components/PetProfile/PetProfileHero', () => ({
  default: () => <div>Hero</div>,
}));

vi.mock('@/Components/PetProfile/PetProfileOverview', () => ({
  default: () => <div>Visão geral</div>,
}));

vi.mock('@/Components/PetProfile/PetProfileGallery', () => ({
  default: () => <div>Galeria</div>,
}));

vi.mock('@/Components/PetProfile/PetProfileSection', () => ({
  default: ({ title, children }: { title: string; children: ReactNode }) => (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  ),
}));

vi.mock('@/Components/PetProfile/PetProfileFactGrid', () => ({
  default: () => <div>Fact grid</div>,
}));

vi.mock('@/Components/PetProfile/PetProfilePersonalityList', () => ({
  default: () => <div>Personality list</div>,
}));

describe('Pagina Perfil do Pet', () => {
  beforeEach(() => {
    getMock.mockReset();
    deleteMock.mockReset();
  });

  it('exibe botão de excluir para tutor e remove pet', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    getMock.mockImplementation((url: string) => {
      if (url === '/personality-traits') {
        return Promise.resolve({ data: { data: [] } });
      }

      if (url === '/pets/pet-1') {
        return Promise.resolve({
          data: {
            data: {
              id: 'pet-1',
              profilePhoto: 'https://example.com/photo.jpg',
              galleryPhotos: [],
              name: 'Luna',
              age: '2',
              species: 'cat',
              breed: 'SRD',
              sex: 'female',
              size: 'small',
              microchipped: false,
              city: 'Campinas',
              state: 'SP',
              vaccinated: true,
              neutered: true,
              dewormed: true,
              needsHealthCare: false,
              physicalLimitation: false,
              visualLimitation: false,
              hearingLimitation: false,
              selectedPersonalities: [],
              responsibleUserId: 'user-1',
              sourceType: 'PESSOA_FISICA',
              sourceName: 'Tutor',
              createdAt: '2026-01-01T00:00:00.000Z',
              updatedAt: '2026-01-01T00:00:00.000Z',
              deleted: false,
            },
          },
        });
      }

      return Promise.reject(new Error('URL não mapeada no teste'));
    });
    deleteMock.mockResolvedValue({ data: {} });

    render(
      <MemoryRouter initialEntries={['/pets/pet-1']}>
        <Routes>
          <Route path="/pets/:petId" element={<PetPersonalityProfilePage />} />
          <Route path="/pets/mine" element={<div>Página meus pets</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Excluir pet' })).toBeInTheDocument();
    });

    screen.getByRole('button', { name: 'Excluir pet' }).click();

    await waitFor(() => {
      expect(deleteMock).toHaveBeenCalledWith('/pets/pet-1');
    });
    await waitFor(() => {
      expect(screen.getByText('Página meus pets')).toBeInTheDocument();
    });

    expect(confirmSpy).toHaveBeenCalled();
    confirmSpy.mockRestore();
  });
});
