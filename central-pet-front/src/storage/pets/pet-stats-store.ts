import { create } from 'zustand';
import { api, apiBaseUrl } from '@/lib/api';

export const PET_STATS_CHANGED_BROWSER_EVENT = 'central-pet:pet-stats-changed';
const PET_STATS_CHANGED_SERVER_EVENT = 'pet-stats-changed';

export type PetStats = {
  availableBySpecies: Record<string, number>;
  adopted: number;
};

interface PetStatsState {
  stats: PetStats;
  isLoading: boolean;
  error: Error | null;
  eventSource: EventSource | null;

  actions: {
    fetchStats: () => Promise<void>;
    startListening: () => void;
    stopListening: () => void;
  };
}

const emptyPetStats: PetStats = {
  availableBySpecies: {},
  adopted: 0,
};

export const usePetStatsStore = create<PetStatsState>((set, get) => ({
  stats: emptyPetStats,
  isLoading: true,
  error: null,
  eventSource: null,

  actions: {
    fetchStats: async () => {
      set({ error: null });
      // Só marca como loading se for a primeira vez ou se não houver stats
      if (get().stats === emptyPetStats) {
        set({ isLoading: true });
      }

      try {
        const response = await api.get<{ data: PetStats }>('/pets/stats');
        set({ stats: response.data.data });
      } catch (err) {
        set({
          error: err instanceof Error ? err : new Error('Erro ao carregar estatísticas dos pets'),
        });
      } finally {
        set({ isLoading: false });
      }
    },

    startListening: () => {
      if (get().eventSource || typeof EventSource === 'undefined') return;

      const source = new EventSource(`${apiBaseUrl}/pets/stats/events`, {
        withCredentials: true,
      });

      source.addEventListener(PET_STATS_CHANGED_SERVER_EVENT, async () => {
        const { actions } = get();
        await actions.fetchStats();
        window.dispatchEvent(new Event(PET_STATS_CHANGED_BROWSER_EVENT));
      });

      set({ eventSource: source });
    },

    stopListening: () => {
      const { eventSource } = get();
      if (eventSource) {
        eventSource.close();
        set({ eventSource: null });
      }
    },
  },
}));
