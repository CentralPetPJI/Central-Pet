import { test, expect } from "@playwright/test";
import {
  gerarUsuarioUnico,
  criarUsuarioViaApi,
  fazerLogin,
} from "../utils/user-helpers";

test.describe("Fluxo de Instituições", () => {
  test("Deve gerar instituição automaticamente ao cadastrar como ONG", async ({
    request,
    page,
  }) => {
    // 1. Cadastro via API como ONG com CNPJ único
    const cnpjUnico = `${Math.floor(Math.random() * 1_000_000_000_0000)
      .toString()
      .padStart(14, "0")}`;
    const usuario = gerarUsuarioUnico("ong");
    const resposta = await request.post("http://localhost:3001/api/users", {
      data: {
        fullName: usuario.fullName,
        email: usuario.email,
        password: usuario.password,
        role: "ONG",
        organizationName: "ONG Teste Automático",
        cnpj: cnpjUnico,
      },
    });
    expect(resposta.ok()).toBeTruthy();

    // 2. Login e verificação
    await fazerLogin(page, usuario);

    // Verifica se a instituição "me" existe
    const meResponse = await request.get(
      "http://localhost:3001/api/institutions/me",
      {
        headers: {
          // Assume que o login via UI define o cookie de sessão corretamente
          Cookie: (await page.context().cookies())
            .map((c) => `${c.name}=${c.value}`)
            .join("; "),
        },
      },
    );
    expect(meResponse.ok()).toBeTruthy();
    const data = await meResponse.json();
    expect(data.name).toBe("ONG Teste Automático");
  });

  test("Usuário PF deve conseguir ativar perfil de instituição manualmente", async ({
    request,
    page,
  }) => {
    // 1. Cadastro e Login PF
    const usuario = gerarUsuarioUnico("pf");
    await criarUsuarioViaApi(request, usuario);
    await fazerLogin(page, usuario);

    // 2. Navegar para página de criação
    await page.goto("/institutions/register");
    await page.waitForLoadState("networkidle");

    // 3. Preencher formulário com seletores baseados em placeholder
    const nomeInput = page.getByPlaceholder("Ex: Projeto Patas Amigas");
    await nomeInput.waitFor({ state: "visible" });
    await nomeInput.fill("Abrigo PF Teste");

    await page
      .getByPlaceholder("Conte um pouco sobre seu trabalho...")
      .fill("Conte um pouco sobre seu trabalho e missão...");

    await page.getByRole("button", { name: "Ativar Perfil Público" }).click();

    // 4. Validação de redirecionamento e criação
    await expect(page).toHaveURL("/institutions/mine");

    const meResponse = await request.get(
      "http://localhost:3001/api/institutions/me",
      {
        headers: {
          Cookie: (await page.context().cookies())
            .map((c) => `${c.name}=${c.value}`)
            .join("; "),
        },
      },
    );
    expect(meResponse.ok()).toBeTruthy();
    const data = await meResponse.json();
    expect(data.name).toBe("Abrigo PF Teste");
  });
});
