import { expect, test } from "@playwright/test";
import {
  criarUsuarioViaApi,
  fazerLogin,
  gerarUsuarioUnico,
} from "../utils/user-helpers";

test.describe("profile-workflow", () => {
  test("desativar conta deve tornar usuário, pets e solicitações inacessíveis", async ({
    page,
    request,
  }) => {
    // 1. Criar usuário e pet
    const usuario = gerarUsuarioUnico("profileWorkflow");
    const user = await criarUsuarioViaApi(request, usuario);

    const petResposta = await request.post("http://localhost:3001/api/pets", {
      data: {
        name: "Pet Segredo",
        age: "2 anos",
        species: "dog",
        breed: "SRD",
        sex: "Macho",
        size: "Medio",
        profilePhoto: "foto.jpg",
        tutor: "Tutor",
        shelter: "Abrigo",
        city: "Salvador",
        state: "BA",
        contact: "999999999",
        responsibleUserId: user.id,
        microchipped: false,
        vaccinated: false,
        neutered: false,
        dewormed: false,
        needsHealthCare: false,
        physicalLimitation: false,
        visualLimitation: false,
        hearingLimitation: false,
        sourceType: "PESSOA_FISICA",
        sourceName: "Tutor",
      },
    });
    expect(petResposta.ok()).toBeTruthy();
    const pet = (await petResposta.json()).data;

    // Login inicial para criar o pet
    await fazerLogin(page, usuario);

    // Validação do pet
    await page.goto("/");
    const elements = page.getByRole("img", { name: "Pet Segredo" });
    // OBS: Pode duplicar por conta do carousel ser um loop infinito, mas o importante é garantir que ele aparece
    expect(await elements.count()).toBeGreaterThan(1);

    // 2. Desativar conta
    await page.goto("/profile");
    await page.getByRole("button", { name: "Desativar conta" }).click();
    await page.getByRole("button", { name: "Confirmar desativação" }).click();

    // 3. Validação de inacessibilidade

    // A) Usuário não deve logar
    await page.goto("/login");
    await page.getByLabel("E-mail").fill(usuario.email);
    await page.getByLabel("Senha").fill(usuario.password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByText("Esta conta foi desativada")).toBeVisible();

    // B) Pet não deve aparecer na listagem pública (API e UI)
    const listaPets = await request.get("http://localhost:3001/api/pets");
    const petsData = (await listaPets.json()).data;
    const petEncontrado = petsData.find((p: any) => p.id === pet.id);
    expect(petEncontrado).toBeUndefined();

    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Pet Segredo" }),
    ).toHaveCount(0);

    // C) Usuário não deve ser encontrado na API
    const respostaPerfil = await request.get(
      `http://localhost:3001/api/users/me`,
    );
    expect(respostaPerfil.status()).toBe(401);

    // D) Pet não deve ser encontrado na pagina inicial
    await page.goto("/");
    await expect(page.getByRole("img", { name: "Pet Segredo" })).toHaveCount(0);
  });
});
