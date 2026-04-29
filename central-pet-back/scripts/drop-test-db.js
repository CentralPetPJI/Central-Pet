#!/usr/bin/env node

/**
 * Remove (DROP DATABASE) o banco definido em .env.test sem pedir confirmação.
 * Use com cuidado — é intencionalmente permissivo para cenários de CI e testes locais.
 *
 * Fluxo:
 *  - Lê DATABASE_URL de .env.test
 *  - Verifica conexão com o Postgres
 *  - Emite DROP DATABASE IF EXISTS
 */

const { execSync } = require('child_process');
const { existsSync, readFileSync } = require('fs');
const { join } = require('path');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
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

  return match[1].replace(/['"]+/g, '').trim();
}

function parseDatabaseUrl(databaseUrl) {
  const match = databaseUrl.match(/^postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);

  if (!match) {
    fail('Formato inválido de DATABASE_URL. Esperado: postgresql://user:pass@host:port/dbname');
  }

  const [, user, password, host, port, database] = match;
  return { user, password, host, port, database };
}

function ensurePostgresConnection({ user, password, host, port }) {
  console.log(`${CYAN}🔍 Verificando conexão com PostgreSQL...${NC}`);

  try {
    execSync(`psql -h ${host} -p ${port} -U ${user} -d postgres -c "\\q"`, {
      env: { ...process.env, PGPASSWORD: password },
      stdio: 'ignore',
    });
  } catch (e) {
    fail(
      'Não foi possível conectar ao PostgreSQL. Verifique se o serviço está rodando e acessível.',
    );
  }
}

function dropDatabase({ user, password, host, port, database }) {
  console.log(`${CYAN}🗑️  Dropando banco de teste ${database} ...${NC}`);

  try {
    // Use DROP DATABASE IF EXISTS para ser idempotente
    execSync(
      `psql -h ${host} -p ${port} -U ${user} -d postgres -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS \\"${database}\\""`,
      {
        stdio: 'inherit',
        env: {
          ...process.env,
          PGPASSWORD: password,
        },
      },
    );
  } catch (e) {
    fail(`Erro ao dropar o banco ${database}: ${e.message}`);
  }
}

function main() {
  console.log(`${CYAN}🔧 Script: drop-test-db${NC}`);

  const databaseUrl = readDatabaseUrlFromTestEnv();
  const conn = parseDatabaseUrl(databaseUrl);

  // Intencional: sem checagem de "é banco de teste" nem confirmação
  ensurePostgresConnection(conn);
  dropDatabase(conn);

  console.log(`${GREEN}✅ Banco ${conn.database} removido (se existia).${NC}`);
}

main();
