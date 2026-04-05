import { expect, test } from "@playwright/test";
import {
  criarUsuarioViaApi,
  fazerLogin,
  gerarUsuarioUnico,
} from "../utils/user-helpers";

/**
 * Testes E2E para verificar persistência de sessão após refresh
 *
 * Estes testes usam JWT (autenticação real) e verificam que:
 * - Sessão persiste após refresh
 * - Cookies são mantidos pelo navegador
 * - Backend reconhece a sessão após reload
 */

test.describe("Persistência de sessão (JWT)", () => {
  test("deve manter sessão do usuário após refresh da página", async ({
    page,
    request,
  }) => {
    // Criar usuário e fazer login
    const usuario = gerarUsuarioUnico("session-refresh");
    await criarUsuarioViaApi(request, usuario);
    await fazerLogin(page, usuario);

    // Aguarda carregamento completo
    await page.waitForLoadState("networkidle");

    // Verifica que está autenticado (botão UserMenu visível)
    const userMenuButton = page.getByRole("button", {
      name: /Menu do usuário/i,
    });
    await expect(userMenuButton).toBeVisible({ timeout: 10000 });

    // Captura o nome do usuário
    const buttonElement = await userMenuButton.elementHandle();
    const initialUserText = await buttonElement?.textContent();
    expect(initialUserText).toBeTruthy();
    expect(initialUserText).toContain(usuario.fullName);

    // Faz refresh da página
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Verifica que ainda está autenticado
    await expect(userMenuButton).toBeVisible({ timeout: 10000 });

    // Verifica que o texto do botão (nome do usuário) é o mesmo
    const buttonElementAfter = await userMenuButton.elementHandle();
    const userTextAfterRefresh = await buttonElementAfter?.textContent();
    expect(userTextAfterRefresh).toBe(initialUserText);
  });

  test("deve manter sessão após múltiplos refreshes", async ({
    page,
    request,
  }) => {
    const usuario = gerarUsuarioUnico("multi-refresh");
    await criarUsuarioViaApi(request, usuario);
    await fazerLogin(page, usuario);

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
    request,
  }) => {
    const usuario = gerarUsuarioUnico("nav-refresh");
    await criarUsuarioViaApi(request, usuario);
    await fazerLogin(page, usuario);

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
    expect(midUserText).toContain(usuario.fullName);

    // Volta para home
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(userMenuButton).toBeVisible({ timeout: 10000 });
    const finalButtonElement = await userMenuButton.elementHandle();
    const finalUserText = await finalButtonElement?.textContent();
    expect(finalUserText).toBe(initialUserText);
  });
});
