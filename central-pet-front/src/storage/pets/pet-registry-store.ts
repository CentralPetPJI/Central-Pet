import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api } from '@/lib/api';
import type { PetListItem } from '@/Models/pet';
import type { PetPersonalityOption } from '@/storage/pets';
import { usePetQueryStore } from '@/storage/pets/pet-query-store';

interface PetRegistryState {
  // Lista de pets do usuário logado
  myPets: PetListItem[];
  isMyPetsLoading: boolean;
  myPetsError: string | null;

  // Cache de traços de personalidade
  personalityOptions: PetPersonalityOption[];
  isPersonalityLoading: boolean;

  actions: {
    fetchMyPets: (userId: string) => Promise<void>;
    deletePet: (petId: string | number) => Promise<void>;
    fetchPersonalityOptions: () => Promise<void>;
    reset: () => void;
  };
}

const initialState = {
  myPets: [],
  isMyPetsLoading: false,
  myPetsError: null,
  personalityOptions: [],
  isPersonalityLoading: false,
};

export const usePetRegistryStore = create<PetRegistryState>()(
  persist(
    (set, get) => ({
      ...initialState,

      actions: {
        reset: () => set(initialState),

        fetchMyPets: async (userId: string) => {
          set({ isMyPetsLoading: true, myPetsError: null });
          const queryResult = await usePetQueryStore.getState().actions.fetchQuery({
            responsibleUserId: userId,
          });

          if (queryResult.error) {
            set({
              myPets: [],
              isMyPetsLoading: false,
              myPetsError: 'Não foi possível carregar seus pets.',
            });
            return;
          }

          const normalizedPets: PetListItem[] = queryResult.pets
            .filter((pet) => pet.responsibleUserId === userId)
            .map((pet) => ({
              id: String(pet.id),
              name: pet.name,
              species: pet.species,
              city: pet.city,
              state: pet.state,
              adoptionStatus: pet.adoptionStatus ?? 'AVAILABLE',
            }));

          set({ myPets: normalizedPets, isMyPetsLoading: false, myPetsError: null });
        },

        deletePet: async (petId: string | number) => {
          await api.delete(`/pets/${petId}`);
          set((state) => ({
            myPets: state.myPets.filter((pet) => String(pet.id) !== String(petId)),
          }));
          usePetQueryStore.getState().actions.removePetFromCache(petId);
        },

        fetchPersonalityOptions: async () => {
          // Se já tivermos opções, não precisamos buscar de novo (cache)
          if (get().personalityOptions.length > 0) return;

          set({ isPersonalityLoading: true });
          const options = await usePetQueryStore.getState().actions.ensurePersonalityOptions();
          set({ personalityOptions: options, isPersonalityLoading: false });
        },
      },
    }),
    {
      name: 'central-pet:registry-storage',
      storage: createJSONStorage(() => localStorage),
      // Persistimos apenas o cache de personalidades e a lista de pets para carregamento offline/rápido
      partialize: (state) => ({
        personalityOptions: state.personalityOptions,
        myPets: state.myPets,
      }),
    },
  ),
);
