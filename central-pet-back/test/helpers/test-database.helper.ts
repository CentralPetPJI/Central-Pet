import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { execSync } from 'child_process';

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
      execSync('npx prisma migrate deploy', {
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
    await this.prisma.session.deleteMany();
    await this.prisma.user.deleteMany();
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
