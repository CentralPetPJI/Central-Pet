import { expect, test } from "@playwright/test";
import { criarPetsViaApi, softDeletePetsViaApi } from "../utils/pet-helpers";

test.describe("perfil do pet", () => {
  let petIdsCriados: string[] = [];

  test.afterEach(async ({ request }) => {
    await softDeletePetsViaApi(request, petIdsCriados);
    petIdsCriados = [];
  });

  test("perfil do pet mostra as secoes principais", async ({
    page,
    request,
  }) => {
    const nomePet = `Buddy Perfil E2E ${Date.now()}`;
    const [pet] = await criarPetsViaApi(request, {
      quantity: 1,
      names: [nomePet],
    });
    if (!pet) {
      throw new Error("Falha ao criar pet para o teste de perfil");
    }
    petIdsCriados = [pet.id];

    await page.goto("/");
    const carouselSection = page
      .getByRole("heading", { name: "Ultimos Pets" })
      .locator("xpath=ancestor::section[1]");
    await carouselSection.hover();

    const petImage = page.locator(`img[alt="${nomePet}"]:visible`).first();
    await expect(petImage).toBeVisible();
    await petImage.click();

    const adoptLink = page.getByRole("link", { name: "Quero adotar" });
    await expect(adoptLink).toBeVisible();
    await adoptLink.click();

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Galeria" })).toBeVisible();
    await expect(page.getByText("Saude", { exact: true })).toBeVisible();
    await expect(
      page.getByText("Comportamento", { exact: true }),
    ).toBeVisible();
  });
});
