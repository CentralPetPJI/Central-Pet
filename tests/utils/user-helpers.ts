import { expect, type APIRequestContext, type Page } from "@playwright/test";

const API_BASE_URL = "http://localhost:3001/api";
const SENHA_PADRAO = "Senha123!";

export type UsuarioE2E = {
  fullName: string;
  email: string;
  password: string;
  cpf: string;
};

export type UsuarioCriadoE2E = {
  id: string;
  fullName: string;
  email: string;
  role: "PESSOA_FISICA" | "ONG";
  birthDate: string | null;
  cpf: string | null;
  organizationName: string | null;
  cnpj: string | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * Gera dados únicos de usuário para testes E2E
 */
export function gerarUsuarioUnico(prefixo: string): UsuarioE2E {
  const sufixo = `${Date.now()}${Math.floor(Math.random() * 1_000_000)}`;
  const cpf = sufixo.replace(/\D/g, "").padStart(11, "0").slice(-11);

  return {
    fullName: `Usuário ${prefixo} ${sufixo.slice(-6)}`,
    email: `${prefixo}.${sufixo}@example.com.br`,
    password: SENHA_PADRAO,
    cpf,
  };
}

/**
 * Cria usuário via API do backend
 */
export async function criarUsuarioViaApi(
  request: APIRequestContext,
  usuario: UsuarioE2E,
): Promise<UsuarioCriadoE2E> {
  const resposta = await request.post(`${API_BASE_URL}/users`, {
    data: {
      fullName: usuario.fullName,
      email: usuario.email,
      password: usuario.password,
      role: "PESSOA_FISICA",
      cpf: usuario.cpf,
    },
  });

  expect(resposta.ok()).toBeTruthy();
  const payload = (await resposta.json()) as { data: UsuarioCriadoE2E };
  return payload.data;
}

/**
 * Faz login no frontend via UI
 */
export async function fazerLogin(
  page: Page,
  usuario: UsuarioE2E,
): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(usuario.email);
  await page.getByLabel("Senha").fill(usuario.password);
  await page.getByRole("button", { name: "Entrar" }).click();

  // Aguardar redirecionamento para home após login
  await expect(page).toHaveURL("/");
}
