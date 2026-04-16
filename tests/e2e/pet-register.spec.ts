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

  await page.getByRole("textbox", { name: "Nome" }).fill("Rex E2E");
  await page.getByRole("textbox", { name: "Tutor" }).fill("Teste E2E");
  await page.getByRole("textbox", { name: "Abrigo" }).fill("Abrigo E2E");
  await page.getByRole("textbox", { name: "Cidade" }).fill("Sao Paulo");
  await page.getByRole("textbox", { name: "Contato" }).fill("11999999999");

  await page.getByRole("button", { name: "Salvar pet" }).click();

  await expect(page).toHaveURL(/\/pets\/\d+$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Rex E2E" }),
  ).toBeVisible();
});
