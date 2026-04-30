import { MapPin, MessageSquareText, PawPrint, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPetSpecies } from '@/lib/formatters';
import type { ReceivedAdoptionRequest } from '@/Models/pet';
import { getAdoptionRequestStatusPresentation } from '@/Models/adoption-request-status';
import { formatRequestDate, getPetRouteId } from './adoptionRequestsHelpers';

type SentAdoptionRequestCardProps = {
  request: ReceivedAdoptionRequest;
};

export function SentAdoptionRequestCard({ request }: SentAdoptionRequestCardProps) {
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
              Enviada em {formatRequestDate(request.requestedAt)}
            </span>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">{request.pet.name}</h2>
            <div className="mt-1 space-y-1 text-sm text-slate-600">
              <p className="flex items-center gap-2">
                <PawPrint className="h-4 w-4 text-cyan-700" />
                <span>{formatPetSpecies(request.pet.species as 'dog' | 'cat')}</span>
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
            <span>{request.responsible?.name ?? request.pet.sourceName}</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">Responsável pelo pet</p>
          {request.responsible &&
          request.responsibleContactShareConsent &&
          (request.responsible.email || request.responsible.phone || request.responsible.mobile) ? (
            <div className="mt-2 text-sm text-slate-700">
              {request.responsible.email ? <div>✉️ {request.responsible.email}</div> : null}
              {request.responsible.phone ? <div>📞 {request.responsible.phone}</div> : null}
              {request.responsible.mobile ? <div>📱 {request.responsible.mobile}</div> : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <MessageSquareText className="h-4 w-4 text-cyan-700" />
            <span>Sua mensagem</span>
          </p>
          <p className="mt-2 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700 ring-1 ring-slate-200">
            {request.message}
          </p>
          {request.note ? (
            <p className="mt-3 rounded-2xl bg-slate-100 p-4 text-sm leading-6 text-slate-700 ring-1 ring-slate-200">
              <span className="font-semibold">Resposta do responsável: </span>
              {request.note}
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
        </div>
      </div>
    </article>
  );
}
