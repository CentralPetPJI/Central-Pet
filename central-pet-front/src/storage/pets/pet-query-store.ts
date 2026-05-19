import { create } from 'zustand';
import { api } from '@/lib/api';
import type { Pet, PetApiResponse } from '@/Models/pet';
import { mapApiResponseToPet } from '@/storage/pets/pet-helpers';
import type { PetPersonalityApiOption } from '@/storage/pets/pet-personality-options';

export type PetQueryFilters = {
  responsibleUserId?: string;
  adoptionStatus?: 'AVAILABLE' | 'ADOPTED' | 'UNAVAILABLE';
  state?: string;
  species?: 'DOG' | 'CAT';
  sex?: 'MALE' | 'FEMALE';
  size?: 'SMALL' | 'MEDIUM' | 'LARGE';
};

type QueryEntry = {
  pets: Pet[];
  isLoading: boolean;
  error: Error | null;
  lastFetchedAt: number | null;
};

type FetchQueryOptions = {
  force?: boolean;
};

interface PetQueryState {
  personalityOptions: PetPersonalityApiOption[];
  isPersonalityLoading: boolean;
  queryByKey: Record<string, QueryEntry>;
  actions: {
    fetchQuery: (filters?: PetQueryFilters, options?: FetchQueryOptions) => Promise<QueryEntry>;
    ensurePersonalityOptions: () => Promise<PetPersonalityApiOption[]>;
    getQueryKey: (filters?: PetQueryFilters) => string;
    removePetFromCache: (petId: string | number) => void;
  };
}

const emptyQueryEntry: QueryEntry = {
  pets: [],
  isLoading: false,
  error: null,
  lastFetchedAt: null,
};

let personalityRequest: Promise<PetPersonalityApiOption[]> | null = null;

const normalizeFilters = (filters?: PetQueryFilters): PetQueryFilters => {
  if (!filters) {
    return {};
  }

  return {
    responsibleUserId: filters.responsibleUserId,
    adoptionStatus: filters.adoptionStatus,
    state: filters.state,
    species: filters.species,
    sex: filters.sex,
    size: filters.size,
  };
};

const toQueryKey = (filters?: PetQueryFilters): string => {
  const normalizedFilters = normalizeFilters(filters);
  const pairs = Object.entries(normalizedFilters)
    .filter(([, value]) => value !== undefined)
    .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey));

  if (pairs.length === 0) {
    return 'all';
  }

  const params = new URLSearchParams();
  for (const [key, value] of pairs) {
    params.set(key, String(value));
  }

  return params.toString();
};

export const usePetQueryStore = create<PetQueryState>((set, get) => ({
  personalityOptions: [],
  isPersonalityLoading: false,
  queryByKey: {},

  actions: {
    getQueryKey: (filters) => toQueryKey(filters),

    ensurePersonalityOptions: async () => {
      const currentOptions = get().personalityOptions;
      if (currentOptions.length > 0) {
        return currentOptions;
      }

      if (!personalityRequest) {
        set({ isPersonalityLoading: true });

        personalityRequest = api
          .get<{ data: PetPersonalityApiOption[] }>('/personality-traits')
          .then((response) => response.data.data)
          .catch(() => [])
          .finally(() => {
            personalityRequest = null;
            set({ isPersonalityLoading: false });
          });
      }

      const fetchedOptions = await personalityRequest;
      set({ personalityOptions: fetchedOptions });
      return fetchedOptions;
    },

    fetchQuery: async (filters, _options) => {
      const normalizedFilters = normalizeFilters(filters);
      const queryKey = toQueryKey(normalizedFilters);
      const currentEntry = get().queryByKey[queryKey];

      set((state) => ({
        queryByKey: {
          ...state.queryByKey,
          [queryKey]: {
            ...(currentEntry ?? emptyQueryEntry),
            isLoading: true,
            error: null,
          },
        },
      }));

      try {
        const [response, personalityOptions] = await Promise.all([
          api.get<{ data: PetApiResponse[] }>('/pets', {
            params: normalizedFilters,
          }),
          get().actions.ensurePersonalityOptions(),
        ]);
        const pets = response.data.data.map((pet) => mapApiResponseToPet(pet, personalityOptions));
        const nextEntry: QueryEntry = {
          pets,
          isLoading: false,
          error: null,
          lastFetchedAt: Date.now(),
        };

        set((state) => ({
          queryByKey: {
            ...state.queryByKey,
            [queryKey]: nextEntry,
          },
        }));

        return nextEntry;
      } catch (err) {
        const nextEntry: QueryEntry = {
          pets: [],
          isLoading: false,
          error: err instanceof Error ? err : new Error('Erro ao carregar pets'),
          lastFetchedAt: null,
        };

        set((state) => ({
          queryByKey: {
            ...state.queryByKey,
            [queryKey]: nextEntry,
          },
        }));

        return nextEntry;
      }
    },

    removePetFromCache: (petId) => {
      set((state) => {
        const updatedQueries = Object.fromEntries(
          Object.entries(state.queryByKey).map(([queryKey, queryEntry]) => [
            queryKey,
            {
              ...queryEntry,
              pets: queryEntry.pets.filter((pet) => String(pet.id) !== String(petId)),
            },
          ]),
        );

        return { queryByKey: updatedQueries };
      });
    },
  },
}));
