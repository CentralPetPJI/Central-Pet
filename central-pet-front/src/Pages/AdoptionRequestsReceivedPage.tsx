import { useCallback, useEffect, useState } from 'react';
import { MapPin, MessageSquareText, PawPrint, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { isDevelopment } from '@/lib/dev-mode';
import { formatPetSpecies } from '@/lib/formatters';
import type { PetApiResponse, ReceivedAdoptionRequest } from '@/Models/pet';
import { AdoptionApprovalModal } from '@/Components/AdoptionRequests/adoption-approval-modal';
import { AdoptionRejectionModal } from '@/Components/AdoptionRequests/adoption-rejection-modal';
import {
  canManageDecision,
  canShareContact,
  getAdoptionRequestStatusPresentation,
} from '@/Models/adoption-request-status';
import { getPublicIdFromBackend } from '@/storage/pets';

/**
 * Retorna o ID apropriado para uso em rotas locais.
 * Para pets que vieram do backend com UUID, tenta encontrar o publicId.
 * Para pets mock (que já têm ID numérico), retorna o próprio ID.
 */
function getPetRouteId(petId: string | number): string | number {
  // Se já é numérico, usa direto
  if (typeof petId === 'number') {
    return petId;
  }

  // Se é string (UUID), tenta converter para publicId
  const publicId = getPublicIdFromBackend(petId);
  return publicId ?? petId;
}

function formatRequestDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(date));
}

