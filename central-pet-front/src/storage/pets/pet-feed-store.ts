import { create } from 'zustand';
import type { Pet } from '@/Models/pet';
import { usePetQueryStore, type PetQueryFilters } from '@/storage/pets/pet-query-store';

export type PetFeedFilters = PetQueryFilters;

interface PetFeedState {
  filters: PetFeedFilters;
  pets: Pet[];
  isLoading: boolean;
  error: Error | null;
  lastFetchedAt: number | null;
  actions: {
    setFilters: (filters?: PetFeedFilters) => void;
    fetchPets: () => Promise<void>;
    reset: () => void;
  };
}

const initialState = {
  filters: {},
  pets: [],
  isLoading: true,
  error: null,
  lastFetchedAt: null,
};

export const usePetFeedStore = create<PetFeedState>((set, get) => ({
  ...initialState,

  actions: {
    setFilters: (filters = {}) => {
      set({ filters });
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

    reset: () => {
      set(initialState);
    },
  },
}));
