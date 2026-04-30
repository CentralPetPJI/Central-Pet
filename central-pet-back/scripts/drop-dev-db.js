#!/usr/bin/env node

/**
 * Dropa o banco de desenvolvimento (remove o banco inteiro).
 * Segurança:
 * - Lê DATABASE_URL de .env ou .env.development
 * - Verifica se o nome do DB parece ser de desenvolvimento (contém "dev" ou "development");
 *   exigir --force para ignorar essa checagem
 * - Exigir confirmação explícita com --yes (ou -y) para evitar execuções acidentais
 *
 * Uso:
 *  node scripts/drop-dev-db.js --yes        # executa se DATABASE_URL indicar dev DB
 *  node scripts/drop-dev-db.js --force --yes  # força mesmo que não pareça dev
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

function readDatabaseUrl(envFileName) {
  const envPath = join(__dirname, '..', envFileName);

  if (!existsSync(envPath)) {
    fail(`Arquivo ${envFileName} não encontrado.`);
  }

  const envContent = readFileSync(envPath, 'utf-8');
  const match = envContent.match(/^DATABASE_URL=(.+)$/m);

  if (!match) {
    fail(`DATABASE_URL não encontrada em ${envFileName}.`);
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

function assertDevelopmentDatabase(database) {
  const lowered = database.toLowerCase();
  const looksLikeDev = lowered.includes('dev') || lowered.includes('development');
  const forceMode = process.argv.includes('--force');

  if (!looksLikeDev && !forceMode) {
    fail(
      `Banco "${database}" não parece ser de desenvolvimento. Use --force para executar mesmo assim.`,
    );
  }
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
  console.log(`${YELLOW}🗑️  Dropando banco ${database} ...${NC}`);

  try {
    execSync(
      `PGPASSWORD='${password}' psql -h ${host} -p ${port} -U ${user} -d postgres -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS \"${database}\""`,
      {
        stdio: 'inherit',
      },
    );
  } catch (e) {
    fail(`Erro ao dropar o banco ${database}: ${e.message}`);
  }
}

function main() {
  console.log(`${CYAN}🔧 Script: drop-dev-db${NC}`);

  const envFileName = existsSync(join(__dirname, '..', '.env')) ? '.env' : '.env.development';
  const databaseUrl = readDatabaseUrl(envFileName);
  const conn = parseDatabaseUrl(databaseUrl);

  assertDevelopmentDatabase(conn.database);

  const yes = process.argv.includes('--yes') || process.argv.includes('-y');
  if (!yes) {
    fail(
      'Confirmação necessária: adicione --yes para confirmar a operação. Ex: node scripts/drop-dev-db.js --yes',
    );
  }

  ensurePostgresConnection(conn);
  dropDatabase(conn);

  console.log(`${GREEN}✅ Banco ${conn.database} removido com sucesso.${NC}`);
}

main();
