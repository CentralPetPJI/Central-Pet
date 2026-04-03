import { expect, test } from "@playwright/test";

test("perfil do pet mostra as secoes principais", async ({ page }) => {
  await page.goto("/pets/1");

  await expect(
    page.getByRole("heading", { level: 1, name: "Buddy" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Galeria" })).toBeVisible();
  await expect(page.getByText("Saude", { exact: true })).toBeVisible();
  await expect(page.getByText("Comportamento", { exact: true })).toBeVisible();
  await expect(page.getByText("Localizacao", { exact: true })).toBeVisible();
});