export default function AdoptionRequestsReceivedPage() {
  const { currentUser, isLoading: isAuthLoading } = useAuth();
  const currentUserId = currentUser?.id;
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
  const [rejectionModalData, setRejectionModalData] = useState<{
    requestId: string;
    petName: string;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalModalData, setApprovalModalData] = useState<{
    requestId: string;
    petName: string;
  } | null>(null);
  const [approvalNote, setApprovalNote] = useState('');
  const [approvalConfirmed, setApprovalConfirmed] = useState(false);

  const closeRejectionModal = () => {
    setRejectionModalData(null);
    setRejectionReason('');
  };

  const closeApprovalModal = () => {
    setApprovalModalData(null);
    setApprovalNote('');
    setApprovalConfirmed(false);
  };

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
      return;
    }

    void loadRequests(currentUserId);
  }, [currentUserId, isAuthLoading, loadRequests]);

  const loadOwnPets = async () => {
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
  };

  const manageRequest = async (
    requestId: string,
    action: 'approve' | 'share_contact' | 'reject',
    note?: string,
  ) => {
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
    } catch {
      setErrorMessage('Nao foi possivel atualizar a solicitacao no momento.');
    } finally {
      setManagedRequestId(null);
    }
  };

  const confirmRejection = () => {
    if (!rejectionModalData) {
      return;
    }

    void manageRequest(rejectionModalData.requestId, 'reject', rejectionReason.trim() || undefined);
    closeRejectionModal();
  };

  const confirmApproval = () => {
    if (!approvalModalData) {
      return;
    }

    void manageRequest(
      approvalModalData.requestId,
      'approve',
      approvalNote.trim() || undefined,
    );
    closeApprovalModal();
  };

  const simulateRequest = async () => {
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
  };

  return (
    <section className="w-full px-1 pb-8 pt-4 lg:px-0 lg:pt-5">
      <div className="mb-6 flex flex-col gap-3 rounded-3xl bg-linear-to-r from-amber-50 via-white to-cyan-50 p-5 shadow-sm ring-1 ring-slate-200 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Solicitações de adoção recebidas
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Gerencie as solicitações de adoção dos pets que você cadastrou. Para cada pedido, você
            pode revisar a mensagem do interessado, verificar a localização e decidir se compartilha
            seu contato para dar continuidade ao processo de adoção ou rejeitar caso o pet já tenha
            sido adotado ou não seja mais adequado.
          </p>
        </div>

        <Link
          to="/pets/new"
          className="inline-flex items-center justify-center rounded-full bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
        >
          Cadastrar novo pet
        </Link>

        {isDevelopment() ? (
          <button
            type="button"
            onClick={() => void loadOwnPets()}
            className="inline-flex items-center justify-center rounded-full border border-cyan-300 bg-white px-5 py-3 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50"
          >
            Simular solicitação
          </button>
        ) : null}
      </div>

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

      {isSimulationPanelOpen && isDevelopment() ? (
        <div className="mb-4 rounded-3xl border border-cyan-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
                Simulação de solicitação
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Escolha um pet cadastrado para gerar uma solicitação fake de teste.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void simulateRequest()}
              disabled={isSimulating || isLoadingOwnPets || ownPets.length === 0}
              className="inline-flex items-center justify-center rounded-full bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSimulating ? 'Simulando...' : 'Gerar solicitação'}
            </button>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px]">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Pet</span>
              <select
                value={selectedPetId}
                onChange={(event) => setSelectedPetId(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700"
              >
                {ownPets.length === 0 ? <option value="">Nenhum pet disponivel</option> : null}
                {ownPets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} - {formatPetSpecies(pet.species)}
                  </option>
                ))}
              </select>
            </label>

            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
              {isLoadingOwnPets ? 'Carregando pets...' : `${ownPets.length} pet(s) disponiveis`}
            </div>
          </div>

          <div className="mt-4 grid gap-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 ring-1 ring-slate-200">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={simulateWithSharedContact}
                onChange={(event) => setSimulateWithSharedContact(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
              />
              Criar simulacao com contato ja compartilhado
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={simulateContactShareConsent}
                onChange={(event) => setSimulateContactShareConsent(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
              />
              Adotante autoriza compartilhamento de contato
            </label>
          </div>
        </div>
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
          {requests.map((request) => {
            const statusPresentation = getAdoptionRequestStatusPresentation(request.status);

            return (
              <article
                key={request.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusPresentation.className}`}
                    >
                      {statusPresentation.label}
                    </span>
                    <span className="text-sm text-slate-500">
                      Recebida em {formatRequestDate(request.requestedAt)}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{request.pet.name}</h2>
                    <div className="mt-1 space-y-1 text-sm text-slate-600">
                      <p className="flex items-center gap-2">
                        <PawPrint className="h-4 w-4 text-cyan-700" />
                        <span>{formatPetSpecies(request.pet.species)}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-cyan-700" />
                        <span>
                          {request.pet.city}/{request.pet.state}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200">
                  <p className="flex items-center gap-2 font-semibold text-slate-900">
                    <UserRound className="h-4 w-4 text-cyan-700" />
                    <span>{request.adopter.name}</span>
                  </p>
                  <p className="mt-1 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-cyan-700" />
                    <span>
                      {request.adopter.city}/{request.adopter.state}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <div>
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <MessageSquareText className="h-4 w-4 text-cyan-700" />
                    <span>Mensagem da pessoa física</span>
                  </p>
                  <p className="mt-2 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700 ring-1 ring-slate-200">
                    {request.message}
                  </p>
                  {request.note ? (
                    <p className="mt-3 rounded-2xl bg-slate-100 p-4 text-sm leading-6 text-slate-700 ring-1 ring-slate-200">
                      <span className="font-semibold">Observação: </span>
                      {request.note}
                    </p>
                  ) : null}
                  {canShareContact(request.status) && !request.adopterContactShareConsent ? (
                    <p className="mt-3 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-800 ring-1 ring-amber-200">
                      O adotante ainda nao autorizou o compartilhamento de contato.
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-3">
                  <Link
                    to={`/pets/${getPetRouteId(request.pet.id)}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
                  >
                    <PawPrint className="h-4 w-4 text-cyan-700" />
                    Ver perfil do pet
                  </Link>

                  {canShareContact(request.status) ? (
                    <div className="grid gap-2">
                      <button
                        type="button"
                        disabled={managedRequestId === request.id || !request.adopterContactShareConsent}
                        onClick={() => void manageRequest(request.id, 'share_contact')}
                        className="inline-flex items-center justify-center rounded-full bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Compartilhar contato
                      </button>
                    </div>
                  ) : null}

                  {canManageDecision(request.status) ? (
                    <div className="grid gap-2">
                      <button
                        type="button"
                        disabled={managedRequestId === request.id}
                        onClick={() => {
                          setApprovalModalData({
                            requestId: request.id,
                            petName: request.pet.name,
                          });
                          setApprovalNote('');
                          setApprovalConfirmed(false);
                        }}
                        className="inline-flex items-center justify-center rounded-full bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Aprovar solicitacao
                      </button>
                      <button
                        type="button"
                        disabled={managedRequestId === request.id}
                        onClick={() => {
                          setRejectionModalData({
                            requestId: request.id,
                            petName: request.pet.name,
                          });
                          setRejectionReason('');
                        }}
                        className="inline-flex items-center justify-center rounded-full border border-rose-300 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Rejeitar solicitacao
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
              </article>
            );
          })}
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
