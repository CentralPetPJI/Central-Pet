import { expect, test } from "@playwright/test";

/**
 * Testes E2E para verificar persistência de sessão após refresh
 *
 * Cobertura:
 * - Mock auth: verificar que usuário selecionado persiste após refresh
 * - Verificação de que o userId permanece no localStorage
 *
 * Regressão corrigida: perda de sessão após refresh (bootstrap race condition)
 */

test.describe("Persistência de sessão", () => {
  test("deve manter sessão do usuário após refresh da página (mock auth)", async ({
    page,
  }) => {
    // Navega para home
    await page.goto("/");

    // Aguarda carregamento da página
    await page.waitForLoadState("networkidle");

    // Verifica se está autenticado (botão UserMenu visível)
    const userMenuButton = page.getByRole("button", {
      name: /Menu do usuário/i,
    });
    await expect(userMenuButton).toBeVisible({ timeout: 10000 });

    // Captura o nome do usuário
    const buttonElement = await userMenuButton.elementHandle();
    const initialUserText = await buttonElement?.textContent();
    expect(initialUserText).toBeTruthy();

    // Captura userId do localStorage antes do refresh
    const userIdBeforeRefresh = await page.evaluate(() => {
      return localStorage.getItem("central-pet:user-id");
    });
    expect(userIdBeforeRefresh).not.toBeNull();

    // Faz refresh da página
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Verifica que ainda está autenticado
    await expect(userMenuButton).toBeVisible({ timeout: 10000 });

    // Verifica que o texto do botão (nome do usuário) é o mesmo
    const buttonElementAfter = await userMenuButton.elementHandle();
    const userTextAfterRefresh = await buttonElementAfter?.textContent();
    expect(userTextAfterRefresh).toBe(initialUserText);

    // Verifica que o localStorage ainda tem o mesmo userId
    const userIdAfterRefresh = await page.evaluate(() => {
      return localStorage.getItem("central-pet:user-id");
    });
    expect(userIdAfterRefresh).toBe(userIdBeforeRefresh);
  });

  test("deve manter sessão após múltiplos refreshes", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Espera carregar
    const userMenuButton = page.getByRole("button", {
      name: /Menu do usuário/i,
    });
    await expect(userMenuButton).toBeVisible({ timeout: 10000 });

    const buttonElement = await userMenuButton.elementHandle();
    const originalUserText = await buttonElement?.textContent();

    // Faz 3 refreshes consecutivos
    for (let i = 0; i < 3; i++) {
      await page.reload();
      await page.waitForLoadState("networkidle");

      await expect(userMenuButton).toBeVisible({ timeout: 10000 });

      const currentButtonElement = await userMenuButton.elementHandle();
      const currentUserText = await currentButtonElement?.textContent();
      expect(currentUserText).toBe(originalUserText);
    }
  });

  test("deve manter sessão ao navegar entre páginas e fazer refresh", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Captura usuário inicial
    const userMenuButton = page.getByRole("button", {
      name: /Menu do usuário/i,
    });
    await expect(userMenuButton).toBeVisible({ timeout: 10000 });

    const initialButtonElement = await userMenuButton.elementHandle();
    const initialUserText = await initialButtonElement?.textContent();

    // Navega para página de cadastro de pet
    await page.goto("/pets/new");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByRole("heading", { name: /Cadastre o pet/i }),
    ).toBeVisible();

    // Faz refresh na página de cadastro
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByRole("heading", { name: /Cadastre o pet/i }),
    ).toBeVisible();

    // Verifica que continua autenticado
    await expect(userMenuButton).toBeVisible({ timeout: 10000 });
    const midButtonElement = await userMenuButton.elementHandle();
    const midUserText = await midButtonElement?.textContent();
    expect(midUserText).toBe(initialUserText);

    // Volta para home
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(userMenuButton).toBeVisible({ timeout: 10000 });
    const finalButtonElement = await userMenuButton.elementHandle();
    const finalUserText = await finalButtonElement?.textContent();
    expect(finalUserText).toBe(initialUserText);
  });
});
