import { expect, test } from "@playwright/test";
import {
  criarUsuarioViaApi,
  fazerLogin,
  gerarUsuarioUnico,
} from "../utils/user-helpers";

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
        name: "Bem-vindo ao Pet Central!",
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
      .fill("Inteligencia Artificial");

    await page.getByLabel("Especie").selectOption("dog");
    await page.getByLabel("Sexo").selectOption("male");
    await page.getByLabel("Porte").selectOption("medium");

    await page
      .getByRole("textbox", { name: "Tutor", exact: true })
      .fill("Assistente AI");
    await page
      .getByRole("textbox", { name: "Abrigo", exact: true })
      .fill("Anthropic HQ");
    await page
      .getByRole("textbox", { name: "Cidade", exact: true })
      .fill("Sao Paulo");
    await page.getByLabel("Estado").selectOption("SP");
    await page
      .getByRole("textbox", { name: "Contato", exact: true })
      .fill("(11) 99999-0000");

    await page.getByRole("button", { name: /Curioso/ }).click();
    await page.getByRole("button", { name: /Sociavel/ }).click();

    await page.getByRole("button", { name: "Salvar pet" }).click();

    await page.waitForURL(/\/pets\/[a-f0-9-\d]+$/, { timeout: 15000 });
    await expect(
      page.getByRole("heading", { level: 1, name: petName }),
    ).toBeVisible();

    await page.waitForSelector(
      'button[aria-label="Menu do usuario"], button[aria-haspopup="menu"]',
      { timeout: 10000 },
    );

    const menuButton = page
      .locator("button")
      .filter({ hasText: /Menu do usuario|usuario/i })
      .or(page.getByRole("button", { name: /menu.*usuario/i }))
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
    await expect(petCard.getByText("Inteligencia Artificial")).toBeVisible();
    await expect(petCard.getByText("Sao Paulo")).toBeVisible();
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

    await page
      .getByRole("textbox", { name: "Tutor", exact: true })
      .fill("Test Tutor");
    await page
      .getByRole("textbox", { name: "Abrigo", exact: true })
      .fill("Test Shelter");
    await page
      .getByRole("textbox", { name: "Cidade", exact: true })
      .fill("Test City");
    await page.getByLabel("Estado").selectOption("SP");
    await page
      .getByRole("textbox", { name: "Contato", exact: true })
      .fill("11999999999");

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
