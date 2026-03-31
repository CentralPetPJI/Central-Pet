import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { routes } from '@/routes';

type LoginLocationState = {
  registered?: boolean;
  email?: string;
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LoginLocationState | null;
  const { refreshAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(
    locationState?.registered
      ? `Cadastro concluído para ${locationState.email}. Faça login para continuar.`
      : null,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      await api.post('/auth/login', {
        email,
        password,
      });

      await refreshAuth();
      navigate(routes.home.path);
    } catch (error: unknown) {
      let message = 'Erro desconhecido';

      if (error instanceof Error) {
        message = error.message;
      }

      if (typeof error === 'object' && error !== null && 'response' in error) {
        const err = error as {
          response?: {
            data?: {
              message?: string | string[];
            };
          };
        };

        const apiMessage = err.response?.data?.message;

        if (apiMessage) {
          message = Array.isArray(apiMessage) ? apiMessage.join(', ') : apiMessage;
        }
      }

      setFeedback(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full min-h-[50vh] mt-10">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-[450px] border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-800">Bem-vindo! 🐾</h2>
          <p className="text-gray-500 mt-2">Acesse sua conta no Pet Central</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-600 ml-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#6fe2f1] focus:ring-2 focus:ring-[#6fe2f1] outline-none transition-all"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-600 ml-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#6fe2f1] focus:ring-2 focus:ring-[#6fe2f1] outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {feedback ? (
            <p
              className={`text-sm ${
                locationState?.registered ? 'text-emerald-700' : 'text-red-600'
              }`}
            >
              {feedback}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 mt-2 bg-[#6fe2f1] hover:bg-[#5bc8d6] text-gray-800 font-bold rounded-xl shadow-lg transform active:scale-95 transition-all"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-gray-600">
            Ainda não tem conta?{' '}
            <Link to={routes.register.path} className="text-[#5bc8d6] font-bold hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
