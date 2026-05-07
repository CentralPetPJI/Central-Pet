import { useMemo, useState } from 'react';
import { AdoptionApprovalModal } from '@/Components/AdoptionRequests/AdoptionApprovalModal';
import { AdoptionRejectionModal } from '@/Components/AdoptionRequests/AdoptionRejectionModal';
import { AdoptionRequestCard } from '@/Components/AdoptionRequests/AdoptionRequestCard';
import { sortAdoptionRequests } from '@/Components/AdoptionRequests/adoptionRequestsHelpers';
import { AdoptionRequestsPageHeader } from '@/Components/AdoptionRequests/AdoptionRequestsPageHeader';
import { AdoptionRequestsSimulationPanel } from '@/Components/AdoptionRequests/AdoptionRequestsSimulationPanel';
import { SentAdoptionRequestCard } from '@/Components/AdoptionRequests/SentAdoptionRequestCard';
import { useAuth } from '@/lib/auth-context';
import { isDevelopment } from '@/lib/dev-mode';
import { AdoptionRequestStatus } from '@/Models/adoption-request-status';
import { useAdoptionRequestsReceived } from './use-adoption-requests-received';
import { useAdoptionRequestsSent } from './use-adoption-requests-sent';

type Tab = 'received' | 'sent';
type StatusFilter = 'all' | AdoptionRequestStatus;

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: AdoptionRequestStatus.PENDING, label: 'Pendentes' },
  { value: AdoptionRequestStatus.CONTACT_SHARED, label: 'Contato compartilhado' },
  { value: AdoptionRequestStatus.APPROVED, label: 'Aprovadas' },
  { value: AdoptionRequestStatus.REJECTED, label: 'Recusadas' },
  { value: AdoptionRequestStatus.CANCELLED, label: 'Canceladas' },
];

