import { expect, test } from "@playwright/test";
import {
  criarUsuarioViaApi,
  fazerLogin,
  fazerLogout,
  gerarUsuarioUnico,
  type UsuarioCriadoE2E,
} from "../utils/user-helpers";
import { criarPetsViaApi, type PetCriadoE2E } from "../utils/pet-helpers";

test.describe.serial("Fluxo de Adoção", () => {
  let donor: UsuarioCriadoE2E & { password: string };
  let adopter: UsuarioCriadoE2E & { password: string };
  let pet: PetCriadoE2E;
  let testId: string;

  test.beforeEach(async ({ request }) => {
    // Gerar um ID único para este teste específico dentro da suíte
    testId =
      Math.random().toString(36).substring(2, 10) +
      Date.now().toString(36).slice(-4);

    // 1. Gerar Doador Único
    const donorData = gerarUsuarioUnico(`don-${testId}`);
    const createdDonor = await criarUsuarioViaApi(request, donorData);
    donor = { ...createdDonor, password: donorData.password };

    // 2. Gerar Adotante Único
    const adopterData = gerarUsuarioUnico(`ado-${testId}`);
    const createdAdopter = await criarUsuarioViaApi(request, adopterData);
    adopter = { ...createdAdopter, password: adopterData.password };

    // 3. Gerar Pet Único
    const petName = `Pet-${testId}`;
    const pets = await criarPetsViaApi(request, {
      quantity: 1,
      names: [petName],
      owner: donor,
    });
    pet = pets[0];
  });
  test("deve realizar o fluxo completo de adoção: solicitação -> compartilhamento de contato -> aprovação", async ({
    page,
  }) => {
    // 1. ADOTANTE: Solicitar adoção
    await fazerLogin(page, adopter);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Selecionar o pet exato pelo nome único usando exact text
    const petCard = page.locator("h3").filter({ hasText: pet.name }).first();
    await petCard.click({ force: true });

    await page.getByRole("link", { name: "Quero adotar" }).click();
    await expect(page.locator("h1")).toHaveText(pet.name, { timeout: 15000 });

    await page.getByRole("button", { name: "Solicitar Adoção" }).click();
    await page.locator('input[type="checkbox"]').check();
    await page.getByRole("button", { name: "Enviar solicitação" }).click();
    await expect(
      page.getByText("Solicitação enviada com sucesso"),
    ).toBeVisible();

    // 2. DOADOR: Compartilhar contato
    await fazerLogout(page);
    await fazerLogin(page, donor);
    await page.goto("/adoption-requests");
    await page.waitForLoadState("networkidle");

    const receivedCard = page
      .locator("article")
      .filter({ hasText: pet.name })
      .first();
    await expect(receivedCard).toBeVisible();

    await receivedCard
      .getByRole("button", { name: "Compartilhar contato" })
      .click();
    await expect(receivedCard.getByText("Contato compartilhado")).toBeVisible();

    // 3. DOADOR: Aprovar adoção
    await receivedCard
      .getByRole("button", { name: "Aprovar solicitacao" })
      .click();
    await page.getByRole("button", { name: "Confirmar aprovação" }).click();
    await expect(receivedCard.getByText("Aprovada")).toBeVisible();

    // 4. VERIFICAÇÃO FINAL: Pet agora pertence ao adotante
    await fazerLogout(page);
    await fazerLogin(page, adopter);
    await page.goto("/pets/mine");
    await expect(
      page.locator("article").filter({ hasText: pet.name }).first(),
    ).toBeVisible();
  });

  test("não deve permitir que o dono solicite adoção do próprio pet", async ({
    page,
  }) => {
    await fazerLogin(page, donor);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const petCard = page.locator("h3").filter({ hasText: pet.name }).first();
    await petCard.click({ force: true });
    await page.getByRole("link", { name: "Quero adotar" }).click();

    await expect(page.locator("h1")).toHaveText(pet.name);
    await expect(
      page.getByRole("button", { name: "Solicitar Adoção" }),
    ).not.toBeVisible();
  });

  test("não deve permitir que o adotante envie nova solicitação após ser rejeitado", async ({
    page,
  }) => {
    // 1. ADOTANTE: Solicitar inicial
    await fazerLogin(page, adopter);
    await page.goto("/");
    await page
      .locator("h3")
      .filter({ hasText: pet.name })
      .first()
      .click({ force: true });
    await page.getByRole("link", { name: "Quero adotar" }).click();
    await page.getByRole("button", { name: "Solicitar Adoção" }).click();
    await page.locator('input[type="checkbox"]').check();
    await page.getByRole("button", { name: "Enviar solicitação" }).click();
    await expect(
      page.getByText("Solicitação enviada com sucesso"),
    ).toBeVisible();

    await fazerLogout(page);

    // 2. DOADOR: Rejeitar
    await fazerLogin(page, donor);
    await page.goto("/adoption-requests");
    const receivedCard = page
      .locator("article")
      .filter({ hasText: pet.name })
      .first();
    await receivedCard
      .getByRole("button", { name: "Rejeitar solicitacao" })
      .click();
    await page.getByRole("button", { name: "Confirmar rejeição" }).click();
    await expect(receivedCard.getByText("Recusada")).toBeVisible();

    // 3. ADOTANTE: Tentar novamente
    await fazerLogout(page);
    await fazerLogin(page, adopter);
    await page.goto("/");
    await page
      .locator("h3")
      .filter({ hasText: pet.name })
      .first()
      .click({ force: true });
    await page.getByRole("link", { name: "Quero adotar" }).click();
    await expect(
      page.getByRole("button", { name: "Solicitar Adoção" }),
    ).not.toBeVisible();
  });
});
