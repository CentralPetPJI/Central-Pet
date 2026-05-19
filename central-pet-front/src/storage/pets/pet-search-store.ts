import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Pet } from '@/Models/pet';
import { usePetQueryStore, type PetQueryFilters } from '@/storage/pets/pet-query-store';

export type SearchFilters = Omit<PetQueryFilters, 'responsibleUserId' | 'adoptionStatus'> & {
  adoptionStatus: 'AVAILABLE';
};

interface PetSearchState {
  filters: SearchFilters;
  pets: Pet[];
  isLoading: boolean;
  error: Error | null;
  lastFetchedAt: number | null;

  actions: {
    setFilters: (filters: Partial<SearchFilters>) => void;
    clearFilters: () => void;
    fetchPets: () => Promise<void>;
  };
}

const initialFilters: SearchFilters = {
  adoptionStatus: 'AVAILABLE',
  state: undefined,
  species: undefined,
  sex: undefined,
  size: undefined,
};

export const usePetSearchStore = create<PetSearchState>()(
  persist(
    (set, get) => ({
      filters: initialFilters,
      pets: [],
      isLoading: false,
      error: null,
      lastFetchedAt: null,

      actions: {
        setFilters: (newFilters) => {
          set((state) => ({
            filters: { ...state.filters, ...newFilters },
          }));
        },

        clearFilters: () => {
          set({ filters: initialFilters });
        },

        fetchPets: async () => {
          const { filters } = get();
          set({ isLoading: true, error: null });

          const queryResult = await usePetQueryStore.getState().actions.fetchQuery(filters);
          set({
            pets: queryResult.pets,
            isLoading: queryResult.isLoading,
            error: queryResult.error,
            lastFetchedAt: queryResult.lastFetchedAt,
          });
        },
      },
    }),
    {
      name: 'central-pet:search-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        filters: state.filters,
        pets: state.pets,
        lastFetchedAt: state.lastFetchedAt,
      }),
    },
  ),
);
