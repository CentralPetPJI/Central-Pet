import { expect, test, type APIRequestContext } from "@playwright/test";
import { softDeletePetsViaApi } from "../utils/pet-helpers";
import {
  criarUsuarioViaApi,
  fazerLoginViaApi,
  gerarUsuarioUnico,
} from "../utils/user-helpers";

const API_BASE_URL = "http://localhost:3001/api";

async function criarPetComFiltros(
  request: APIRequestContext,
  data: {
    name: string;
    species: "dog" | "cat";
    sex: "male" | "female";
    size: "small" | "medium" | "large";
  },
): Promise<string> {
  const resposta = await request.post(`${API_BASE_URL}/pets`, {
    data: {
      profilePhoto:
        "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=640",
      galleryPhotos: [],
      name: data.name,
      age: "ADULTO",
      species: data.species,
      breed: "SRD",
      sex: data.sex,
      size: data.size,
      microchipped: false,
      vaccinated: true,
      neutered: true,
      dewormed: true,
      needsHealthCare: false,
      physicalLimitation: false,
      visualLimitation: false,
      hearingLimitation: false,
      selectedPersonalities: [],
    },
  });

  expect(resposta.ok()).toBeTruthy();
  const payload = (await resposta.json()) as { data: { id: string } };
  return payload.data.id;
}

test.describe("busca de pets", () => {
  let petIdsCriados: string[] = [];

  test.afterEach(async ({ request }) => {
    await softDeletePetsViaApi(request, petIdsCriados);
    petIdsCriados = [];
  });

  test("redireciona pelo menu Procurar e aplica filtros na URL e resultados", async ({
    page,
    request,
  }) => {
    const usuario = gerarUsuarioUnico("pet-search-owner");
    await criarUsuarioViaApi(request, usuario);
    await fazerLoginViaApi(request, usuario);

    const nomeGatoPequeno = `Gato Pequeno ${Date.now()}`;
    const nomeCachorroGrande = `Cachorro Grande ${Date.now()}`;

    petIdsCriados.push(
      await criarPetComFiltros(request, {
        name: nomeGatoPequeno,
        species: "cat",
        sex: "female",
        size: "small",
      }),
    );
    petIdsCriados.push(
      await criarPetComFiltros(request, {
        name: nomeCachorroGrande,
        species: "dog",
        sex: "male",
        size: "large",
      }),
    );

    await page.goto("/");

    await page.getByRole("button", { name: "Pets" }).click();
    await page.getByRole("link", { name: "Procurar" }).click();

    await expect(page).toHaveURL("/buscar-pets");

    await page.getByLabel("Espécie").selectOption("CAT");
    await page.getByLabel("Porte").selectOption("SMALL");

    await expect(page).toHaveURL(/species=CAT/);
    await expect(page).toHaveURL(/size=SMALL/);
    await expect(page.getByRole("heading", { name: nomeGatoPequeno })).toBeVisible();
    await expect(page.getByRole("heading", { name: nomeCachorroGrande })).toHaveCount(0);
  });
});
