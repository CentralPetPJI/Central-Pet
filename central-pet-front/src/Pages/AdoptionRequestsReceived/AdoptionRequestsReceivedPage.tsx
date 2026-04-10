import { AdoptionApprovalModal } from '@/Components/AdoptionRequestsReceivedPage/adoption-approval-modal';
import { AdoptionRejectionModal } from '@/Components/AdoptionRequestsReceivedPage/adoption-rejection-modal';
import { AdoptionRequestCard } from '@/Components/AdoptionRequestsReceivedPage/adoption-request-card';
import { AdoptionRequestsPageHeader } from '@/Components/AdoptionRequestsReceivedPage/adoption-requests-page-header';
import { AdoptionRequestsSimulationPanel } from '@/Components/AdoptionRequestsReceivedPage/adoption-requests-simulation-panel';
import { useAuth } from '@/lib/auth-context';
import { isDevelopment } from '@/lib/dev-mode';
import { useAdoptionRequestsReceived } from './use-adoption-requests-received';

export default function AdoptionRequestsReceivedPage() {
  const { currentUser, isLoading: isAuthLoading } = useAuth();
  const currentUserId = currentUser?.id;
  const isDevelopmentMode = isDevelopment();

  const {
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
    approvalConfirmed,
    setSelectedPetId,
    setSimulateWithSharedContact,
    setSimulateContactShareConsent,
    setRejectionReason,
    setApprovalNote,
    setApprovalConfirmed,
    loadOwnPets,
    manageRequest,
    simulateRequest,
    openApprovalModal,
    openRejectionModal,
    closeApprovalModal,
    closeRejectionModal,
    confirmApproval,
    confirmRejection,
  } = useAdoptionRequestsReceived({
    currentUserId,
    isAuthLoading,
  });

  return (
    <section className="w-full px-1 pb-8 pt-4 lg:px-0 lg:pt-5">
      <AdoptionRequestsPageHeader
        showSimulationAction={isDevelopmentMode}
        onOpenSimulationPanel={() => void loadOwnPets()}
      />

      {isLoading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
          Carregando solicitacoes...
        </div>
      ) : null}

      {!isLoading && actionMessage ? (
        <div className="mb-4 rounded-3xl border border-cyan-200 bg-cyan-50 p-4 text-cyan-800 shadow-sm">
          {actionMessage}
        </div>
      ) : null}

      {isSimulationPanelOpen && isDevelopmentMode ? (
        <AdoptionRequestsSimulationPanel
          ownPets={ownPets}
          selectedPetId={selectedPetId}
          isLoadingOwnPets={isLoadingOwnPets}
          isSimulating={isSimulating}
          simulateWithSharedContact={simulateWithSharedContact}
          simulateContactShareConsent={simulateContactShareConsent}
          onSelectedPetIdChange={setSelectedPetId}
          onSimulateWithSharedContactChange={setSimulateWithSharedContact}
          onSimulateContactShareConsentChange={setSimulateContactShareConsent}
          onSimulate={() => void simulateRequest()}
        />
      ) : null}

      {!isLoading && errorMessage ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">
          {errorMessage}
        </div>
      ) : null}

      {!isLoading && !errorMessage && requests.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Nenhuma solicitacao recebida ate agora
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Assim que uma pessoa física demonstrar interesse, os detalhes aparecerão aqui.
          </p>
        </div>
      ) : null}

      {!isLoading && !errorMessage && requests.length > 0 ? (
        <div className="grid gap-4">
          {requests.map((request) => (
            <AdoptionRequestCard
              key={request.id}
              request={request}
              managedRequestId={managedRequestId}
              onShareContact={(requestId) => {
                void manageRequest(requestId, 'share_contact');
              }}
              onOpenApproval={openApprovalModal}
              onOpenRejection={openRejectionModal}
            />
          ))}
        </div>
      ) : null}

      <AdoptionApprovalModal
        modalData={approvalModalData}
        approvalNote={approvalNote}
        approvalConfirmed={approvalConfirmed}
        isSubmitting={managedRequestId === approvalModalData?.requestId}
        onApprovalNoteChange={setApprovalNote}
        onApprovalConfirmedChange={setApprovalConfirmed}
        onCancel={closeApprovalModal}
        onConfirm={confirmApproval}
      />

      <AdoptionRejectionModal
        modalData={rejectionModalData}
        rejectionReason={rejectionReason}
        isSubmitting={managedRequestId === rejectionModalData?.requestId}
        onRejectionReasonChange={setRejectionReason}
        onCancel={closeRejectionModal}
        onConfirm={confirmRejection}
      />
    </section>
  );
}
