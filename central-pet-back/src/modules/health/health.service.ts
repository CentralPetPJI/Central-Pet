import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check() {
    const timestamp = new Date().toISOString();

    try {
      // Tenta fazer uma query simples no banco para verificar conexão
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ok',
        service: 'central-pet-back',
        timestamp,
        database: 'connected',
      };
    } catch (error) {
      return {
        status: 'error',
        service: 'central-pet-back',
        timestamp,
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
