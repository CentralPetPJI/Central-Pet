import { create } from 'zustand';
import { api } from '@/lib/api';
import type { PetApiResponse, ReceivedAdoptionRequest } from '@/Models/pet';

type AdoptionRequestModalData = {
  requestId: string;
  petName: string;
};

interface AdoptionRequestsReceivedState {
  currentUserId: string | null;
  requestId: number;
  requests: ReceivedAdoptionRequest[];
  ownPets: PetApiResponse[];
  isLoading: boolean;
  isLoadingOwnPets: boolean;
  errorMessage: string | null;
  actionMessage: string | null;
  managedRequestId: string | null;
  isSimulationPanelOpen: boolean;
  selectedPetId: string;
  isSimulating: boolean;
  simulateResponsibleContactShareConsent: boolean;
  simulateAdopterContactShareConsent: boolean;
  rejectionModalData: AdoptionRequestModalData | null;
  rejectionReason: string;
  approvalModalData: AdoptionRequestModalData | null;
  approvalNote: string;

  actions: {
    setCurrentUserId: (userId: string | null) => void;
    reset: () => void;
    resetSessionState: () => void;
    setSelectedPetId: (petId: string) => void;
    setSimulateResponsibleContactShareConsent: (consent: boolean) => void;
    setSimulateAdopterContactShareConsent: (consent: boolean) => void;
    setRejectionReason: (reason: string) => void;
    setApprovalNote: (note: string) => void;
    loadRequests: (userId: string) => Promise<void>;
    loadOwnPets: () => Promise<void>;
    manageRequest: (
      requestId: string,
      action: 'approve' | 'share_contact' | 'reject',
      note?: string,
    ) => Promise<boolean>;
    simulateRequest: () => Promise<void>;
    openApprovalModal: (request: ReceivedAdoptionRequest) => void;
    openRejectionModal: (request: ReceivedAdoptionRequest) => void;
    closeApprovalModal: () => void;
    closeRejectionModal: () => void;
    confirmApproval: () => Promise<void>;
    confirmRejection: () => Promise<void>;
  };
}

const createInitialState = () => ({
  currentUserId: null,
  requestId: 0,
  requests: [],
  ownPets: [],
  isLoading: true,
  isLoadingOwnPets: false,
  errorMessage: null,
  actionMessage: null,
  managedRequestId: null,
  isSimulationPanelOpen: false,
  selectedPetId: '',
  isSimulating: false,
  simulateResponsibleContactShareConsent: true,
  simulateAdopterContactShareConsent: true,
  rejectionModalData: null,
  rejectionReason: '',
  approvalModalData: null,
  approvalNote: '',
});

