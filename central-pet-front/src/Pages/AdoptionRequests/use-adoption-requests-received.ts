import { useEffect } from 'react';
import { useAdoptionRequestsReceivedStore } from '@/storage/adoption-requests';

type UseAdoptionRequestsReceivedParams = {
  currentUserId?: string;
  isAuthLoading: boolean;
};

// TODO: refatorar esse hook, talvez usar zustand para organizar melhor os estados e funcoes relacionados as solicitacoes recebidas, e separar a logica de simulacao em um hook a parte
export function useAdoptionRequestsReceived({
  currentUserId,
  isAuthLoading,
}: UseAdoptionRequestsReceivedParams) {
  const {
    actions,
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
    simulateResponsibleContactShareConsent,
    simulateAdopterContactShareConsent,
    rejectionModalData,
    rejectionReason,
    approvalModalData,
    approvalNote,
  } = useAdoptionRequestsReceivedStore();

  useEffect(() => {
    actions.setCurrentUserId(currentUserId ?? null);

    if (isAuthLoading) {
      return;
    }

    if (!currentUserId) {
      actions.resetSessionState();
      return;
    }

    void actions.loadRequests(currentUserId);
  }, [actions, currentUserId, isAuthLoading]);

  useEffect(() => () => actions.reset(), [actions]);

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
    simulateResponsibleContactShareConsent,
    simulateAdopterContactShareConsent,
    rejectionModalData,
    rejectionReason,
    approvalModalData,
    approvalNote,
    setSelectedPetId: actions.setSelectedPetId,
    setSimulateResponsibleContactShareConsent: actions.setSimulateResponsibleContactShareConsent,
    setSimulateAdopterContactShareConsent: actions.setSimulateAdopterContactShareConsent,
    setRejectionReason: actions.setRejectionReason,
    setApprovalNote: actions.setApprovalNote,
    loadOwnPets: actions.loadOwnPets,
    manageRequest: actions.manageRequest,
    simulateRequest: actions.simulateRequest,
    openApprovalModal: actions.openApprovalModal,
    openRejectionModal: actions.openRejectionModal,
    closeApprovalModal: actions.closeApprovalModal,
    closeRejectionModal: actions.closeRejectionModal,
    confirmApproval: actions.confirmApproval,
    confirmRejection: actions.confirmRejection,
  };
}
