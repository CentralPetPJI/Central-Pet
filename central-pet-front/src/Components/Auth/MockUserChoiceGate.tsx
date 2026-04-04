import { useEffect } from 'react';
import { Building2, UserRound } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { isDevelopment } from '@/lib/dev-mode';

const roleCardCopy = {
  PESSOA_FISICA: {
    label: 'Pessoa física',
    description: 'Explorar pets, favoritar e acompanhar seus pets cadastrados.',
    icon: <UserRound className="h-5 w-5" />,
  },
  ONG: {
    label: 'ONG',
    description: 'Gerenciar pets, solicitações e publicações da instituição.',
    icon: <Building2 className="h-5 w-5" />,
  },
} as const;

/**
 * Mostra uma escolha inicial de perfil quando nenhum usuário foi selecionado.
 */
export function MockUserChoiceGate() {
  const { currentUser, isLoading, users, selectUser } = useAuth();
  const dev = isDevelopment();

  useEffect(() => {
    if (dev || currentUser) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [currentUser, dev]);

  if (dev || isLoading || currentUser) {
    return null;
  }

  const personUser = users.find((user) => user.role === 'PESSOA_FISICA');
  const ongUser = users.find((user) => user.role === 'ONG');

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-2xl ring-1 ring-slate-200">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
          Bem-vindo ao Pet Central
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Você é?</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Escolha como quer entrar agora. Depois da selecao, o site libera as funcoes
          correspondentes ao perfil escolhido.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            {
              ...roleCardCopy.PESSOA_FISICA,
              user: personUser,
            },
            {
              ...roleCardCopy.ONG,
              user: ongUser,
            },
          ].map((card) => (
            <button
              key={card.label}
              type="button"
              disabled={!card.user}
              onClick={() => {
                if (!card.user) {
                  return;
                }

                void selectUser(card.user.id);
              }}
              className="flex min-h-44 flex-col items-start justify-between rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-cyan-700 shadow-sm ring-1 ring-slate-200">
                  {card.icon}
                </span>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{card.label}</h2>
                  <p className="text-sm text-slate-500">
                    {card.user?.fullName ?? 'Perfil indisponivel'}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{card.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
