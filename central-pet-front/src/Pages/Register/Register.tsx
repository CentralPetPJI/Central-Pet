import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { routes } from '@/routes';

const Register = () => {
  const navigate = useNavigate();
  const [isOng, setIsOng] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    documento: '',
    email: '',
    senha: '',
    confirmarSenha: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFinalizar = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (formData.senha !== formData.confirmarSenha) {
      setFeedback('As senhas não coincidem.');
      return;
    }

    setIsSubmitting(true);

    try {
      const sanitizedDocument = formData.documento.replace(/\D/g, '');

      await api.post('/users', {
        fullName: formData.nome,
        email: formData.email,
        password: formData.senha,
        role: isOng ? 'ONG' : 'ADOTANTE',
        organizationName: isOng ? formData.nome : undefined,
        cpf: isOng ? undefined : sanitizedDocument,
        cnpj: isOng ? sanitizedDocument : undefined,
      });

      navigate(routes.login.path, {
        state: { registered: true, email: formData.email },
      });
    } catch (error: unknown) {
      let message = 'Erro ao conectar com o servidor.';

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
    <div className="flex items-center justify-center w-full min-h-[75vh] py-10 bg-slate-100">
      <div className="bg-slate-50 p-6 rounded-3xl shadow-2xl w-full max-w-[650px] border border-slate-200">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-slate-800">Criar Conta 🐾</h2>
          <p className="text-sm text-slate-500 font-medium">Rápido e fácil!</p>
        </div>

        <form
          onSubmit={handleFinalizar}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
        >
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-600 ml-1">
              {isOng ? 'Nome da Instituição' : 'Nome Completo'}
            </label>
            <input
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              type="text"
              className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-300 outline-none"
              placeholder={isOng ? 'Nome da instituição' : 'Seu nome'}
              required
            />
          </div>

          <div className="flex items-end md:justify-end">
            <label className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isOng}
                onChange={(e) => setIsOng(e.target.checked)}
                className="h-4 w-4 accent-[#6fe2f1]"
              />
              Sou uma ONG (usar CNPJ)
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 ml-1">{isOng ? 'CNPJ' : 'CPF'}</label>
            <input
              name="documento"
              value={formData.documento}
              onChange={handleChange}
              type="text"
              className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-300 outline-none"
              placeholder={isOng ? '00.000.000/0000-00' : '000.000.000-00'}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 ml-1">E-mail</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-300 outline-none"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Senha</label>
            <input
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              type="password"
              className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-300 outline-none"
              placeholder="••••••••"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Confirmar Senha</label>
            <input
              name="confirmarSenha"
              value={formData.confirmarSenha}
              onChange={handleChange}
              type="password"
              className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-300 outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          {feedback ? <p className="md:col-span-2 text-sm text-red-600">{feedback}</p> : null}

          <div className="md:col-span-2 flex justify-center mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-10 py-3 bg-[#6fe2f1] hover:bg-[#5bc8d6] text-slate-900 font-black rounded-2xl shadow-lg transition-all active:scale-95"
            >
              {isSubmitting ? 'CRIANDO CONTA...' : 'FINALIZAR CADASTRO'}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center border-t border-slate-200 pt-6">
          <p className="text-slate-600">
            Já tem conta?{' '}
            <Link to={routes.login.path} className="text-[#5bc8d6] font-bold hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
