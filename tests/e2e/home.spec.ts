import { expect, test } from "@playwright/test";
import { criarPetsViaApi, softDeletePetsViaApi } from "../utils/pet-helpers";

test.describe("home", () => {
  let petIdsCriados: string[] = [];

  test.afterEach(async ({ request }) => {
    await softDeletePetsViaApi(request, petIdsCriados);
    petIdsCriados = [];
  });

  test("home renderiza o carousel e abre o modal do pet", async ({
    page,
    request,
  }) => {
    const nomePetPrincipal = `Buddy E2E ${Date.now()}`;
    const petsCriados = await criarPetsViaApi(request, {
      quantity: 3,
      names: [
        nomePetPrincipal,
        `Luna E2E ${Date.now()}`,
        `Thor E2E ${Date.now()}`,
      ],
    });
    petIdsCriados = petsCriados.map((pet) => pet.id);

    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /^Bem-vindo ao .+!$/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Ultimos Pets" }),
    ).toBeVisible();

    const carouselSection = page
      .getByRole("heading", { name: "Ultimos Pets" })
      .locator("xpath=ancestor::section[1]");
    await carouselSection.hover();

    const petImage = page
      .locator(`img[alt="${nomePetPrincipal}"]:visible`)
      .first();
    await expect(petImage).toBeVisible();
    await petImage.click();

    await expect(
      page.getByRole("heading", { level: 2, name: nomePetPrincipal }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Quero adotar" }),
    ).toBeVisible();
  });
});
