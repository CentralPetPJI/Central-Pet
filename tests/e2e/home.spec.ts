import { expect, test } from "@playwright/test";

test("home renderiza o carousel e abre o modal do pet", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Bem-vindo ao Pet Central!" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Latest Pets" }),
  ).toBeVisible();

  await page.getByRole("img", { name: "Buddy" }).first().click({ force: true });

  await expect(
    page.getByRole("heading", { level: 2, name: "Buddy" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Quero adotar" })).toBeVisible();
});
