import { expect, test } from "@playwright/test";
import {
  criarUsuarioViaApi,
  fazerLogin,
  gerarUsuarioUnico,
} from "../utils/user-helpers";
import { criarPetsViaApi, softDeletePetsViaApi } from "../utils/pet-helpers";

/**
 * Teste E2E: fluxo de atualização de pets.
 * Dividido em mini-testes para cobrir cada seção do formulário.
 */
test.describe("Fluxo de Atualização de Pets - Seções", () => {
  let petId: string;
  let usuario: any;
  let petIdsCriados: string[] = [];

  test.beforeEach(async ({ page, request }) => {
    // Setup comum: Criar usuário, logar e criar um pet base
    usuario = gerarUsuarioUnico("pet-upd-sec");
    const userCriado = await criarUsuarioViaApi(request, usuario);
    const owner = { ...userCriado, password: usuario.password };

    await fazerLogin(page, usuario);

    const [pet] = await criarPetsViaApi(request, {
      quantity: 1,
      names: [`Pet Base ${Date.now()}`],
      owner,
    });
    petId = pet.id;
    petIdsCriados.push(petId);
  });

  test.afterEach(async ({ request }) => {
    await softDeletePetsViaApi(request, petIdsCriados);
    petIdsCriados = [];
  });

  test("deve atualizar informações básicas (nome, idade, raça)", async ({
    page,
  }) => {
    await page.goto(`/pets/${petId}/edit`);

    await expect(
      page.getByRole("heading", { level: 1, name: "Edite o cadastro do pet" }),
    ).toBeVisible();

    const novoNome = `Rex Atualizado ${Date.now()}`;
    await page
      .getByRole("textbox", { name: "Nome", exact: true })
      .fill(novoNome);
    await page.getByLabel("Faixa etária").selectOption("FILHOTE");
    await page
      .getByRole("textbox", { name: "Raca", exact: true })
      .fill("Golden Retriever");

    await page.getByRole("button", { name: "Salvar alteracoes" }).click();

    // Redirecionamento para o perfil
    await page.waitForURL(/\/pets\/.+$/);

    // Sucesso: nome atualizado no heading do Hero
    await expect(
      page.getByRole("heading", { level: 1, name: novoNome }),
    ).toBeVisible();

    // Verificando badges de idade e raça
    await expect(page.getByText("Filhote", { exact: true })).toBeVisible();
    await expect(
      page.getByText("Golden Retriever", { exact: true }),
    ).toBeVisible();
  });

  test("deve manter os dados originais se cancelar a edição", async ({
    page,
  }) => {
    await page.goto(`/pets/${petId}/edit`);
    const nomeOriginal = await page
      .getByRole("textbox", { name: "Nome", exact: true })
      .inputValue();

    await page
      .getByRole("textbox", { name: "Nome", exact: true })
      .fill("Nome que nao deve ser salvo");

    // Navegar de volta via botão "Ver perfil do pet" (que cancela a edição)
    await page.getByRole("button", { name: "Ver perfil do pet" }).click();

    await page.waitForURL(/\/pets\/.+$/);
    await expect(
      page.getByRole("heading", { level: 1, name: nomeOriginal }),
    ).toBeVisible();
    await expect(
      page.getByText("Nome que nao deve ser salvo"),
    ).not.toBeVisible();
  });

  test("deve atualizar características físicas (espécie, sexo, porte)", async ({
    page,
  }) => {
    await page.goto(`/pets/${petId}/edit`);

    await page.getByLabel("Especie").selectOption("cat");
    await page.getByLabel("Sexo").selectOption("female");
    await page.getByLabel("Porte").selectOption("large");

    await page.getByRole("button", { name: "Salvar alteracoes" }).click();

    await page.waitForURL(/\/pets\/.+$/);

    // Sexo e Porte aparecem no perfil
    await expect(page.getByText("Fêmea", { exact: true })).toBeVisible();
    await expect(page.getByText("Porte Grande", { exact: true })).toBeVisible();

    // Espécie (Gato) aparece na lista "Meus Pets"
    await page.goto("/pets/mine");
    // Filtrar pelo petId contido no href do link "Ver perfil"
    const petCard = page
      .locator("article")
      .filter({ has: page.locator(`a[href*="${petId}"]`) });
    await expect(petCard.getByText(/Gato/i)).toBeVisible();
  });

  test("deve atualizar estado de saúde e cuidados", async ({ page }) => {
    await page.goto(`/pets/${petId}/edit`);

    // Inverter alguns valores de saúde
    await page.getByLabel("Vacinado").uncheck();
    await page.getByLabel("Castrado").check();
    await page.getByLabel("Vermifugado").check();
    await page.getByLabel("Necessita de cuidados de saude").check();

    await page.getByRole("button", { name: "Salvar alteracoes" }).click();

    await page.waitForURL(/\/pets\/.+$/);

    // No perfil, os valores são exibidos como "Sim" ou "Nao"
    const checkFact = async (label: string, expectedValue: string) => {
      const factLabel = page.getByText(label, { exact: true });
      const factValue = factLabel.locator("xpath=../p[2]");
      // Adicionar um pequeno retry implícito via expect
      await expect(factValue).toHaveText(expectedValue, { timeout: 10000 });
    };

    await checkFact("Vacinado", "Nao");
    await checkFact("Castrado", "Sim");
    await checkFact("Vermifugado", "Sim");
    await checkFact("Necessita de cuidados de saude", "Sim");
  });

  test("deve atualizar traços de personalidade e comportamento", async ({
    page,
  }) => {
    await page.goto(`/pets/${petId}/edit`);

    // Selecionar personalidades
    await page.getByRole("button", { name: /Brincalhão/i }).click();
    await page.getByRole("button", { name: /Protetor/i }).click();
    await page.getByRole("button", { name: /Sociável/i }).click();

    await page.getByRole("button", { name: "Salvar alteracoes" }).click();

    await page.waitForURL(/\/pets\/.+$/);

    // No perfil as personalidades aparecem em uma lista
    await expect(page.getByText("Brincalhão")).toBeVisible();
    await expect(page.getByText("Protetor")).toBeVisible();
    await expect(page.getByText("Sociável")).toBeVisible();
  });

  test("não deve mostrar botão de editar para pet de outro usuário", async ({
    page,
    request,
  }) => {
    // Logout e login com outro usuário
    const outroUsuario = gerarUsuarioUnico("other-user-upd");
    await criarUsuarioViaApi(request, outroUsuario);

    // Garantir que estamos deslogados antes de logar com outro
    await page.goto("/");
    const menuButton = page.getByRole("button", { name: "Menu do usuário" });
    if (await menuButton.isVisible()) {
      await menuButton.click();
      const logoutButton = page.getByRole("button", { name: "Sair" });
      await logoutButton.waitFor({ state: "visible" });
      await logoutButton.click();
    }

    await fazerLogin(page, outroUsuario);

    await page.goto(`/pets/${petId}`);

    // Botão "Editar cadastro" na galeria não deve ser visível
    const editButton = page.getByRole("link", { name: "Editar cadastro" });
    await expect(editButton).not.toBeVisible();
  });
});
