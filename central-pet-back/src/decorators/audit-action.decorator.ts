import { SetMetadata } from '@nestjs/common';

export const AUDIT_ACTION_KEY = 'audit_action';

export interface AuditActionOptions {
  action: string;
  /** optional explicit target type (e.g. 'PET', 'USER', 'ADOPTION_REQUEST') */
  targetType?: string;
  /** optional name of the parameter or body field to be used as targetId */
  targetIdParam?: string;
}

export const AuditAction = (actionOrOptions: string | AuditActionOptions) =>
  SetMetadata(AUDIT_ACTION_KEY, actionOrOptions);
