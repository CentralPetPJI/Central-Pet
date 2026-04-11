import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { PetApiResponse, ReceivedAdoptionRequest } from '@/Models/pet';

type AdoptionRequestModalData = {
  requestId: string;
  petName: string;
};

type UseAdoptionRequestsReceivedParams = {
  currentUserId?: string;
  isAuthLoading: boolean;
};

export function useAdoptionRequestsReceived({
  currentUserId,
  isAuthLoading,
}: UseAdoptionRequestsReceivedParams) {
  const [requests, setRequests] = useState<ReceivedAdoptionRequest[]>([]);
  const [ownPets, setOwnPets] = useState<PetApiResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOwnPets, setIsLoadingOwnPets] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [managedRequestId, setManagedRequestId] = useState<string | null>(null);
  const [isSimulationPanelOpen, setIsSimulationPanelOpen] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulateWithSharedContact, setSimulateWithSharedContact] = useState(true);
  const [simulateContactShareConsent, setSimulateContactShareConsent] = useState(true);
  const [rejectionModalData, setRejectionModalData] = useState<AdoptionRequestModalData | null>(
    null,
  );
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalModalData, setApprovalModalData] = useState<AdoptionRequestModalData | null>(null);
  const [approvalNote, setApprovalNote] = useState('');

  const closeRejectionModal = useCallback(() => {
    setRejectionModalData(null);
    setRejectionReason('');
  }, []);

  const closeApprovalModal = useCallback(() => {
    setApprovalModalData(null);
    setApprovalNote('');
  }, []);

  const loadRequests = useCallback(async (userId: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await api.get<{ data: ReceivedAdoptionRequest[] }>('/adoption-requests', {
        params: {
          type: 'received',
          responsibleUserId: userId,
        },
      });

      setRequests(response.data.data);
    } catch {
      setErrorMessage('Nao foi possivel carregar as solicitacoes recebidas no momento.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!currentUserId) {
      setIsLoading(false);
      setErrorMessage(null);
      // Clear session-dependent state when no authenticated user
      setRequests([]);
      setOwnPets([]);
      return;
    }

    void loadRequests(currentUserId);
  }, [currentUserId, isAuthLoading, loadRequests]);

  const loadOwnPets = useCallback(async () => {
    if (!currentUserId) {
      return;
    }

    setIsLoadingOwnPets(true);
    setErrorMessage(null);

    try {
      const response = await api.get<{ data: PetApiResponse[] }>('/pets', {
        params: {
          responsibleUserId: currentUserId,
        },
      });

      const pets = response.data.data.filter((pet) => pet.responsibleUserId === currentUserId);

      setOwnPets(pets);
      setSelectedPetId(pets[0]?.id ?? '');
      setIsSimulationPanelOpen(true);

      if (pets.length === 0) {
        setActionMessage('Cadastre pelo menos um pet para simular uma solicitacao.');
      }
    } catch {
      setErrorMessage('Nao foi possivel carregar os pets para simulacao no momento.');
    } finally {
      setIsLoadingOwnPets(false);
    }
  }, [currentUserId]);

  const manageRequest = useCallback(
    async (requestId: string, action: 'approve' | 'share_contact' | 'reject', note?: string) => {
      setManagedRequestId(requestId);
      setErrorMessage(null);
      setActionMessage(null);

      try {
        const response = await api.patch<{ message: string; data: ReceivedAdoptionRequest }>(
          `/adoption-requests/${requestId}`,
          {
            action,
            note,
          },
        );

        const updatedRequest = response.data.data;

        setRequests((currentRequests) =>
          currentRequests.map((request) =>
            request.id === updatedRequest.id ? updatedRequest : request,
          ),
        );
        setActionMessage(response.data.message);

        if (action === 'approve' && currentUserId) {
          await loadRequests(currentUserId);
        }
      } catch {
        setErrorMessage('Nao foi possivel atualizar a solicitacao no momento.');
      } finally {
        setManagedRequestId(null);
      }
    },
    [currentUserId, loadRequests],
  );

  const confirmRejection = useCallback(async () => {
    if (!rejectionModalData) {
      return;
    }

    try {
      await manageRequest(
        rejectionModalData.requestId,
        'reject',
        rejectionReason.trim() || undefined,
      );
      closeRejectionModal();
    } catch {
      // Error is handled in manageRequest; modal stays open
    }
  }, [closeRejectionModal, manageRequest, rejectionModalData, rejectionReason]);

  const confirmApproval = useCallback(async () => {
    if (!approvalModalData) {
      return;
    }

    try {
      await manageRequest(approvalModalData.requestId, 'approve', approvalNote.trim() || undefined);
      closeApprovalModal();
    } catch {
      // Error is handled in manageRequest; modal stays open
    }
  }, [approvalModalData, approvalNote, closeApprovalModal, manageRequest]);

  const simulateRequest = useCallback(async () => {
    const pet = ownPets.find((item) => item.id === selectedPetId);

    if (!pet || !currentUserId) {
      setErrorMessage('Selecione um pet cadastrado para simular a solicitacao.');
      return;
    }

    setIsSimulating(true);
    setErrorMessage(null);
    setActionMessage(null);

    try {
      const response = await api.post<{ message: string; data: ReceivedAdoptionRequest }>(
        '/adoption-requests/simulate',
        {
          petId: pet.id,
          petResponsibleUserId: pet.responsibleUserId,
          initialStatus: simulateWithSharedContact ? 'contact_shared' : 'pending',
          adopterContactShareConsent: simulateContactShareConsent,
        },
      );

      setActionMessage(response.data.message);
      await loadRequests(currentUserId);
    } catch {
      setErrorMessage('Nao foi possivel simular a solicitacao no momento.');
    } finally {
      setIsSimulating(false);
    }
  }, [
    currentUserId,
    loadRequests,
    ownPets,
    selectedPetId,
    simulateContactShareConsent,
    simulateWithSharedContact,
  ]);

  const openApprovalModal = useCallback((request: ReceivedAdoptionRequest) => {
    setApprovalModalData({
      requestId: request.id,
      petName: request.pet.name,
    });
    setApprovalNote('');
  }, []);

  const openRejectionModal = useCallback((request: ReceivedAdoptionRequest) => {
    setRejectionModalData({
      requestId: request.id,
      petName: request.pet.name,
    });
    setRejectionReason('');
  }, []);

  return {
    requests,
    ownPets,
    isLoading,
    isLoadingOwnPets,
    errorMessage,
    actionMessage,
    managedRequestId,
    isSimulationPanelOpen,
    selectedPetId,
    isSimulating,
    simulateWithSharedContact,
    simulateContactShareConsent,
    rejectionModalData,
    rejectionReason,
    approvalModalData,
    approvalNote,
    setSelectedPetId,
    setSimulateWithSharedContact,
    setSimulateContactShareConsent,
    setRejectionReason,
    setApprovalNote,
    loadOwnPets,
    manageRequest,
    simulateRequest,
    openApprovalModal,
    openRejectionModal,
    closeApprovalModal,
    closeRejectionModal,
    confirmApproval,
    confirmRejection,
  };
}
