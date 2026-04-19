import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { execSync } from 'child_process';
import { randomUUID } from 'crypto';

/**
 * PrismaClient configurado especificamente para testes
 * Usa DATABASE_URL separada definida em .env.test
 */
class TestPrismaService extends PrismaClient {
  constructor(testDatabaseUrl: string) {
    const adapter: PrismaPg = new PrismaPg({ connectionString: testDatabaseUrl });
    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }
}

/**
 * Configuração do banco de dados para testes E2E
 * - Usa banco de dados separado (centralpetdb_test)
 * - Executa migrations antes dos testes
 * - Limpa dados entre testes para isolamento
 */
export class TestDatabaseHelper {
  private prisma: PrismaClient;
  private testDatabaseUrl: string;

  constructor() {
    // Usa DATABASE_URL do ambiente de teste (.env.test)
    this.testDatabaseUrl = process.env.DATABASE_URL || '';

    if (!this.testDatabaseUrl) {
      throw new Error('DATABASE_URL não está definida para testes. Configure .env.test');
    }

    if (!this.testDatabaseUrl.includes('_test')) {
      console.warn(
        '⚠️  ATENÇÃO: DATABASE_URL não parece ser um banco de testes (não contém "_test")',
      );
    }

    this.prisma = new TestPrismaService(this.testDatabaseUrl);
  }

  /**
   * Conecta ao banco e executa migrations
   */
  async setup(): Promise<void> {
    try {
      // Executa migrations no banco de teste
      execSync('pnpm exec prisma migrate deploy', {
        env: { ...process.env, DATABASE_URL: this.testDatabaseUrl },
        stdio: 'inherit',
      });

      await this.prisma.$connect();
    } catch (error) {
      console.error('❌ Erro ao configurar banco de teste:', error);
      throw error;
    }
  }

  /**
   * Limpa todos os dados do banco
   * Mantém a estrutura (schema/migrations) intacta
   */
  async cleanup(): Promise<void> {
    // Limpa dados de teste na ordem correta para respeitar constraints
    await this.prisma.adoptionRequest.deleteMany();
    await this.prisma.petHistory.deleteMany();
    await this.prisma.session.deleteMany();
    await this.prisma.pet.deleteMany();
    await this.prisma.institution.deleteMany();
    await this.prisma.user.deleteMany();
  }

  /**
   * Injeta uma quantidade de pets para cenários de teste.
   * Retorna os IDs criados para permitir limpeza/validações no fluxo.
   */
  async seedPets(
    quantity: number,
    responsibleUserId?: string,
  ): Promise<{ responsibleUserId: string; petIds: string[] }> {
    if (quantity < 1) {
      throw new Error('quantity deve ser maior que zero');
    }

    const ownerId = responsibleUserId ?? randomUUID();
    const ownerTag = ownerId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12) || 'seedowner';

    await this.prisma.user.upsert({
      where: { id: ownerId },
      update: {},
      create: {
        id: ownerId,
        fullName: `Usuario seed ${ownerTag}`,
        email: `seed-${ownerTag}@centralpet.test`,
        role: 'PESSOA_FISICA',
        passwordHash: 'seed-password-hash',
      },
    });

    const createdPets = await Promise.all(
      Array.from({ length: quantity }, (_, index) =>
        this.prisma.pet.create({
          data: {
            name: `Pet Seed ${index + 1}`,
            ageText: '2 anos',
            species: 'DOG',
            breed: 'SRD',
            sex: 'MALE',
            size: 'MEDIUM',
            profilePhoto: `https://example.com/pet-seed-${index + 1}.jpg`,
            galleryPhotosJson: '[]',
            microchipped: false,
            vaccinated: true,
            neutered: true,
            dewormed: true,
            needsHealthCare: false,
            physicalLimitation: false,
            visualLimitation: false,
            hearingLimitation: false,
            tutor: `Tutor Seed ${index + 1}`,
            shelter: 'Abrigo Seed',
            city: 'Sao Paulo',
            state: 'SP',
            contact: '(11) 90000-0000',
            selectedPersonalitiesJson: '[]',
            responsibleUserId: ownerId,
            sourceType: 'PESSOA_FISICA',
            sourceName: 'Usuário Seed',
            status: 'AVAILABLE',
            deleted: false,
          },
          select: { id: true },
        }),
      ),
    );

    return {
      responsibleUserId: ownerId,
      petIds: createdPets.map((pet) => pet.id),
    };
  }

  /**
   * Aplica soft delete em lote para pets criados em testes.
   */
  async softDeletePets(petIds: string[]): Promise<number> {
    if (petIds.length === 0) {
      return 0;
    }

    const result = await this.prisma.pet.updateMany({
      where: {
        id: {
          in: petIds,
        },
      },
      data: {
        deleted: true,
        status: 'UNAVAILABLE',
      },
    });

    return result.count;
  }

  /**
   * Desconecta do banco
   */
  async teardown(): Promise<void> {
    await this.prisma.$disconnect();
  }

  /**
   * Retorna a instância do PrismaClient
   */
  getClient(): PrismaClient {
    return this.prisma;
  }
}
