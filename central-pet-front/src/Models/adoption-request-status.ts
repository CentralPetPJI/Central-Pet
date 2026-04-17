export enum AdoptionRequestStatus {
  PENDING = 'PENDING',
  CONTACT_SHARED = 'CONTACT_SHARED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

type AdoptionRequestStatusPresentation = {
  label: string;
  className: string;
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
};

export function getAdoptionRequestStatusPresentation(
  status: AdoptionRequestStatus,
): AdoptionRequestStatusPresentation {
  return statusPresentationMap[status];
}

export function canShareContact(status: AdoptionRequestStatus): boolean {
  return status === AdoptionRequestStatus.PENDING;
}

export function canManageDecision(status: AdoptionRequestStatus): boolean {
  return (
    status === AdoptionRequestStatus.PENDING || status === AdoptionRequestStatus.CONTACT_SHARED
  );
}
