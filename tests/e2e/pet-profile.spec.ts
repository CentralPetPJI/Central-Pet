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
    await page
      .getByRole("img", { name: nomePet })
      .first()
      .click({ force: true });
    await page.getByRole("link", { name: "Quero adotar" }).click();

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Galeria" })).toBeVisible();
    await expect(page.getByText("Saude", { exact: true })).toBeVisible();
    await expect(
      page.getByText("Comportamento", { exact: true }),
    ).toBeVisible();
  });
});
