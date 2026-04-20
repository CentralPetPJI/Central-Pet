import { expect, test } from "@playwright/test";
import {
  criarUsuarioViaApi,
  fazerLogin,
  gerarUsuarioUnico,
} from "../utils/user-helpers";

test.describe("profile-workflow", () => {
  const BASE_API = process.env.BASE_API ?? "http://localhost:3001";

  test("desativar conta deve tornar usuário, pets e solicitações inacessíveis", async ({
    page,
    request,
  }) => {
    // 1. Criar usuário e pet
    const usuario = gerarUsuarioUnico("profileWorkflow");
    const user = await criarUsuarioViaApi(request, usuario);

    const petResposta = await request.post(`${BASE_API}/api/pets`, {
      data: {
        name: "Pet Segredo",
        age: "2 anos",
        species: "dog",
        breed: "SRD",
        sex: "male",
        size: "medium",
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
    const listaPets = await request.get(`${BASE_API}/api/pets`);
    const petsData = (await listaPets.json()).data;
    const petEncontrado = petsData.find((p: { id: string }) => p.id === pet.id);
    expect(petEncontrado).toBeUndefined();

    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Pet Segredo" }),
    ).toHaveCount(0);

    // C) Usuário não deve ser encontrado na API
    const respostaPerfil = await request.get(`${BASE_API}/api/users/me`);
    expect(respostaPerfil.status()).toBe(401);

    // D) Pet não deve ser encontrado na pagina inicial
    await page.goto("/");
    await expect(page.getByRole("img", { name: "Pet Segredo" })).toHaveCount(0);
  });

  test("edita, salva, navega e verifica persistência do perfil do usuário", async ({
    page,
    request,
  }) => {
    const BASE_API = process.env.BASE_API ?? "http://localhost:3001";

    // 1. Criar usuário e login
    const usuario = gerarUsuarioUnico("profilePersist");
    await criarUsuarioViaApi(request, usuario);
    await fazerLogin(page, usuario);

    // 2. Ir para profile e editar campos
    await page.goto("/profile");

    const newCity = "Cidade Teste";
    const newState = "CE";
    const newPhone = "(11) 4000-0000";
    const newMobile = "(11) 99999-0000";
    const newWebsite = "https://example.org";

    await page.getByLabel("Cidade").fill(newCity);
    await page.getByLabel("Estado").selectOption(newState);
    await page.getByLabel("Telefone Fixo (opcional)").fill(newPhone);
    await page.getByLabel("Celular / WhatsApp (opcional)").fill(newMobile);
    await page.getByLabel("Website (opcional)").fill(newWebsite);

    // 3. Salvar
    await page.getByRole("button", { name: "Salvar alterações" }).click();
    await expect(
      page.getByText("Perfil atualizado com sucesso!"),
    ).toBeVisible();

    // 4. Navegar para home e voltar
    await page.goto("/");
    await expect(page).toHaveURL("/");
    await page.goto("/profile");
    await expect(page).toHaveURL("/profile");

    // 5. Verificar persistência nos campos editáveis
    await expect(page.getByLabel("Cidade")).toHaveValue(newCity);
    await expect(page.getByLabel("Estado")).toHaveValue(newState);
    await expect(page.getByLabel("Telefone Fixo (opcional)")).toHaveValue(
      newPhone,
    );
    await expect(page.getByLabel("Celular / WhatsApp (opcional)")).toHaveValue(
      newMobile,
    );
    await expect(page.getByLabel("Website (opcional)")).toHaveValue(newWebsite);

    // 6. Verificar seção de Informações da Conta mostra a cidade
    await expect(page.getByText(newCity, { exact: false })).toBeVisible();
  });
});
