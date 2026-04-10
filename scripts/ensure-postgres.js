#!/usr/bin/env node

/**
 * Script cross-platform para garantir que PostgreSQL está rodando
 * Funciona em Linux, macOS e Windows
 *
 * Fluxo de decisão:
 * 1. Verifica se PostgreSQL está rodando na porta 5432
 *    - Se SIM → Valida que é PostgreSQL e retorna sucesso ✅
 *    - Se NÃO → Continua para passo 2
 *
 * 2. PostgreSQL NÃO está rodando localmente
 *    - Verifica se Docker está disponível (opcional)
 *    - Se Docker disponível → Tenta iniciar container PostgreSQL
 *    - Se Docker NÃO disponível → ERRO: precisa instalar PostgreSQL
 *
 * IMPORTANTE: PostgreSQL é OBRIGATÓRIO (local ou Docker)
 *             Docker é apenas uma OPÇÃO para rodar PostgreSQL
 */

const { execSync, spawn } = require("child_process");
const net = require("net");

const POSTGRES_PORT = 5432;
const POSTGRES_HOST = "localhost";
const POSTGRES_USER = process.env.DB_USER || "centralpet";
const MAX_WAIT_SECONDS = 30;

// Cores ANSI
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const NC = "\x1b[0m";

/**
 * Verifica se uma porta está aberta
 */
function checkPort(host, port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port, timeout: 2000 });

    socket.on("connect", () => {
      socket.end();
      resolve(true);
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });

    socket.on("error", () => {
      resolve(false);
    });
  });
}

/**
 * Verifica se PostgreSQL está respondendo
 */
function checkPostgres() {
  try {
    // Tenta pg_isready se disponível
    const isWindows = process.platform === "win32";
    const pgIsReadyCmd = isWindows
      ? `pg_isready -h ${POSTGRES_HOST} -p ${POSTGRES_PORT}`
      : `pg_isready -h ${POSTGRES_HOST} -p ${POSTGRES_PORT} -U ${POSTGRES_USER}`;

    execSync(pgIsReadyCmd, { stdio: "ignore", timeout: 3000 });
    return true;
  } catch {
    // pg_isready não disponível ou falhou
    return false;
  }
}

/**
 * Verifica se Docker está disponível
 */
function checkDocker() {
  try {
    execSync("docker --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Verifica se Docker daemon está rodando
 */
function checkDockerDaemon() {
  try {
    execSync("docker info", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Verifica se container PostgreSQL está rodando
 */
function checkPostgresContainer() {
  try {
    const output = execSync("docker ps", { encoding: "utf-8" });
    return output.includes("postgres") || output.includes("centralpetdb");
  } catch {
    return false;
  }
}

/**
 * Inicia PostgreSQL via Docker Compose
 */
async function startPostgresContainer() {
  console.log(
    `${YELLOW}⚠️  PostgreSQL não está rodando. Iniciando container...${NC}`,
  );

  try {
    // Inicia apenas o postgres do docker-compose
    execSync("docker compose -f docker-compose.dev.yml up -d postgres", {
      stdio: "inherit",
    });

    console.log("Aguardando PostgreSQL ficar pronto...");

    // Aguarda o postgres ficar pronto
    for (let attempt = 0; attempt < MAX_WAIT_SECONDS; attempt++) {
      try {
        const containerId = execSync("docker ps -q -f name=postgres", {
          encoding: "utf-8",
        }).trim();

        if (containerId) {
          execSync(
            `docker exec ${containerId} pg_isready -U ${POSTGRES_USER}`,
            { stdio: "ignore" },
          );
          console.log(`\n${GREEN}✓ PostgreSQL iniciado e pronto${NC}`);
          return true;
        }
      } catch {
        process.stdout.write(".");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.error(`\n${RED}❌ Timeout esperando PostgreSQL${NC}`);
    process.exit(1);
  } catch (error) {
    console.error(`${RED}❌ Erro ao iniciar PostgreSQL: ${error.message}${NC}`);
    process.exit(1);
  }
}

/**
 * Main
 */
async function main() {
  // 1. Verifica se a porta está em uso
  const portOpen = await checkPort(POSTGRES_HOST, POSTGRES_PORT);

  if (portOpen) {
    // Porta em uso, verifica se é PostgreSQL
    if (checkPostgres()) {
      console.log(
        `${GREEN}✓ PostgreSQL já está rodando na porta ${POSTGRES_PORT}${NC}`,
      );
      console.log(
        `${GREEN}  (rodando localmente - não é necessário Docker)${NC}`,
      );
      process.exit(0);
    } else {
      console.error(
        `${RED}❌ Porta ${POSTGRES_PORT} em uso, mas não é PostgreSQL${NC}`,
      );
      process.exit(1);
    }
  }

  // 2. PostgreSQL não está rodando localmente, tenta via Docker (se disponível)
  console.log(`${YELLOW}PostgreSQL não está rodando localmente.${NC}`);

  if (!checkDocker()) {
    console.error(
      `${RED}❌ PostgreSQL não está instalado/rodando E Docker não está disponível${NC}`,
    );
    console.error(
      `${YELLOW}\n📋 Você precisa de PostgreSQL. Escolha uma opção:${NC}`,
    );
    console.error(
      `${YELLOW}\n   OPÇÃO 1 - Instalar PostgreSQL localmente:${NC}`,
    );
    console.error(
      `${YELLOW}   • Windows: https://www.postgresql.org/download/windows/${NC}`,
    );
    console.error(`${YELLOW}   • macOS:   brew install postgresql@16${NC}`);
    console.error(`${YELLOW}   • Linux:   sudo apt install postgresql-16${NC}`);
    console.error(`${YELLOW}\n   OPÇÃO 2 - Usar Docker:${NC}`);
    console.error(
      `${YELLOW}   • Instale Docker Desktop: https://www.docker.com/products/docker-desktop${NC}`,
    );
    console.error(
      `${YELLOW}   • Execute: docker compose -f docker-compose.dev.yml up -d postgres${NC}`,
    );
    process.exit(1);
  }

  console.log(
    `${GREEN}✓ Docker está disponível, tentando iniciar PostgreSQL via container...${NC}`,
  );

  if (!checkDockerDaemon()) {
    console.error(
      `${RED}❌ Docker está instalado mas o daemon não está rodando${NC}`,
    );
    console.error(
      `${YELLOW}   Inicie o Docker Desktop ou instale PostgreSQL localmente${NC}`,
    );
    process.exit(1);
  }

  console.log(`${GREEN}✓ Docker daemon está rodando${NC}`);

  // 3. Verifica se container já está rodando
  if (checkPostgresContainer()) {
    console.log(`${GREEN}✓ PostgreSQL container já está rodando${NC}`);
    process.exit(0);
  }

  // 4. Inicia container
  await startPostgresContainer();
}

main().catch((error) => {
  console.error(`${RED}❌ Erro: ${error.message}${NC}`);
  process.exit(1);
});
