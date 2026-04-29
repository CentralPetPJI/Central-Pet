import { expect, test } from "@playwright/test";
import {
  criarUsuarioViaApi,
  fazerLogin,
  gerarUsuarioUnico,
} from "../utils/user-helpers";

/**
 * Teste E2E: fluxo crítico de cadastro e visualização de pets.
 * Testa: registro de usuário -> login -> cadastro de pet -> aparece na lista "Meus Pets".
 */
test.describe("Fluxo de Cadastro de Pets", () => {
  test.beforeEach(async ({ page, request }) => {
    const usuario = gerarUsuarioUnico("pet-workflow");
    await criarUsuarioViaApi(request, usuario);
    await fazerLogin(page, usuario);
  });

  test("deve cadastrar pet no backend e exibir na lista Meus Pets", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /^Bem-vindo ao .+!$/,
      }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Cadastrar pet" }).click();

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Cadastre o pet para adoção",
      }),
    ).toBeVisible();

    const timestamp = Date.now();
    const petName = `Claude E2E ${timestamp}`;

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles("../central-pet-front/public/icon-pet.png");

    await page
      .getByRole("textbox", { name: "Nome", exact: true })
      .fill(petName);
    await page.getByLabel("Faixa etaria").selectOption("ADULTO");
    await page
      .getByRole("textbox", { name: "Raca", exact: true })
      .fill("Inteligência Artificial");

    await page.getByLabel("Especie").selectOption("dog");
    await page.getByLabel("Sexo").selectOption("male");
    await page.getByLabel("Porte").selectOption("medium");

    await page.getByRole("button", { name: /Curioso/i }).click();
    await page.getByRole("button", { name: /Sociavel/i }).click();
    await page.getByRole("button", { name: "Salvar pet" }).click();

    await page.waitForURL(/\/pets\/\d+$/, { timeout: 15000 });
    await expect(
      page.getByRole("heading", { level: 1, name: petName }),
    ).toBeVisible();

    const menuButton = page.getByRole("button", { name: "Menu do usuário" });
    await menuButton.waitFor({ state: "visible", timeout: 10000 });
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
    await expect(petCard.getByText(/Sao Paulo|São Paulo/i)).toBeVisible();
  });

  test("deve cadastrar pet sem duplicar no carousel", async ({ page }) => {
    await page.goto("/pets/new");

    const timestamp = Date.now();
    const petName = `No Duplicate ${timestamp}`;

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles("../central-pet-front/public/icon-pet.png");

    await page
      .getByRole("textbox", { name: "Nome", exact: true })
      .fill(petName);
    await page.getByLabel("Faixa etaria").selectOption("JOVEM");
    await page.getByRole("textbox", { name: "Raca", exact: true }).fill("SRD");

    await page.getByLabel("Especie").selectOption("dog");
    await page.getByLabel("Sexo").selectOption("male");
    await page.getByLabel("Porte").selectOption("medium");

    await page.getByRole("button", { name: "Salvar pet" }).click();

    await page.waitForURL(/\/pets\/\d+$/, { timeout: 15000 });
    await expect(
      page.getByRole("heading", { level: 1, name: petName }),
    ).toBeVisible();

    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /^Bem-vindo ao .+!$/ }),
    ).toBeVisible();

    const petImages = page.locator(`img[alt="${petName}"]`);
    await expect(petImages.first()).toBeVisible({ timeout: 10000 });

    const count = await petImages.count();
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBeLessThanOrEqual(2);
  });
});
