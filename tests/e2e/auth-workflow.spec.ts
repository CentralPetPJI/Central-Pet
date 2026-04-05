import { expect, test } from "@playwright/test";
import { criarUsuarioViaApi, gerarUsuarioUnico } from "../utils/user-helpers";

test.describe("Fluxo de autenticação", () => {
  test("deve autenticar com sucesso usando credenciais válidas", async ({
    page,
    request,
  }) => {
    const usuario = gerarUsuarioUnico("login-sucesso");
    await criarUsuarioViaApi(request, usuario);

    await page.goto("/login");

    await page.getByLabel("E-mail").fill(usuario.email);
    await page.getByLabel("Senha").fill(usuario.password);
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("button", { name: "Menu do usuário" }),
    ).toBeVisible();
  });

  test("deve exibir feedback ao falhar login com credenciais inválidas", async ({
    page,
  }) => {
    await page.goto("/login");

    await page.getByLabel("E-mail").fill(`invalido.${Date.now()}@example.com`);
    await page.getByLabel("Senha").fill("senha-incorreta");
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByText(
        "E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.",
      ),
    ).toBeVisible();
  });

  test("deve registrar conta com sucesso e entrar automaticamente", async ({
    page,
  }) => {
    const usuario = gerarUsuarioUnico("registro-sucesso");

    await page.goto("/register");

    await page.getByLabel("Nome completo").fill(usuario.fullName);
    await page.getByLabel("CPF").fill(usuario.cpf);
    await page.getByLabel("E-mail").fill(usuario.email);
    await page.getByLabel("Senha", { exact: true }).fill(usuario.password);
    await page
      .getByLabel("Confirmar senha", { exact: true })
      .fill(usuario.password);
    await page.getByRole("button", { name: "Criar conta" }).click();

    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("button", { name: "Menu do usuário" }),
    ).toBeVisible();
  });

  test("deve impedir registro quando as senhas não conferem", async ({
    page,
  }) => {
    const usuario = gerarUsuarioUnico("registro-falha");

    await page.goto("/register");

    await page.getByLabel("Nome completo").fill(usuario.fullName);
    await page.getByLabel("CPF").fill(usuario.cpf);
    await page.getByLabel("E-mail").fill(usuario.email);
    await page.getByLabel("Senha", { exact: true }).fill(usuario.password);
    await page
      .getByLabel("Confirmar senha", { exact: true })
      .fill("SenhaDiferente123!");
    await page.getByRole("button", { name: "Criar conta" }).click();

    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByText("As senhas não coincidem.")).toBeVisible();
  });
});
