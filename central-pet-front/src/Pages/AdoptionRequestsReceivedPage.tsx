import { useEffect, useState } from 'react';
import { MapPin, MessageSquareText, PawPrint, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatPetSpecies } from '@/lib/formatters';
import type { ReceivedAdoptionRequest } from '@/Models/pet';
import { routes } from '@/routes';
import { getLocalId } from '@/storage/pets';

const statusLabelMap: Record<ReceivedAdoptionRequest['status'], string> = {
  PENDING: 'Pendente',
  UNDER_REVIEW: 'Em análise',
  APPROVED: 'Aprovada',
  REJECTED: 'Recusada',
};

const statusClassNameMap: Record<ReceivedAdoptionRequest['status'], string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  UNDER_REVIEW: 'bg-sky-100 text-sky-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-rose-100 text-rose-800',
};

/**
 * Retorna o ID apropriado para uso em rotas locais.
 * Para pets que vieram do backend com UUID, tenta encontrar o localId.
 * Para pets mock (que já têm ID numérico), retorna o próprio ID.
 */
function getPetRouteId(petId: string | number): string | number {
  // Se já é numérico, usa direto
  if (typeof petId === 'number') {
    return petId;
  }

  // Se é string, tenta converter para localId
  const localId = getLocalId(petId);
  return localId ?? petId;
}

function formatRequestDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(date));
}

export default function AdoptionRequestsReceivedPage() {
  const { currentUser, isLoading: isAuthLoading } = useAuth();
  const [requests, setRequests] = useState<ReceivedAdoptionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadRequests = async () => {
      if (isAuthLoading) {
        return;
      }

      if (!currentUser) {
        setIsLoading(false);
        setErrorMessage(null);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await api.get<{ data: ReceivedAdoptionRequest[] }>('/adoption-requests', {
          params: {
            type: 'received',
            responsibleUserId: currentUser.id,
          },
        });

        if (!isMounted) {
          return;
        }

        setRequests(response.data.data);
      } catch {
        if (!isMounted) {
          return;
        }

        setErrorMessage('Nao foi possivel carregar as solicitacoes recebidas no momento.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadRequests();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.id, isAuthLoading]);

  return (
    <section className="w-full px-1 pb-8 pt-4 lg:px-0 lg:pt-5">
      <div className="mb-6 flex flex-col gap-3 rounded-3xl bg-linear-to-r from-amber-50 via-white to-cyan-50 p-5 shadow-sm ring-1 ring-slate-200 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Solicitações de adoção recebidas
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Acompanhe os interessados em pets que voce cadastrou para adoção. Aqui voce pode revisar
            as mensagens das pessoas físicas e acessar os perfis dos pets para tomar a melhor
            decisão.
          </p>
        </div>

        <Link
          to={routes.pets.new.path}
          className="inline-flex items-center justify-center rounded-full bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
        >
          Cadastrar novo pet
        </Link>
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
          Carregando solicitacoes...
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
          {requests.map((request) => (
            <article
              key={request.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClassNameMap[request.status]}`}
                    >
                      {statusLabelMap[request.status]}
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
                </div>

                <Link
                  to={routes.pets.detail.build(getPetRouteId(request.pet.id))}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
                >
                  <PawPrint className="h-4 w-4 text-cyan-700" />
                  Ver perfil do pet
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
