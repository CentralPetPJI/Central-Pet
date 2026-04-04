import { expect, test, type APIRequestContext } from '@playwright/test';

const API_BASE_URL = 'http://localhost:3000/api';
const SENHA_PADRAO = 'Senha123!';

type UsuarioE2E = {
  fullName: string;
  email: string;
  password: string;
  cpf: string;
};

function gerarUsuarioUnico(prefixo: string): UsuarioE2E {
  const sufixo = `${Date.now()}${Math.floor(Math.random() * 1_000_000)}`;
  const cpf = sufixo.replace(/\D/g, '').padStart(11, '0').slice(-11);

  return {
    fullName: `Usuário ${prefixo} ${sufixo.slice(-6)}`,
    email: `${prefixo}.${sufixo}@example.com`,
    password: SENHA_PADRAO,
    cpf,
  };
}

async function criarUsuarioViaApi(request: APIRequestContext, usuario: UsuarioE2E): Promise<void> {
  const resposta = await request.post(`${API_BASE_URL}/users`, {
    data: {
      fullName: usuario.fullName,
      email: usuario.email,
      password: usuario.password,
      role: 'PESSOA_FISICA',
      cpf: usuario.cpf,
    },
  });

  expect(resposta.ok()).toBeTruthy();
}

test.describe('Fluxo de autenticação', () => {
  test('deve autenticar com sucesso usando credenciais válidas', async ({ page, request }) => {
    const usuario = gerarUsuarioUnico('login-sucesso');
    await criarUsuarioViaApi(request, usuario);

    await page.goto('/login');

    await page.getByLabel('E-mail').fill(usuario.email);
    await page.getByLabel('Senha').fill(usuario.password);
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('button', { name: 'Menu do usuário' })).toBeVisible();
  });

  test('deve exibir feedback ao falhar login com credenciais inválidas', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('E-mail').fill(`invalido.${Date.now()}@example.com`);
    await page.getByLabel('Senha').fill('senha-incorreta');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByText('E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.'),
    ).toBeVisible();
  });

  test('deve registrar conta com sucesso e entrar automaticamente', async ({ page }) => {
    const usuario = gerarUsuarioUnico('registro-sucesso');

    await page.goto('/register');

    await page.getByLabel('Nome completo').fill(usuario.fullName);
    await page.getByLabel('CPF').fill(usuario.cpf);
    await page.getByLabel('E-mail').fill(usuario.email);
    await page.getByLabel('Senha', { exact: true }).fill(usuario.password);
    await page.getByLabel('Confirmar senha', { exact: true }).fill(usuario.password);
    await page.getByRole('button', { name: 'Criar conta' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('button', { name: 'Menu do usuário' })).toBeVisible();
  });

  test('deve impedir registro quando as senhas não conferem', async ({ page }) => {
    const usuario = gerarUsuarioUnico('registro-falha');

    await page.goto('/register');

    await page.getByLabel('Nome completo').fill(usuario.fullName);
    await page.getByLabel('CPF').fill(usuario.cpf);
    await page.getByLabel('E-mail').fill(usuario.email);
    await page.getByLabel('Senha', { exact: true }).fill(usuario.password);
    await page.getByLabel('Confirmar senha', { exact: true }).fill('SenhaDiferente123!');
    await page.getByRole('button', { name: 'Criar conta' }).click();

    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByText('As senhas não coincidem.')).toBeVisible();
  });
});
