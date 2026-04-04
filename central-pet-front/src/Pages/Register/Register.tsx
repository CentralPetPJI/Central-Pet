import { useEffect, useState, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { RegisterData } from '@/Models';
import { routes } from '@/routes';
import { useAuth } from '@/lib/auth';

type RegisterRole = RegisterData['role'];

/**
 * Extrai mensagem de erro amigável de diferentes tipos de erro.
 * Fornece feedback específico para erros de cadastro.
 */
function getErrorMessage(error: unknown): string {
  // Erro padrão do JavaScript
  if (error instanceof Error) {
    return error.message;
  }

  // Erro de requisição Axios
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as {
      response?: {
        status?: number;
        data?: {
          message?: string | string[];
          error?: string;
        };
      };
    };

    const status = axiosError.response?.status;
    const data = axiosError.response?.data;

    // Mensagens específicas por status HTTP
    if (status === 400) {
      const apiMessage = data?.message;
      if (apiMessage) {
        return Array.isArray(apiMessage) ? apiMessage.join(', ') : apiMessage;
      }
      return 'Dados inválidos. Verifique os campos e tente novamente.';
    }

    if (status === 409) {
      return 'Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.';
    }

    if (status === 429) {
      return 'Muitas tentativas de cadastro. Aguarde alguns minutos antes de tentar novamente.';
    }

    if (status === 500) {
      return 'Erro no servidor. Tente novamente em alguns instantes.';
    }

    if (status && status >= 500) {
      return 'Serviço temporariamente indisponível. Tente novamente mais tarde.';
    }

    // Tenta pegar mensagem da API
    const apiMessage = data?.message;
    if (apiMessage) {
      return Array.isArray(apiMessage) ? apiMessage.join(', ') : apiMessage;
    }
  }

  // Erro de rede (sem conexão)
  if (error && typeof error === 'object' && 'code' in error && error.code === 'ERR_NETWORK') {
    return 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.';
  }

  return 'Não foi possível criar sua conta. Tente novamente.';
}

/**
 * Formata CPF: 000.000.000-00
 */
function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

/**
 * Formata CNPJ: 00.000.000/0000-00
 */
function formatCnpj(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14);

  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

export default function Register() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, register } = useAuth();
  const [role, setRole] = useState<RegisterRole>('PESSOA_FISICA');
  const [formData, setFormData] = useState({
    fullName: '',
    documentValue: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(routes.home.path, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleDocumentChange = (event: ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    const formatted = role === 'ONG' ? formatCnpj(rawValue) : formatCpf(rawValue);
    setFormData((current) => ({ ...current, documentValue: formatted }));
  };

  const handleRoleChange = (newRole: RegisterRole) => {
    setRole(newRole);
    // Limpa o documento ao trocar o tipo de conta
    setFormData((current) => ({ ...current, documentValue: '' }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (formData.password !== formData.confirmPassword) {
      setFeedback('As senhas não coincidem.');
      return;
    }

    const sanitizedDocument = formData.documentValue.replace(/\D/g, '');
    const payload: RegisterData =
      role === 'ONG'
        ? {
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
            role,
            organizationName: formData.fullName,
            cnpj: sanitizedDocument,
          }
        : {
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
            role,
            cpf: sanitizedDocument,
          };

    setIsSubmitting(true);

    try {
      await register(payload);
      navigate(routes.home.path, { replace: true });
    } catch (error: unknown) {
      setFeedback(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="rounded-3xl border border-[#d9f7fb] bg-white px-6 py-10 text-center shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4fb8c5]">
            Preparando cadastro
          </p>
          <h1 className="mt-3 text-2xl font-extrabold text-slate-900">Carregando sua sessão</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl lg:grid-cols-[0.95fr_1.05fr]">
        <div className="order-2 p-8 sm:p-10 lg:order-1">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4fb8c5]">
              Criar conta
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900">
              Abra sua conta no Central-Pet
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Preencha os dados básicos e crie sua conta gratuita.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="register-full-name" className="text-sm font-semibold text-slate-700">
                {role === 'ONG' ? 'Nome da organização' : 'Nome completo'}
              </label>
              <input
                id="register-full-name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                type="text"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#6fe2f1] focus:bg-white focus:ring-2 focus:ring-[#d8f9fd]"
                placeholder={role === 'ONG' ? 'Nome da ONG' : 'Seu nome completo'}
                autoComplete="name"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="register-document" className="text-sm font-semibold text-slate-700">
                {role === 'ONG' ? 'CNPJ' : 'CPF'}
              </label>
              <input
                id="register-document"
                name="documentValue"
                value={formData.documentValue}
                onChange={handleDocumentChange}
                type="text"
                inputMode="numeric"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#6fe2f1] focus:bg-white focus:ring-2 focus:ring-[#d8f9fd]"
                placeholder={role === 'ONG' ? '00.000.000/0000-00' : '000.000.000-00'}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <span className="text-sm font-semibold text-slate-700">Tipo de conta</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('PESSOA_FISICA')}
                    className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                      role === 'PESSOA_FISICA'
                        ? 'border-[#6fe2f1] bg-[#ebfdff] text-slate-900'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Pessoa física
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('ONG')}
                    className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                      role === 'ONG'
                        ? 'border-[#6fe2f1] bg-[#ebfdff] text-slate-900'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    ONG
                  </button>
                </div>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="register-email" className="text-sm font-semibold text-slate-700">
                  E-mail
                </label>
                <input
                  id="register-email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#6fe2f1] focus:bg-white focus:ring-2 focus:ring-[#d8f9fd]"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="register-password" className="text-sm font-semibold text-slate-700">
                  Senha
                </label>
                <input
                  id="register-password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  type="password"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#6fe2f1] focus:bg-white focus:ring-2 focus:ring-[#d8f9fd]"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="register-confirm-password"
                  className="text-sm font-semibold text-slate-700"
                >
                  Confirmar senha
                </label>
                <input
                  id="register-confirm-password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  type="password"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#6fe2f1] focus:bg-white focus:ring-2 focus:ring-[#d8f9fd]"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            {feedback ? (
              <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{feedback}</p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-[#6fe2f1] px-4 py-3.5 text-sm font-bold text-slate-900 transition hover:bg-[#5ed8e6] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-200 pt-6 text-center text-sm text-slate-600">
            Já tem conta?{' '}
            <Link to={routes.login.path} className="font-bold text-[#4fb8c5] hover:underline">
              Entrar
            </Link>
          </div>
        </div>

        <div className="order-1 flex flex-col justify-between bg-gradient-to-br from-[#6fe2f1] via-[#c9f4fa] to-white p-8 text-slate-900 sm:p-10 lg:order-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-slate-700">
              Junte-se a nós
            </p>
            <h1 className="mt-4 max-w-md text-4xl font-black leading-tight">
              Faça parte da mudança na vida dos animais.
            </h1>
            <p className="mt-4 max-w-lg text-base text-slate-700">
              Crie sua conta gratuita e comece a ajudar pets abandonados a encontrarem um lar cheio
              de amor.
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/75 p-4 shadow-sm backdrop-blur">
              <p className="text-sm font-semibold text-slate-500">✨ Rápido e fácil</p>
              <p className="mt-1 font-bold text-slate-900">Cadastro em minutos</p>
            </div>
            <div className="rounded-2xl bg-white/75 p-4 shadow-sm backdrop-blur">
              <p className="text-sm font-semibold text-slate-500">🔒 Seguro</p>
              <p className="mt-1 font-bold text-slate-900">Seus dados protegidos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