export default function AdoptionRequestsPage() {
  const { currentUser, isLoading: isAuthLoading } = useAuth();
  const currentUserId = currentUser?.id;
  const isDevelopmentMode = isDevelopment();
  const [activeTab, setActiveTab] = useState<Tab>('received');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const received = useAdoptionRequestsReceived({
    currentUserId,
    isAuthLoading,
  });

  const sent = useAdoptionRequestsSent({
    currentUserId,
    isAuthLoading,
  });

  const isLoading = activeTab === 'received' ? received.isLoading : sent.isLoading;
  const errorMessage = activeTab === 'received' ? received.errorMessage : sent.errorMessage;
  const allRequests = activeTab === 'received' ? received.requests : sent.requests;

  const pendingCount = useMemo(
    () => allRequests.filter((r) => r.status === AdoptionRequestStatus.PENDING).length,
    [allRequests],
  );

  const receivedPendingCount = useMemo(
    () => received.requests.filter((r) => r.status === AdoptionRequestStatus.PENDING).length,
    [received.requests],
  );

  const sentPendingCount = useMemo(
    () => sent.requests.filter((r) => r.status === AdoptionRequestStatus.PENDING).length,
    [sent.requests],
  );

  const filteredAndSortedRequests = useMemo(() => {
    const filtered =
      statusFilter === 'all' ? allRequests : allRequests.filter((r) => r.status === statusFilter);
    return sortAdoptionRequests(filtered);
  }, [allRequests, statusFilter]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setStatusFilter('all');
  };

  return (
    <section className="w-full px-1 pb-8 pt-4 lg:px-0 lg:pt-5">
      <AdoptionRequestsPageHeader
        showSimulationAction={isDevelopmentMode && activeTab === 'received'}
        onOpenSimulationPanel={() => void received.loadOwnPets()}
        title={activeTab === 'received' ? 'Solicitações Recebidas' : 'Solicitações Enviadas'}
        description={
          activeTab === 'received'
            ? 'Gerencie as solicitações de adoção dos pets que você cadastrou.'
            : 'Acompanhe o status das solicitações de adoção que você enviou.'
        }
      />

      <div className="mb-6 flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => handleTabChange('received')}
          className={`px-6 py-3 text-sm font-bold transition-colors ${
            activeTab === 'received'
              ? 'border-b-2 border-cyan-600 text-cyan-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Recebidas
          {receivedPendingCount > 0 && (
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
              {receivedPendingCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('sent')}
          className={`px-6 py-3 text-sm font-bold transition-colors ${
            activeTab === 'sent'
              ? 'border-b-2 border-cyan-600 text-cyan-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Enviadas
          {sentPendingCount > 0 && (
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
              {sentPendingCount}
            </span>
          )}
        </button>
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
          Carregando solicitações...
        </div>
      ) : null}

      {activeTab === 'received' && !isLoading && received.actionMessage ? (
        <div className="mb-4 rounded-3xl border border-cyan-200 bg-cyan-50 p-4 text-cyan-800 shadow-sm">
          {received.actionMessage}
        </div>
      ) : null}

      {activeTab === 'received' && received.isSimulationPanelOpen && isDevelopmentMode ? (
        <AdoptionRequestsSimulationPanel
          ownPets={received.ownPets}
          selectedPetId={received.selectedPetId}
          isLoadingOwnPets={received.isLoadingOwnPets}
          isSimulating={received.isSimulating}
          simulateResponsibleContactShareConsent={received.simulateResponsibleContactShareConsent}
          simulateAdopterContactShareConsent={received.simulateAdopterContactShareConsent}
          onSelectedPetIdChange={received.setSelectedPetId}
          onSimulateResponsibleContactShareConsentChange={
            received.setSimulateResponsibleContactShareConsent
          }
          onSimulateAdopterContactShareConsentChange={
            received.setSimulateAdopterContactShareConsent
          }
          onSimulate={() => void received.simulateRequest()}
        />
      ) : null}

      {!isLoading && errorMessage ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">
          {errorMessage}
        </div>
      ) : null}

      {!isLoading && !errorMessage && allRequests.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {STATUS_FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatusFilter(option.value)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === option.value
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {option.label}
              {option.value === 'all' ? (
                <span className="ml-1.5 opacity-70">{allRequests.length}</span>
              ) : null}
              {option.value === AdoptionRequestStatus.PENDING && pendingCount > 0 ? (
                <span className="ml-1.5 opacity-70">{pendingCount}</span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      {!isLoading && !errorMessage && filteredAndSortedRequests.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            {statusFilter !== 'all'
              ? 'Nenhuma solicitação encontrada para o filtro selecionado'
              : activeTab === 'received'
                ? 'Nenhuma solicitação recebida até agora'
                : 'Você ainda não enviou nenhuma solicitação'}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {statusFilter !== 'all'
              ? 'Tente selecionar outro status ou visualizar todas as solicitações.'
              : activeTab === 'received'
                ? 'Assim que uma pessoa física demonstrar interesse, os detalhes aparecerão aqui.'
                : 'Navegue pelos pets disponíveis e demonstre seu interesse para vê-los aqui.'}
          </p>
        </div>
      ) : null}

      {!isLoading && filteredAndSortedRequests.length > 0 ? (
        <div className="grid gap-4">
          {activeTab === 'received'
            ? (filteredAndSortedRequests as typeof received.requests).map((request) => (
                <AdoptionRequestCard
                  key={request.id}
                  request={request}
                  managedRequestId={received.managedRequestId}
                  onShareContact={(requestId) => {
                    void received.manageRequest(requestId, 'share_contact');
                  }}
                  onOpenApproval={received.openApprovalModal}
                  onOpenRejection={received.openRejectionModal}
                />
              ))
            : (filteredAndSortedRequests as typeof sent.requests).map((request) => (
                <SentAdoptionRequestCard key={request.id} request={request} />
              ))}
        </div>
      ) : null}

      <AdoptionApprovalModal
        modalData={received.approvalModalData}
        approvalNote={received.approvalNote}
        isSubmitting={received.managedRequestId === received.approvalModalData?.requestId}
        onApprovalNoteChange={received.setApprovalNote}
        onCancel={received.closeApprovalModal}
        onConfirm={received.confirmApproval}
      />

      <AdoptionRejectionModal
        modalData={received.rejectionModalData}
        rejectionReason={received.rejectionReason}
        isSubmitting={received.managedRequestId === received.rejectionModalData?.requestId}
        onRejectionReasonChange={received.setRejectionReason}
        onCancel={received.closeRejectionModal}
        onConfirm={received.confirmRejection}
      />
    </section>
  );
}
