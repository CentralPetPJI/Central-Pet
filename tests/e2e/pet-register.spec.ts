import { expect, test } from "@playwright/test";
import {
  criarUsuarioViaApi,
  fazerLogin,
  gerarUsuarioUnico,
} from "../utils/user-helpers";

test("cadastro cria pet e redireciona para o perfil", async ({
  page,
  request,
}) => {
  const usuario = gerarUsuarioUnico("session-refresh");
  await criarUsuarioViaApi(request, usuario);
  await fazerLogin(page, usuario);
  await page.goto("/pets/new");

  await expect(
    page.getByRole("heading", { level: 1, name: "Cadastre o pet para adoção" }),
  ).toBeVisible();

  // Preencher Foto De Perfil
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles("../central-pet-front/public/icon-pet.png");

  await page
    .getByRole("textbox", { name: "Nome", exact: true })
    .fill("Rex E2E");
  await page.getByLabel("Faixa etaria").selectOption("ADULTO");
  await page.getByRole("textbox", { name: "Raca", exact: true }).fill("SRD");

  // Selecionar opções obrigatórias
  await page.getByLabel("Especie").selectOption("dog");
  await page.getByLabel("Sexo").selectOption("male");
  await page.getByLabel("Porte").selectOption("medium");

  await page
    .getByRole("textbox", { name: "Tutor", exact: true })
    .fill("Teste E2E");
  await page
    .getByRole("textbox", { name: "Abrigo", exact: true })
    .fill("Abrigo E2E");
  await page
    .getByRole("textbox", { name: "Cidade", exact: true })
    .fill("Sao Paulo");
  await page.getByLabel("Estado").selectOption("SP");
  await page
    .getByRole("textbox", { name: "Contato", exact: true })
    .fill("11999999999");

  await page.getByRole("button", { name: "Salvar pet" }).click();

  // Redireciona para o perfil (ID numérico amigável)
  await expect(page).toHaveURL(/\/pets\/\d+$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Rex E2E" }),
  ).toBeVisible();
});
