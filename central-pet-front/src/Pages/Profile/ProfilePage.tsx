import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatDocument, brazilianStates } from '@/lib/formatters';
import FormSelect from '@/Components/Form/FormSelect';
import { routes } from '@/routes';
import type { UserProfile } from '@/Models/user';

export default function ProfilePage() {
  const { currentUser, isLoading: isAuthLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const editableKeys: (keyof UserProfile)[] = [
    'fullName',
    'birthDate',
    'city',
    'state',
    'organizationName',
  ];

  const hasChanges = !!(
    profile &&
    editableKeys.some(
      (k) => String(editForm[k] ?? '') !== String((profile as UserProfile)[k] ?? ''),
    )
  );

  const resetEditForm = () => {
    if (!profile) return;
    setEditForm({
      fullName: profile.fullName,
      birthDate: profile.birthDate ?? '',
      city: profile.city ?? '',
      state: profile.state ?? '',
      organizationName: profile.organizationName ?? '',
    });
  };

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (isAuthLoading) {
        return;
      }

      if (!currentUser?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await api.get<{ data: UserProfile }>('/users/me');

        if (!isMounted) {
          return;
        }

        setProfile(response.data.data);
        setEditForm({
          fullName: response.data.data.fullName,
          birthDate: response.data.data.birthDate,
          city: response.data.data.city,
          state: response.data.data.state,
          organizationName: response.data.data.organizationName,
        });
      } catch (_error) {
        if (!isMounted) {
          return;
        }
        setErrorMessage('Não foi possível carregar o perfil.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.id, isAuthLoading]);

  const handleInputChange = (field: keyof Partial<UserProfile>, value: string | undefined) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value === '' ? undefined : value,
    }));
  };

  const handleUpdateProfile = async () => {
    if (!profile || !currentUser?.id) return;

    try {
      const response = await api.patch<{ data: UserProfile }>(`/users/me`, editForm);

      setProfile(response.data.data);

      // Update auth context if needed (though currentUser may not need update)
      // This would depend on how auth context is implemented
    } catch (_error) {
      setErrorMessage('Não foi possível atualizar o perfil.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser?.id) return;

    try {
      await api.delete(`/users/me`);

      // Backend performs soft-delete cascade — show user-friendly message
      setDeleteConfirm(false);
      setSuccessMessage(
        'Sua conta foi desativada. Seus dados serão mantidos por 90 dias para fins de auditoria; após esse período serão removidos permanentemente.',
      );

      // Redirect to login after short delay so user sees the message
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (_error) {
      setErrorMessage('Não foi possível desativar a conta. Tente novamente mais tarde.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full border-4 border-b-cyan-600 w-12 h-12"></div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">
          {errorMessage}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Nenhum perfil encontrado.</p>
          <Link
            to={routes.login.path}
            className="mt-4 inline-flex items-center justify-center rounded-full bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
          >
            Fazer login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full px-4 pb-8 pt-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-4">
          <div
            className="h-16 w-16 flex-shrink-0 flex items-center justify-center rounded-full bg-cyan-600 text-white text-lg font-semibold"
            aria-hidden
          >
            {profile.fullName
              ? profile.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()
              : ''}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-slate-900 truncate">{profile.fullName}</h1>
            <p className="mt-1 text-sm text-slate-500 truncate">{profile.email}</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={routes.pets.mine.path}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Ver meus pets ({profile.petsCount})
            </Link>

            <button
              onClick={() => {
                window.location.href = '/login';
              }}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Sair
            </button>

            <button
              onClick={() => setDeleteConfirm(true)}
              className="ml-2 rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
            >
              Desativar conta
            </button>

            {hasChanges && (
              <>
                <button
                  onClick={resetEditForm}
                  className="ml-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Reverter
                </button>

                <button
                  onClick={handleUpdateProfile}
                  disabled={isLoading}
                  className="ml-2 rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-50"
                >
                  {isLoading ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </>
            )}
          </div>
        </div>

        {successMessage && (
          <div className="mt-4 rounded-md bg-emerald-50 border border-emerald-100 p-3 text-emerald-800">
            {successMessage}
          </div>
        )}

        {deleteConfirm && (
          <div className="mt-6 rounded-lg bg-rose-50 p-4">
            <h2 className="text-lg font-semibold text-slate-900">Desativar conta</h2>
            <p className="mt-2 text-sm text-slate-600">
              Ao desativar sua conta, seus dados e pets serão desativados e mantidos por 90 dias
              para fins de auditoria; após esse período serão removidos permanentemente. Dentro
              desses 90 dias é possível reativar a conta entrando em contato com o suporte.
            </p>
            <div className="mt-3 flex gap-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
              >
                Desativar conta
              </button>
            </div>
          </div>
        )}

        {!deleteConfirm && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-white p-4 shadow">
              <p className="text-xs text-slate-400">Nome completo</p>
              <input
                type="text"
                value={editForm.fullName ?? ''}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Digite seu nome completo"
              />
            </div>

            <div className="rounded-lg bg-white p-4 shadow">
              <p className="text-xs text-slate-400">E-mail</p>
              <p className="mt-1 text-lg font-medium text-slate-900">{profile.email}</p>
            </div>

            <div className="rounded-lg bg-white p-4 shadow">
              <p className="text-xs text-slate-400">Tipo de conta</p>
              <p className="mt-1 text-lg font-medium text-slate-900">
                {profile.role === 'PESSOA_FISICA' ? 'Pessoa Física' : 'ONG'}
              </p>
            </div>

            <div className="rounded-lg bg-white p-4 shadow">
              <p className="text-xs text-slate-400">Data de nascimento</p>
              <input
                type="date"
                value={editForm.birthDate ?? ''}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="rounded-lg bg-white p-4 shadow">
              <p className="text-xs text-slate-400">CPF/CNPJ</p>
              <p className="mt-1 text-lg font-medium text-slate-900">
                {formatDocument(
                  profile.role === 'PESSOA_FISICA' ? profile.cpf : profile.cnpj,
                  profile.role,
                ) || 'Não informado'}
              </p>
            </div>

            <div className="rounded-lg bg-white p-4 shadow">
              <p className="text-xs text-slate-400">Organização</p>
              <input
                type="text"
                value={editForm.organizationName ?? ''}
                onChange={(e) => handleInputChange('organizationName', e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Nome da organização (opcional)"
              />
            </div>

            <div className="rounded-lg bg-white p-4 shadow">
              <p className="text-xs text-slate-400">Cidade</p>
              <input
                type="text"
                value={editForm.city ?? ''}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Digite sua cidade"
              />
            </div>

            <div className="rounded-lg bg-white p-4 shadow">
              <p className="text-xs text-slate-400">Estado</p>
              <FormSelect
                value={editForm.state || ''}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="mt-1 w-full"
              >
                <option value="">Selecione</option>
                {brazilianStates.map((state) => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </FormSelect>
            </div>

            <div className="rounded-lg bg-white p-4 shadow">
              <p className="text-xs text-slate-400">Cadastro na plataforma</p>
              <p
                className="mt-1 text-lg font-medium text-slate-900"
                title="Data de cadastro na plataforma"
              >
                {new Date(profile.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>

            <div className="rounded-lg bg-white p-4 shadow">
              <p className="text-xs text-slate-400">Pets cadastrados</p>
              <p className="mt-1 text-lg font-medium text-slate-900">{profile.petsCount}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
