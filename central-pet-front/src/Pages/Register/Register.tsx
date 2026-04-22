import { useEffect, useState, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { RegisterData } from '@/Models';
import { routes } from '@/routes';
import { useAuth } from '@/lib/auth';
import { formatDocumentInput, sanitizeDocument } from '@/lib/formatters';
import { registerSchema, type RegisterFormValues } from '@/lib/validation/auth';

/**
 * Extrai mensagem de erro amigável de diferentes tipos de erro.
 * Fornece feedback específico para erros de cadastro.
 */
function getErrorMessage(error: unknown): string {
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

export default function Register() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, register: authRegister } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'PESSOA_FISICA',
      documentValue: '',
      acceptTerms: false,
    },
  });

  const role = watch('role');

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(routes.home.path, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Format document input (CPF/CNPJ) using helper to centralize logic
  const handleDocumentChange = (event: ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    const formatted = formatDocumentInput(rawValue, role);
    setValue('documentValue', formatted, { shouldValidate: true });
  };

  const handleRoleChange = (newRole: RegisterFormValues['role']) => {
    setValue('role', newRole, { shouldValidate: true });
    setValue('documentValue', '', { shouldValidate: true });
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setFeedback(null);

    const sanitizedDocument = sanitizeDocument(data.documentValue, data.role);
    const payload: RegisterData =
      data.role === 'ONG'
        ? {
            fullName: data.fullName,
            email: data.email,
            password: data.password,
            role: data.role,
            organizationName: data.fullName,
            cnpj: sanitizedDocument,
            acceptTerms: data.acceptTerms,
          }
        : {
            fullName: data.fullName,
            email: data.email,
            password: data.password,
            role: data.role,
            cpf: sanitizedDocument,
            acceptTerms: data.acceptTerms,
          };

    setIsSubmitting(true);

    try {
      await authRegister(payload);
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="space-y-2">
              <label htmlFor="register-full-name" className="text-sm font-semibold text-slate-700">
                {role === 'ONG' ? 'Nome da organização' : 'Nome completo'}
              </label>
              <input
                id="register-full-name"
                {...register('fullName')}
                type="text"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#6fe2f1] focus:bg-white focus:ring-2 focus:ring-[#d8f9fd]"
                placeholder={role === 'ONG' ? 'Nome da ONG' : 'Seu nome completo'}
                autoComplete="name"
              />
              {errors.fullName ? (
                <p className="mt-1 text-sm text-rose-700">{errors.fullName.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label htmlFor="register-document" className="text-sm font-semibold text-slate-700">
                {role === 'ONG' ? 'CNPJ' : 'CPF'}
              </label>
              <input
                id="register-document"
                {...register('documentValue', {
                  onChange: handleDocumentChange,
                })}
                type="text"
                inputMode="text"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#6fe2f1] focus:bg-white focus:ring-2 focus:ring-[#d8f9fd]"
                placeholder={role === 'ONG' ? '00.000.000/0000-00' : '000.000.000-00'}
              />
              {errors.documentValue ? (
                <p className="mt-1 text-sm text-rose-700">{errors.documentValue.message}</p>
              ) : null}
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
                  {...register('email')}
                  type="email"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#6fe2f1] focus:bg-white focus:ring-2 focus:ring-[#d8f9fd]"
                  placeholder="seu@email.com"
                  autoComplete="email"
                />
                {errors.email ? (
                  <p className="mt-1 text-sm text-rose-700">{errors.email.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label htmlFor="register-password" className="text-sm font-semibold text-slate-700">
                  Senha
                </label>
                <input
                  id="register-password"
                  {...register('password')}
                  type="password"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#6fe2f1] focus:bg-white focus:ring-2 focus:ring-[#d8f9fd]"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                {errors.password ? (
                  <p className="mt-1 text-sm text-rose-700">{errors.password.message}</p>
                ) : null}
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
                  {...register('confirmPassword')}
                  type="password"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#6fe2f1] focus:bg-white focus:ring-2 focus:ring-[#d8f9fd]"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                {errors.confirmPassword ? (
                  <p className="mt-1 text-sm text-rose-700">{errors.confirmPassword.message}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register('acceptTerms')}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-[#4fb8c5] focus:ring-[#4fb8c5]"
                />
                <span className="text-sm text-slate-600 leading-tight">
                  Eu li e aceito o{' '}
                  <Link
                    to={routes.termsOfResponsibility.path}
                    className="font-bold text-[#4fb8c5] hover:underline"
                    target="_blank"
                  >
                    Termo de Responsabilidade e Privacidade
                  </Link>
                  . Entendo que meus dados são protegidos e o compartilhamento só ocorre com meu
                  consentimento.
                </span>
              </label>
              {errors.acceptTerms ? (
                <p className="mt-1 text-sm text-rose-700">{errors.acceptTerms.message}</p>
              ) : null}
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
              Crie sua conta gratuita e comece a ajudar pets a encontrarem um lar cheio de amor.
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
