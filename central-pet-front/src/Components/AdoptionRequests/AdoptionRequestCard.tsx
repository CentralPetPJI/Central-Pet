import { MapPin, MessageSquareText, PawPrint, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPetSpecies } from '@/lib/formatters';
import type { ReceivedAdoptionRequest } from '@/Models/pet';
import {
  canManageDecision,
  canShareContact,
  getAdoptionRequestStatusPresentation,
} from '@/Models/adoption-request-status';
import { formatRequestDate, getPetRouteId } from './adoptionRequestsHelpers';

type AdoptionRequestCardProps = {
  request: ReceivedAdoptionRequest;
  managedRequestId: string | null;
  onShareContact: (requestId: string) => void;
  onOpenApproval: (request: ReceivedAdoptionRequest) => void;
  onOpenRejection: (request: ReceivedAdoptionRequest) => void;
};

export function AdoptionRequestCard({
  request,
  managedRequestId,
  onShareContact,
  onOpenApproval,
  onOpenRejection,
}: AdoptionRequestCardProps) {
  const statusPresentation = getAdoptionRequestStatusPresentation(request.status);

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
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
          {request.adopterContactShareConsent &&
          (request.adopter.email || request.adopter.phone || request.adopter.mobile) ? (
            <div className="mt-2 text-sm text-slate-700">
              {request.adopter.email ? <div>✉️ {request.adopter.email}</div> : null}
              {request.adopter.phone ? <div>📞 {request.adopter.phone}</div> : null}
              {request.adopter.mobile ? <div>📱 {request.adopter.mobile}</div> : null}
            </div>
          ) : null}
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
                disabled={managedRequestId === request.id}
                onClick={() => onShareContact(request.id)}
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
                disabled={
                  managedRequestId === request.id || !request.responsibleContactShareConsent
                }
                onClick={() => onOpenApproval(request)}
                className="inline-flex items-center justify-center rounded-full bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Aprovar solicitacao
              </button>
              <button
                type="button"
                disabled={managedRequestId === request.id}
                onClick={() => onOpenRejection(request)}
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
}
