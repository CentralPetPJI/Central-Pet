#!/usr/bin/env node

/**
 * Configura automaticamente o banco de desenvolvimento a partir do .env
 * (ou .env.development quando .env não existir).
 * - Garante que o banco definido em DATABASE_URL existe
 * - Executa migrations com Prisma
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
  console.log(`${CYAN}🗄️  Garantindo banco de desenvolvimento (${database})...${NC}`);

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
    fail('Erro ao verificar/criar banco de desenvolvimento.');
  }
}

function runMigrations(databaseUrl) {
  console.log(`${CYAN}🚀 Executando migrations...${NC}`);
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
  console.log(`${CYAN}🔧 Configurando banco de desenvolvimento...${NC}`);
  const envFileName = existsSync(join(__dirname, '..', '.env')) ? '.env' : '.env.development';
  const databaseUrl = readDatabaseUrl(envFileName);
  const connection = parseDatabaseUrl(databaseUrl);

  ensurePostgresConnection(connection);
  ensureDatabaseExists(connection);
  runMigrations(databaseUrl);

  console.log(`${GREEN}✅ Banco de desenvolvimento configurado com sucesso!${NC}`);
}

main();
