import { expect, test } from "@playwright/test";
import {
  criarUsuarioViaApi,
  fazerLogin,
  gerarUsuarioUnico,
} from "../utils/user-helpers";
import { obterImagemFixtureParaUpload } from "../utils/file-fixtures";

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
  await fileInput.setInputFiles(obterImagemFixtureParaUpload());

  await page
    .getByRole("textbox", { name: "Nome", exact: true })
    .fill("Rex E2E");
  await page.getByLabel("Faixa etária").selectOption("ADULTO");
  await page.getByRole("textbox", { name: "Raça", exact: true }).fill("SRD");

  // Selecionar opções obrigatórias
  await page.getByLabel("Espécie").selectOption("dog");
  await page.getByLabel("Sexo").selectOption("male");
  await page.getByLabel("Porte").selectOption("medium");

  await page.getByRole("button", { name: "Salvar pet" }).click();

  // Redireciona para o perfil (ID público no formato pet_<slug>)
  await expect(page).toHaveURL(/\/pets\/pet_[a-z0-9]+$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Rex E2E" }),
  ).toBeVisible();
});
