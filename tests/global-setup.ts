import { chromium } from "@playwright/test";

/**
 * Setup global executado antes de todos os testes E2E.
 * Verifica se o banco de dados PostgreSQL está acessível.
 */
async function globalSetup() {
  // eslint-disable-next-line no-console
  console.log("🔍 Verificando se o banco de dados está rodando...");

  const backendUrl = "http://localhost:3000/api/health";
  const maxRetries = 10;
  const retryDelay = 2000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const browser = await chromium.launch();
      const page = await browser.newPage();

      try {
        const response = await page.goto(backendUrl, {
          waitUntil: "domcontentloaded",
          timeout: 5000,
        });

        if (response && response.ok()) {
          // eslint-disable-next-line no-console
          console.log("✅ Banco de dados e backend estão rodando!");
          await browser.close();
          return;
        }
      } catch (_error) {
        // Erro de timeout ou conexão, tentar novamente
      } finally {
        await browser.close();
      }
    } catch (_error) {
      // Erro ao criar browser, tentar novamente
    }

    if (attempt < maxRetries) {
      // eslint-disable-next-line no-console
      console.log(
        `⏳ Tentativa ${attempt}/${maxRetries} falhou. Aguardando ${retryDelay / 1000}s...`,
      );
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  throw new Error(
    `❌ Não foi possível conectar ao backend após ${maxRetries} tentativas.\n` +
      `   Certifique-se de que o banco de dados PostgreSQL está rodando:\n` +
      `   → docker compose -f docker-compose.dev.yml up postgres\n` +
      `   ou inicie todos os serviços:\n` +
      `   → docker compose -f docker-compose.dev.yml up`,
  );
}

export default globalSetup;
