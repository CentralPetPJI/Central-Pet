export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  targetId?: string | null;
  targetType?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: any;
  createdAt: string;
  user?: {
    id: string;
    fullName: string;
  };
}
