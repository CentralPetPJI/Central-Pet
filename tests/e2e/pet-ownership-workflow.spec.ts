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

    // Preencher Foto De Perfil
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles("../central-pet-front/public/icon-pet.png");

    // Preencher campos de texto
    await page
      .getByRole("textbox", { name: "Nome", exact: true })
      .fill(petName);
    await page
      .getByRole("textbox", { name: "Idade", exact: true })
      .fill("2 anos");
    await page
      .getByRole("textbox", { name: "Raca", exact: true })
      .fill("Inteligência Artificial");

    // Selecionar opções obrigatórias
    await page.getByLabel("Especie").selectOption("dog");
    await page.getByLabel("Sexo").selectOption("male");
    await page.getByLabel("Porte").selectOption("medium");

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
    await page.waitForSelector(
      'button[aria-label="Menu do usuário"], button[aria-haspopup="menu"]',
      { timeout: 10000 },
    );

    const menuButton = page
      .locator("button")
      .filter({ hasText: /Menu do usuário|usuário/i })
      .or(page.getByRole("button", { name: /menu.*usuário/i }))
      .first();

    await menuButton.click();

    const myPetsLink = page.getByRole("link", { name: "Meus Pets" });
    await myPetsLink.waitFor({ state: "visible" });
    await myPetsLink.click();

    await page.waitForURL("/pets/mine", { timeout: 10000 });
    await expect(
      page.getByRole("heading", { level: 1, name: "Meus pets cadastrados" }),
    ).toBeVisible();

    const petCard = page.locator("article").filter({ hasText: petName });

    await expect(
      petCard.getByRole("heading", { level: 2, name: petName }),
    ).toBeVisible();
    await expect(petCard.getByText("Cachorro")).toBeVisible();
    await expect(petCard.getByText("Inteligência Artificial")).toBeVisible();
    await expect(petCard.getByText("Sao Paulo")).toBeVisible();
  });

  test("deve cadastrar pet sem duplicar no carousel", async ({ page }) => {
    await page.goto("/pets/new");

    const timestamp = Date.now();
    const petName = `No Duplicate ${timestamp}`;

    // Preencher Foto De Perfil
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles("../central-pet-front/public/icon-pet.png");

    await page
      .getByRole("textbox", { name: "Nome", exact: true })
      .fill(petName);
    await page
      .getByRole("textbox", { name: "Idade", exact: true })
      .fill("1 ano");
    await page.getByRole("textbox", { name: "Raca", exact: true }).fill("SRD");

    // Selecionar opções obrigatórias
    await page.getByLabel("Especie").selectOption("dog");
    await page.getByLabel("Sexo").selectOption("male");
    await page.getByLabel("Porte").selectOption("medium");

    await page.getByRole("button", { name: "Salvar pet" }).click();

    await page.waitForURL(/\/pets\/[a-f0-9-\d]+$/, { timeout: 15000 });
    await expect(
      page.getByRole("heading", { level: 1, name: petName }),
    ).toBeVisible();

    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Bem-vindo ao Pet Central!" }),
    ).toBeVisible();

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

    const petCards = await page.locator(`img[alt="${petName}"]`).all();

    let count = petCards.length;
    if (count === 0) {
      const textElements = await page.locator(`text=${petName}`).all();
      count = textElements.length;
    }

    expect(count).toBe(2);
  });
});
