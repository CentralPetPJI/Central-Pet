#!/usr/bin/env node

/**
 * Script cross-platform para configurar banco de dados de teste
 * Funciona em Linux, macOS e Windows
 *
 * Este script apenas configura o banco de teste.
 * Ele assume que PostgreSQL já está rodando (localmente ou via Docker).
 * Para garantir que PostgreSQL está rodando, use: node ../scripts/ensure-postgres.js
 */

const { execSync } = require('child_process');
const { readFileSync, existsSync } = require('fs');
const { join } = require('path');

// Cores ANSI
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const WHITE = '\x1b[37m';
const NC = '\x1b[0m';

console.log(`${CYAN}🔧 Configurando banco de dados de teste...${NC}`);

// Verifica se .env.test existe
const envTestPath = join(__dirname, '..', '.env.test');
if (!existsSync(envTestPath)) {
  console.error(`${RED}❌ Arquivo .env.test não encontrado!${NC}`);
  process.exit(1);
}

// Lê e parseia .env.test
const envContent = readFileSync(envTestPath, 'utf-8');
const databaseUrlMatch = envContent.match(/^DATABASE_URL=(.+)$/m);

if (!databaseUrlMatch) {
  console.error(`${RED}❌ DATABASE_URL não encontrada no .env.test!${NC}`);
  process.exit(1);
}

const databaseUrl = databaseUrlMatch[1].replace(/['"]/g, '');

// Parse da URL (formato: postgresql://user:pass@host:port/dbname?schema=public)
const urlMatch = databaseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);

if (!urlMatch) {
  console.error(`${RED}❌ Formato inválido de DATABASE_URL!${NC}`);
  process.exit(1);
}

const [, dbUser, dbPass, dbHost, dbPort, dbName] = urlMatch;

console.log(`${WHITE}📦 Banco: ${dbName}${NC}`);
console.log(`${WHITE}🖥️  Host: ${dbHost}:${dbPort}${NC}`);
console.log(`${WHITE}👤 User: ${dbUser}${NC}`);

// Verifica se PostgreSQL está acessível
console.log(`${CYAN}🔍 Verificando conexão com PostgreSQL...${NC}`);

try {
  execSync(`psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d postgres -c "\\q"`, {
    env: { ...process.env, PGPASSWORD: dbPass },
    stdio: 'ignore',
  });
} catch (error) {
  console.error(`${RED}❌ Não foi possível conectar ao PostgreSQL${NC}`);
  console.error(`${YELLOW}   Certifique-se de que o PostgreSQL está rodando e acessível${NC}`);
  process.exit(1);
}

// Verifica se o banco existe
console.log(`${CYAN}🗄️  Criando banco de teste (se não existir)...${NC}`);

try {
  const checkDbResult = execSync(
    `psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '${dbName}'"`,
    {
      env: { ...process.env, PGPASSWORD: dbPass },
      encoding: 'utf-8',
    },
  );

  if (!checkDbResult.trim().includes('1')) {
    console.log(`${YELLOW}   Criando banco ${dbName}...${NC}`);
    execSync(
      `psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d postgres -c "CREATE DATABASE ${dbName}"`,
      {
        env: { ...process.env, PGPASSWORD: dbPass },
        stdio: 'inherit',
      },
    );
  } else {
    console.log(`${GREEN}   Banco ${dbName} já existe${NC}`);
  }
} catch (error) {
  console.error(`${RED}❌ Erro ao verificar/criar banco de dados!${NC}`);
  process.exit(1);
}

// Executa migrations
console.log(`${CYAN}🚀 Executando migrations...${NC}`);

try {
  execSync('pnpm exec prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'inherit',
  });
} catch (error) {
  console.error(`${RED}❌ Erro ao executar migrations!${NC}`);
  process.exit(1);
}

console.log(`${GREEN}✅ Banco de teste configurado com sucesso!${NC}`);
