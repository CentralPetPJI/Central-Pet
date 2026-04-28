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
  const maxRetries = 3;
  let attempt = 0;
  let lastError: unknown = null;

  while (attempt < maxRetries) {
    try {
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
    } catch (err: unknown) {
      lastError = err;
      const message =
        err && typeof err === "object" && "message" in err
          ? (err as any).message
          : "";
      // Retry on transient connection errors
      if (
        typeof message === "string" &&
        (message.includes("ECONNRESET") ||
          message.includes("ECONNREFUSED") ||
          message.includes("socket hang up"))
      ) {
        attempt += 1;
        const backoff = 200 * attempt;
        // small delay before retry
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, backoff));
        continue;
      }
      // Non-transient error, rethrow
      throw err;
    }
  }

  // If we exhausted retries, throw last error
  throw lastError;
}

/**
 * Faz login via API e retorna os cookies de sessão
 */
export async function fazerLoginViaApi(
  request: APIRequestContext,
  usuario: UsuarioE2E,
): Promise<void> {
  const resposta = await request.post(`${API_BASE_URL}/auth/login`, {
    data: {
      email: usuario.email,
      password: usuario.password,
    },
  });

  expect(resposta.ok()).toBeTruthy();
}

/**
   Cria usuario e faz login via API
  */
export async function criarUsuarioEFazerLoginViaApi(
  request: APIRequestContext,
  usuario: UsuarioE2E,
): Promise<UsuarioCriadoE2E> {
  const criado = await criarUsuarioViaApi(request, usuario);
  await fazerLoginViaApi(request, usuario);
  return criado;
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
