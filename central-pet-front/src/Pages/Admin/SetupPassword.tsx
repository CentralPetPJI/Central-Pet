import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { routes } from '@/routes';
import { Lock, ShieldCheck, AlertCircle } from 'lucide-react';

export default function SetupPassword() {
  const { currentUser, logout, syncCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (newPassword !== confirmPassword) {
      setErrorMessage('A nova senha e a confirmação não coincidem.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      await api.patch('/users/me/password', {
        currentPassword,
        newPassword,
      });

      // Atualiza o estado de autenticação antes de redirecionar para evitar que o AuthGuard
      // considere ainda que o usuário precise trocar a senha e redirecione de volta.
      try {
        if (currentUser) {
          syncCurrentUser({ ...currentUser, mustChangePassword: false });
        }
      } catch {
        // non-blocking: se falhar, não impede a continuação do fluxo
      }

      setSuccessMessage('Senha atualizada com sucesso! Você será redirecionado...');

      // Delay redirect to show success message
      setTimeout(() => {
        navigate(routes.home.path);
      }, 2000);
    } catch (_error) {
      const message = 'Não foi possível atualizar a senha.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl">
        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-8 text-white text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Configurar Nova Senha</h1>
          <p className="mt-2 text-cyan-50 text-sm font-medium">
            Olá, {currentUser?.fullName}! Para sua segurança, você precisa definir uma senha
            permanente.
          </p>
        </div>

        <div className="p-8 sm:p-10">
          {successMessage ? (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-center animate-in zoom-in-95">
              <p className="text-sm font-bold text-emerald-800">{successMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Senha Atual (Temporária)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-50"
                    placeholder="Sua senha temporária"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Nova Senha Permanente
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-50"
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-50"
                    placeholder="Repita a nova senha"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="flex items-start gap-3 rounded-2xl bg-rose-50 border border-rose-100 p-4 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={18} className="text-rose-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-rose-800 leading-relaxed">{errorMessage}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-2xl bg-cyan-600 py-4 text-sm font-black text-white transition hover:bg-cyan-700 disabled:opacity-50 shadow-lg shadow-cyan-100"
              >
                {isLoading ? 'Atualizando...' : 'Definir Senha Permanente'}
              </button>

              <button
                type="button"
                onClick={() => logout().then(() => navigate(routes.login.path))}
                className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 transition"
              >
                Sair e configurar depois
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