export const useAdoptionRequestsReceivedStore = create<AdoptionRequestsReceivedState>(
  (set, get) => ({
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

      setSelectedPetId: (petId) => {
        set({ selectedPetId: petId });
      },

      setSimulateResponsibleContactShareConsent: (consent) => {
        set({ simulateResponsibleContactShareConsent: consent });
      },

      setSimulateAdopterContactShareConsent: (consent) => {
        set({ simulateAdopterContactShareConsent: consent });
      },

      setRejectionReason: (reason) => {
        set({ rejectionReason: reason });
      },

      setApprovalNote: (note) => {
        set({ approvalNote: note });
      },

      loadRequests: async (userId) => {
        const nextRequestId = get().requestId + 1;
        set({ isLoading: true, errorMessage: null, requestId: nextRequestId });

        try {
          const response = await api.get<{ data: ReceivedAdoptionRequest[] }>(
            '/adoption-requests',
            {
              params: {
                type: 'received',
                responsibleUserId: userId,
              },
            },
          );

          if (get().requestId === nextRequestId) {
            set({ requests: response.data.data });
          }
        } catch {
          if (get().requestId === nextRequestId) {
            set({
              errorMessage: 'Nao foi possivel carregar as solicitacoes recebidas no momento.',
            });
          }
        } finally {
          if (get().requestId === nextRequestId) {
            set({ isLoading: false });
          }
        }
      },

      loadOwnPets: async () => {
        const { currentUserId } = get();
        if (!currentUserId) {
          return;
        }

        set({ isLoadingOwnPets: true, errorMessage: null });

        try {
          const response = await api.get<{ data: PetApiResponse[] }>('/pets', {
            params: {
              responsibleUserId: currentUserId,
            },
          });

          const pets = response.data.data.filter((pet) => pet.responsibleUserId === currentUserId);

          set({
            ownPets: pets,
            selectedPetId: pets[0]?.id ?? '',
            isSimulationPanelOpen: true,
          });

          if (pets.length === 0) {
            set({ actionMessage: 'Cadastre pelo menos um pet para simular uma solicitacao.' });
          }
        } catch {
          set({ errorMessage: 'Nao foi possivel carregar os pets para simulacao no momento.' });
        } finally {
          set({ isLoadingOwnPets: false });
        }
      },

      manageRequest: async (requestId, action, note) => {
        set({ managedRequestId: requestId, errorMessage: null, actionMessage: null });

        try {
          const response = await api.patch<{ message: string; data: ReceivedAdoptionRequest }>(
            `/adoption-requests/${requestId}`,
            {
              action,
              note,
            },
          );

          const updatedRequest = response.data.data;

          set((state) => ({
            requests: state.requests.map((request) =>
              request.id === updatedRequest.id ? updatedRequest : request,
            ),
          }));
          set({ actionMessage: response.data.message });

          const { currentUserId } = get();
          if (currentUserId) {
            await get().actions.loadRequests(currentUserId);
          }

          return true;
        } catch {
          set({ errorMessage: 'Nao foi possivel atualizar a solicitacao no momento.' });
          return false;
        } finally {
          set({ managedRequestId: null });
        }
      },

      simulateRequest: async () => {
        const {
          ownPets,
          selectedPetId,
          simulateResponsibleContactShareConsent,
          simulateAdopterContactShareConsent,
          currentUserId,
        } = get();

        const pet = ownPets.find((item) => item.id === selectedPetId);

        if (!pet || !currentUserId) {
          set({ errorMessage: 'Selecione um pet cadastrado para simular a solicitacao.' });
          return;
        }

        set({ isSimulating: true, errorMessage: null, actionMessage: null });

        try {
          const response = await api.post<{ message: string; data: ReceivedAdoptionRequest }>(
            '/adoption-requests/simulate',
            {
              petId: pet.id,
              petResponsibleUserId: pet.responsibleUserId,
              initialStatus: simulateResponsibleContactShareConsent ? 'CONTACT_SHARED' : 'PENDING',
              adopterContactShareConsent: simulateAdopterContactShareConsent,
              responsibleContactShareConsent: simulateResponsibleContactShareConsent,
            },
          );

          set({ actionMessage: response.data.message });
          await get().actions.loadRequests(currentUserId);
        } catch (error) {
          const errorMessage =
            (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            'Nao foi possivel simular a solicitacao no momento.';
          set({ errorMessage });
        } finally {
          set({ isSimulating: false });
        }
      },

      openApprovalModal: (request) => {
        set({
          approvalModalData: {
            requestId: request.id,
            petName: request.pet.name,
          },
          approvalNote: '',
        });
      },

      openRejectionModal: (request) => {
        set({
          rejectionModalData: {
            requestId: request.id,
            petName: request.pet.name,
          },
          rejectionReason: '',
        });
      },

      closeApprovalModal: () => {
        set({ approvalModalData: null, approvalNote: '' });
      },

      closeRejectionModal: () => {
        set({ rejectionModalData: null, rejectionReason: '' });
      },

      confirmApproval: async () => {
        const { approvalModalData, approvalNote } = get();
        if (!approvalModalData) {
          return;
        }

        const success = await get().actions.manageRequest(
          approvalModalData.requestId,
          'approve',
          approvalNote.trim() || undefined,
        );

        if (success) {
          get().actions.closeApprovalModal();
        }
      },

      confirmRejection: async () => {
        const { rejectionModalData, rejectionReason } = get();
        if (!rejectionModalData) {
          return;
        }

        const success = await get().actions.manageRequest(
          rejectionModalData.requestId,
          'reject',
          rejectionReason.trim() || undefined,
        );

        if (success) {
          get().actions.closeRejectionModal();
        }
      },
    },
  }),
);
