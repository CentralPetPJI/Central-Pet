import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLog, Prisma } from '@prisma/client';
import { NullableJsonNullValueInput } from 'generated/prisma/internal/prismaNamespace';

interface AuditLogCreateInput {
  userId: string;
  action: string;
  details?: unknown;
  targetId?: string | null;
  targetType?: string | null;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: AuditLogCreateInput): Promise<AuditLog> {
    return this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        details: data.details as NullableJsonNullValueInput,
        targetId: data.targetId ?? null,
        targetType: data.targetType ?? null,
      },
    });
  }

  async createWithTx(
    tx: Prisma.TransactionClient,
    data: AuditLogCreateInput,
  ): Promise<AuditLog | null> {
    if (tx?.auditLog && typeof tx.auditLog.create === 'function') {
      return tx.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          details: data.details as NullableJsonNullValueInput,
          targetId: data.targetId ?? null,
          targetType: data.targetType ?? null,
        },
      });
    }
    return null;
  }
}
