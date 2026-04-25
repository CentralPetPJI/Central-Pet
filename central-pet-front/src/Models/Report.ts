export interface Report {
  id: string;
  reporterId: string;
  reporter: {
    id: string;
    fullName: string;
  };
  targetType: 'PET' | 'USER';
  targetId: string;
  petName?: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  resolvedById?: string | null;
  resolvedBy?: {
    id: string;
    fullName: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}
