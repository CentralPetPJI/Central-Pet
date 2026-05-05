export enum AdoptionRequestStatus {
  PENDING = 'PENDING',
  CONTACT_SHARED = 'CONTACT_SHARED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

type AdoptionRequestStatusPresentation = {
  label: string;
  className: string;
};

const fallbackStatusPresentation: AdoptionRequestStatusPresentation = {
  label: 'Desconhecido',
  className: 'bg-slate-100 text-slate-600',
};

const statusPresentationMap: Record<AdoptionRequestStatus, AdoptionRequestStatusPresentation> = {
  [AdoptionRequestStatus.PENDING]: {
    label: 'Pendente',
    className: 'bg-amber-100 text-amber-800',
  },
  [AdoptionRequestStatus.CONTACT_SHARED]: {
    label: 'Contato compartilhado',
    className: 'bg-emerald-100 text-emerald-800',
  },
  [AdoptionRequestStatus.APPROVED]: {
    label: 'Aprovada',
    className: 'bg-emerald-100 text-emerald-800',
  },
  [AdoptionRequestStatus.REJECTED]: {
    label: 'Recusada',
    className: 'bg-rose-100 text-rose-800',
  },
  [AdoptionRequestStatus.CANCELLED]: {
    label: 'Cancelada',
    className: 'bg-slate-100 text-slate-600',
  },
};

export function getAdoptionRequestStatusPresentation(
  status: string,
): AdoptionRequestStatusPresentation {
  return statusPresentationMap[status as AdoptionRequestStatus] ?? fallbackStatusPresentation;
}

export function canShareContact(status: AdoptionRequestStatus): boolean {
  return status === AdoptionRequestStatus.PENDING;
}

export function canManageDecision(status: AdoptionRequestStatus): boolean {
  return (
    status === AdoptionRequestStatus.PENDING || status === AdoptionRequestStatus.CONTACT_SHARED
  );
}
