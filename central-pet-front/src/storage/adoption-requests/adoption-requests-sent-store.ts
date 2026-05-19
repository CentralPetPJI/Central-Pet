import { create } from 'zustand';
import { api } from '@/lib/api';
import type { ReceivedAdoptionRequest } from '@/Models/pet';

interface AdoptionRequestsSentState {
  currentUserId: string | null;
  requestId: number;
  requests: ReceivedAdoptionRequest[];
  isLoading: boolean;
  errorMessage: string | null;

  actions: {
    setCurrentUserId: (userId: string | null) => void;
    reset: () => void;
    resetSessionState: () => void;
    loadRequests: (userId: string) => Promise<void>;
  };
}

const createInitialState = () => ({
  currentUserId: null,
  requestId: 0,
  requests: [],
  isLoading: true,
  errorMessage: null,
});

export const useAdoptionRequestsSentStore = create<AdoptionRequestsSentState>((set, get) => ({
  ...createInitialState(),

  actions: {
    setCurrentUserId: (userId) => {
      set({ currentUserId: userId });
    },

    reset: () => {
      set({ ...createInitialState() });
    },

    resetSessionState: () => {
      set({
        ...createInitialState(),
        isLoading: false,
      });
    },

    loadRequests: async (userId) => {
      const nextRequestId = get().requestId + 1;
      set({ isLoading: true, errorMessage: null, requestId: nextRequestId });

      try {
        const response = await api.get<{ data: ReceivedAdoptionRequest[] }>('/adoption-requests', {
          params: {
            type: 'sent',
            adopterId: userId,
          },
        });

        if (get().requestId === nextRequestId) {
          set({ requests: response.data.data });
        }
      } catch {
        if (get().requestId === nextRequestId) {
          set({ errorMessage: 'Não foi possível carregar as solicitações enviadas no momento.' });
        }
      } finally {
        if (get().requestId === nextRequestId) {
          set({ isLoading: false });
        }
      }
    },
  },
}));
