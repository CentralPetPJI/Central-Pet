import { expect, type APIRequestContext } from "@playwright/test";
import {
  criarUsuarioViaApi,
  fazerLoginViaApi,
  gerarUsuarioUnico,
  type UsuarioCriadoE2E,
} from "./user-helpers";

const API_BASE_URL = "http://localhost:3001/api";

type CriarPetsViaApiOpcoes = {
  quantity: number;
  names?: string[];
  owner?: UsuarioCriadoE2E & { password?: string }; // Adicionado password opcional
};

export type PetCriadoE2E = {
  id: string;
  name: string;
  responsibleUserId: string;
};

/**
 * Cria múltiplos pets via API para cenários E2E do Playwright.
 * Caso nenhum owner seja informado, cria automaticamente um usuário responsável.
 */
export async function criarPetsViaApi(
  request: APIRequestContext,
  opcoes: CriarPetsViaApiOpcoes,
): Promise<PetCriadoE2E[]> {
  if (opcoes.quantity < 1) {
    throw new Error("quantity deve ser maior que zero");
  }

  let owner = opcoes.owner;

  if (!owner) {
    const dadosUsuario = gerarUsuarioUnico("pet-seed-owner");
    const criado = await criarUsuarioViaApi(request, dadosUsuario);
    owner = { ...criado, password: dadosUsuario.password };
  }

  // Se temos a senha, fazemos login para garantir que os cookies de sessão real estão no request
  if (owner.password) {
    await fazerLoginViaApi(request, {
      email: owner.email,
      password: owner.password,
      fullName: owner.fullName,
      cpf: owner.cpf || "",
    });
  }

  const pets: PetCriadoE2E[] = [];

  for (let index = 0; index < opcoes.quantity; index += 1) {
    const timestamp = Date.now();
    const fallbackName = `Pet Seed ${timestamp}-${index + 1}`;
    const petName = opcoes.names?.[index] ?? fallbackName;

    const resposta = await request.post(`${API_BASE_URL}/pets`, {
      data: {
        profilePhoto:
          "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=640",
        galleryPhotos: [],
        name: petName,
        age: "2 anos",
        species: "dog",
        breed: "SRD",
        sex: "male",
        size: "medium",
        microchipped: false,
        tutor: owner.fullName,
        shelter: "Abrigo E2E",
        city: "Sao Paulo",
        state: "SP",
        contact: "(11) 98888-0000",
        vaccinated: true,
        neutered: true,
        dewormed: true,
        needsHealthCare: false,
        physicalLimitation: false,
        visualLimitation: false,
        hearingLimitation: false,
        sourceType: owner.role,
        sourceName: owner.organizationName || owner.fullName,
        selectedPersonalities: [],
      },
    });

    expect(resposta.ok()).toBeTruthy();
    const payload = (await resposta.json()) as {
      data: { id: string; name: string };
    };

    pets.push({
      id: payload.data.id,
      name: payload.data.name,
      responsibleUserId: owner.id,
    });
  }

  return pets;
}

/**
 * Aplica soft delete nos pets informados para isolar os testes.
 */
export async function softDeletePetsViaApi(
  request: APIRequestContext,
  petIds: string[],
): Promise<void> {
  for (let index = 0; index < petIds.length; index += 1) {
    const petId = petIds[index];

    const resposta = await request.delete(`${API_BASE_URL}/pets/${petId}`);
    // Aceita 200 (sucesso) ou 404 (pet não encontrado).
    // Se retornar 401 ou 403, o teste deve falhar pois a sessão deveria estar ativa.
    expect([200, 404]).toContain(resposta.status());
  }
}
