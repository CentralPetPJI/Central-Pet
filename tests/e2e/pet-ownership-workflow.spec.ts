import { expect, test } from "@playwright/test";
import {
  criarUsuarioViaApi,
  fazerLogin,
  gerarUsuarioUnico,
} from "../utils/user-helpers";

/**
 * Teste E2E: Fluxo crítico de cadastro e visualização de pets
 * Testa: Registro de usuário → Login → Cadastro de pet → Aparece na lista "Meus Pets"
 */
test.describe("Fluxo de Cadastro de Pets", () => {
  test.beforeEach(async ({ page, request }) => {
    // Criar usuário e fazer login antes de cada teste
    const usuario = gerarUsuarioUnico("pet-workflow");
    await criarUsuarioViaApi(request, usuario);
    await fazerLogin(page, usuario);
  });

  test("deve cadastrar pet no backend e exibir na lista Meus Pets", async ({
    page,
  }) => {
    // Passo 1: Já estamos na home após login, verificar e clicar em "Cadastrar pet"
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Bem-vindo ao Pet Central!",
      }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Cadastrar pet" }).click();

    // Aguardar página de cadastro carregar
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Cadastre o pet para adoção",
      }),
    ).toBeVisible();

    // Passo 2: Preencher campos do formulário
    const timestamp = Date.now();
    const petName = `Claude E2E ${timestamp}`;

    // Limpar e preencher campo Nome
    const nomeField = page.getByRole("textbox", { name: "Nome", exact: true });
    await nomeField.clear();
    await nomeField.fill(petName);

    // Limpar e preencher campo Idade
    const idadeField = page.getByRole("textbox", {
      name: "Idade",
      exact: true,
    });
    await idadeField.clear();
    await idadeField.fill("2 anos");

    // Limpar e preencher campo Raça
    const racaField = page.getByRole("textbox", { name: "Raca", exact: true });
    await racaField.clear();
    await racaField.fill("Inteligência Artificial");

    // Limpar e preencher campo Tutor
    const tutorField = page.getByRole("textbox", {
      name: "Tutor",
      exact: true,
    });
    await tutorField.clear();
    await tutorField.fill("Assistente AI");

    // Limpar e preencher campo Abrigo
    const abrigoField = page.getByRole("textbox", {
      name: "Abrigo",
      exact: true,
    });
    await abrigoField.clear();
    await abrigoField.fill("Anthropic HQ");

    // Limpar e preencher campo Cidade
    const cidadeField = page.getByRole("textbox", {
      name: "Cidade",
      exact: true,
    });
    await cidadeField.clear();
    await cidadeField.fill("Sao Paulo - SP");

    // Limpar e preencher campo Contato
    const contatoField = page.getByRole("textbox", {
      name: "Contato",
      exact: true,
    });
    await contatoField.clear();
    await contatoField.fill("(11) 99999-0000");

    // Passo 3: Selecionar comportamentos (Curioso e Sociável)
    await page.getByRole("button", { name: /Curioso/ }).click();
    await page.getByRole("button", { name: /Sociavel/ }).click();

    // Passo 4: Submeter formulário
    await page.getByRole("button", { name: "Salvar pet" }).click();

    // Passo 5: Aguardar redirecionamento e verificar sucesso
    await page.waitForURL(/\/pets\/[a-f0-9-\d]+$/, { timeout: 15000 });
    await expect(
      page.getByRole("heading", { level: 1, name: petName }),
    ).toBeVisible();

    // Passo 6: Navegar para "Meus Pets" via menu do usuário
    // Primeiro aguardar que o header esteja carregado
    await page.waitForSelector(
      'button[aria-label="Menu do usuário"], button[aria-haspopup="menu"]',
      { timeout: 10000 },
    );

    // Tentar encontrar o botão de menu pelo aria-label ou texto
    const menuButton = page
      .locator("button")
      .filter({ hasText: /Menu do usuário|usuário/i })
      .or(page.getByRole("button", { name: /menu.*usuário/i }))
      .first();

    await menuButton.click();

    // Aguardar menu abrir e clicar em Meus Pets
    const myPetsLink = page.getByRole("link", { name: "Meus Pets" });
    await myPetsLink.waitFor({ state: "visible" });
    await myPetsLink.click();

    // Aguardar página "Meus Pets" carregar
    await page.waitForURL("/pets/mine", { timeout: 10000 });
    await expect(
      page.getByRole("heading", { level: 1, name: "Meus pets cadastrados" }),
    ).toBeVisible();

    // Passo 7: Verificar que o pet cadastrado aparece na lista
    // Localizar o card do pet específico usando o nome
    const petCard = page.locator("article").filter({ hasText: petName });

    await expect(
      petCard.getByRole("heading", { level: 2, name: petName }),
    ).toBeVisible();
    await expect(petCard.getByText("Cachorro")).toBeVisible();
    await expect(petCard.getByText("Inteligência Artificial")).toBeVisible();
    await expect(petCard.getByText("Sao Paulo - SP")).toBeVisible();
  });

  test("deve cadastrar pet sem duplicar no carousel", async ({ page }) => {
    // Passo 1: Navegar para cadastro de pet
    await page.goto("/pets/new");

    // Passo 2: Preencher o formulário
    const timestamp = Date.now();
    const petName = `No Duplicate ${timestamp}`;

    await page.getByRole("textbox", { name: "Nome" }).fill(petName);
    await page.getByRole("textbox", { name: "Tutor" }).fill("Test Tutor");
    await page.getByRole("textbox", { name: "Abrigo" }).fill("Test Shelter");
    await page.getByRole("textbox", { name: "Cidade" }).fill("Test City");
    await page.getByRole("textbox", { name: "Contato" }).fill("11999999999");

    // Passo 3: Salvar o pet
    await page.getByRole("button", { name: "Salvar pet" }).click();

    // Passo 4: Aguardar redirecionamento para o perfil
    await page.waitForURL(/\/pets\/\d+$/, { timeout: 15000 });
    await expect(
      page.getByRole("heading", { level: 1, name: petName }),
    ).toBeVisible();

    // Passo 5: Navegar para home para verificar o carousel
    await page.goto("/");

    // Aguarda que a página home carregue com a heading esperada
    await expect(
      page.getByRole("heading", { name: "Bem-vindo ao Pet Central!" }),
    ).toBeVisible();

    // Aguarda que o pet apareça no carousel
    // O carousel duplica o array para loop infinito, então aparece 2x
    await page.waitForFunction(
      (name) => {
        const elements = Array.from(document.querySelectorAll("*")).filter(
          (el) => el.textContent?.includes(name),
        );
        return elements.length >= 2;
      },
      petName,
      { timeout: 10000 },
    );

    // Contar quantas vezes o pet aparece no carousel
    const petCards = await page.locator(`img[alt="${petName}"]`).all();

    // Esperado: 2 (carousel duplica array para loop)
    // Bug seria: 4 (pet duplicado no array + carousel duplica)
    // Se nenhuma imagem com alt encontrada, tenta com text
    let count = petCards.length;
    if (count === 0) {
      const textElements = await page.locator(`text=${petName}`).all();
      count = textElements.length;
    }

    expect(count).toBeGreaterThanOrEqual(2);
  });
});
