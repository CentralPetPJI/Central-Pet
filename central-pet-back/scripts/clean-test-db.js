#!/usr/bin/env node

/**
 * Limpa os dados do banco de testes sem remover o histórico de migrations.
 * Fluxo:
 * 1. Lê DATABASE_URL do .env.test
 * 2. Garante conexão e existência do banco
 * 3. Limpa tabelas do schema public (exceto _prisma_migrations)
 * 4. Reaplica migrations para garantir consistência de schema
 */

const { execSync } = require('child_process');
const { existsSync, readFileSync } = require('fs');
const { join } = require('path');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const NC = '\x1b[0m';

function fail(message) {
  console.error(`${RED}❌ ${message}${NC}`);
  process.exit(1);
}

function readDatabaseUrlFromTestEnv() {
  const envPath = join(__dirname, '..', '.env.test');

  if (!existsSync(envPath)) {
    fail('Arquivo .env.test não encontrado.');
  }

  const envContent = readFileSync(envPath, 'utf-8');
  const match = envContent.match(/^DATABASE_URL=(.+)$/m);

  if (!match) {
    fail('DATABASE_URL não encontrada em .env.test.');
  }

  return match[1].replace(/['"]/g, '').trim();
}

function parseDatabaseUrl(databaseUrl) {
  const match = databaseUrl.match(/^postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);

  if (!match) {
    fail('Formato inválido de DATABASE_URL. Esperado: postgresql://user:pass@host:port/dbname');
  }

  const [, user, password, host, port, database] = match;
  return { user, password, host, port, database };
}

function assertTestDatabase(database) {
  const loweredDatabase = database.toLowerCase();
  const looksLikeTestDatabase =
    loweredDatabase.includes('_test') || loweredDatabase.includes('test');
  const forceMode = process.argv.includes('--force');

  if (!looksLikeTestDatabase && !forceMode) {
    fail(`Banco "${database}" não parece ser de teste. Use --force para executar mesmo assim.`);
  }
}

function ensurePostgresConnection({ user, password, host, port }) {
  console.log(`${CYAN}🔍 Verificando conexão com PostgreSQL...${NC}`);

  try {
    execSync(`psql -h ${host} -p ${port} -U ${user} -d postgres -c "\\q"`, {
      env: { ...process.env, PGPASSWORD: password },
      stdio: 'ignore',
    });
  } catch {
    fail(
      'Não foi possível conectar ao PostgreSQL. Verifique se o serviço está rodando e acessível.',
    );
  }
}

function ensureDatabaseExists({ user, password, host, port, database }) {
  console.log(`${CYAN}🗄️  Garantindo banco de testes (${database})...${NC}`);

  try {
    const result = execSync(
      `psql -h ${host} -p ${port} -U ${user} -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '${database}'"`,
      {
        env: { ...process.env, PGPASSWORD: password },
        encoding: 'utf-8',
      },
    );

    if (!result.trim().includes('1')) {
      console.log(`${YELLOW}   Banco não existe. Criando ${database}...${NC}`);
      execSync(
        `psql -h ${host} -p ${port} -U ${user} -d postgres -c "CREATE DATABASE ${database}"`,
        {
          env: { ...process.env, PGPASSWORD: password },
          stdio: 'inherit',
        },
      );
    } else {
      console.log(`${GREEN}   Banco ${database} já existe${NC}`);
    }
  } catch {
    fail('Erro ao verificar/criar banco de testes.');
  }
}

function cleanPublicTables({ user, password, host, port, database }) {
  console.log(`${YELLOW}🧹 Limpando tabelas do schema public...${NC}`);

  const tableList = execSync(
    `psql -h ${host} -p ${port} -U ${user} -d ${database} -At -c "SELECT string_agg(format('%I.%I', schemaname, tablename), ', ') FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'"`,
    {
      env: { ...process.env, PGPASSWORD: password },
      encoding: 'utf-8',
    },
  ).trim();

  if (!tableList) {
    console.log(`${GREEN}   Nenhuma tabela para limpar.${NC}`);
    return;
  }

  execSync(
    `psql -h ${host} -p ${port} -U ${user} -d ${database} -v ON_ERROR_STOP=1 -c 'TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE'`,
    {
      env: { ...process.env, PGPASSWORD: password },
      stdio: 'inherit',
    },
  );
}

function runMigrations(databaseUrl) {
  console.log(`${CYAN}🚀 Reaplicando migrations no banco de teste...${NC}`);

  try {
    execSync('pnpm exec prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: 'inherit',
    });
  } catch {
    fail('Erro ao executar migrations.');
  }
}

function main() {
  console.log(`${CYAN}🔧 Limpando banco de testes...${NC}`);

  const databaseUrl = readDatabaseUrlFromTestEnv();
  const connection = parseDatabaseUrl(databaseUrl);

  assertTestDatabase(connection.database);
  ensurePostgresConnection(connection);
  ensureDatabaseExists(connection);
  cleanPublicTables(connection);
  runMigrations(databaseUrl);

  console.log(`${GREEN}✅ Banco de testes limpo com sucesso!${NC}`);
}

main();
