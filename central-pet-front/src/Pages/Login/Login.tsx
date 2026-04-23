import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { routes } from '@/routes';
import { useAuth } from '@/lib/auth';
import { loginSchema, type LoginFormData } from '@/lib/validation/auth';

type LoginLocationState = {
  registered?: boolean;
  email?: string;
};

function getErrorMessage(error: unknown): string {
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
    if (status === 401) {
      const apiMessage = data?.message;
      if (typeof apiMessage === 'string' && apiMessage.includes('desativada')) {
        return apiMessage;
      }
      return 'E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.';
    }

    if (status === 429) {
      return 'Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.';
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

  return 'Não foi possível entrar. Verifique suas credenciais e tente novamente.';
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LoginLocationState | null;
  const { currentUser, isAuthenticated, isLoading, login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(
    locationState?.registered
      ? `Cadastro concluído para ${locationState.email}. Faça login para continuar.`
      : null,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: locationState?.email ?? '',
      password: '',
    },
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(routes.home.path, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setFeedback(null);
    try {
      await login(data);
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
            Autenticando
          </p>
          <h1 className="mt-3 text-2xl font-extrabold text-slate-900">Carregando sua sessão</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-between bg-gradient-to-br from-[#6fe2f1] via-[#c9f4fa] to-white p-8 text-slate-900 sm:p-10">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-slate-700">
              {import.meta.env.VITE_SITE_NAME ?? 'Centrau Pet'}
            </p>
            <h1 className="mt-4 max-w-md text-4xl font-black leading-tight">
              Entre para continuar ajudando animais.
            </h1>
            <p className="mt-4 max-w-lg text-base text-slate-700">
              Acesse sua conta para gerenciar adoções, denúncias e acompanhar os pets cadastrados.
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/75 p-4 shadow-sm backdrop-blur">
              <p className="text-sm font-semibold text-slate-500">🐶 Adote um pet</p>
              <p className="mt-1 font-bold text-slate-900">Encontre seu companheiro</p>
            </div>
            <div className="rounded-2xl bg-white/75 p-4 shadow-sm backdrop-blur">
              <p className="text-sm font-semibold text-slate-500">🏠 Cadastre animais</p>
              <p className="mt-1 font-bold text-slate-900">Ajude quem precisa de lar</p>
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-10">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4fb8c5]">
              Acessar conta
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900">Bem-vindo de volta</h2>
            <p className="mt-2 text-sm text-slate-500">
              {currentUser
                ? `Você já está conectado como ${currentUser.fullName}.`
                : 'Entre com suas credenciais para continuar.'}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="space-y-2">
              <label htmlFor="login-email" className="text-sm font-semibold text-slate-700">
                E-mail
              </label>
              <input
                id="login-email"
                {...register('email')}
                type="email"
                className="input-standard"
                placeholder="seu@email.com"
                autoComplete="email"
              />
              {errors.email ? (
                <p className="mt-1 text-sm text-rose-700">{errors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label htmlFor="login-password" className="text-sm font-semibold text-slate-700">
                Senha
              </label>
              <input
                id="login-password"
                {...register('password')}
                type="password"
                className="input-standard"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {errors.password ? (
                <p className="mt-1 text-sm text-rose-700">{errors.password.message}</p>
              ) : null}
            </div>

            {feedback ? (
              <p
                className={`rounded-2xl px-4 py-3 text-sm ${
                  locationState?.registered
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {feedback}
              </p>
            ) : null}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-200 pt-6 text-center text-sm text-slate-600">
            Ainda não tem conta?{' '}
            <Link to={routes.register.path} className="font-bold text-[#4fb8c5] hover:underline">
              Cadastre-se
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
