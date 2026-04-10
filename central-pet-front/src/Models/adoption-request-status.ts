export const adoptionRequestStatuses = [
  'pending',
  'contact_shared',
  'approved',
  'rejected',
] as const;

export type AdoptionRequestStatus = (typeof adoptionRequestStatuses)[number];

type AdoptionRequestStatusPresentation = {
  label: string;
  className: string;
};

const statusPresentationMap: Record<AdoptionRequestStatus, AdoptionRequestStatusPresentation> = {
  pending: {
    label: 'Pendente',
    className: 'bg-amber-100 text-amber-800',
  },
  contact_shared: {
    label: 'Contato compartilhado',
    className: 'bg-emerald-100 text-emerald-800',
  },
  approved: {
    label: 'Aprovada',
    className: 'bg-emerald-100 text-emerald-800',
  },
  rejected: {
    label: 'Recusada',
    className: 'bg-rose-100 text-rose-800',
  },
};

export function getAdoptionRequestStatusPresentation(
  status: AdoptionRequestStatus,
): AdoptionRequestStatusPresentation {
  return statusPresentationMap[status];
}

export function canShareContact(status: AdoptionRequestStatus): boolean {
  return status === 'pending';
}

export function canManageDecision(status: AdoptionRequestStatus): boolean {
  return status === 'contact_shared';
}
