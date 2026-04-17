import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatDocument, formatState, brazilianStates } from '@/lib/formatters';
import FormSelect from '@/Components/Form/FormSelect';
import { routes } from '@/routes';
import type { UserProfile } from '@/Models/user';

export default function ProfilePage() {
  const { currentUser, isLoading: isAuthLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});
  const [deleteConfirm, setDeleteConfirm] = useState(false);

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
      setIsEditing(false);

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

      // Clear auth context and redirect to login
      // This would depend on how auth context handles logout
      window.location.href = '/login';
    } catch (_error) {
      setErrorMessage('Não foi possível excluir a conta.');
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
    <section className="w-full px-1 pb-8 pt-4 lg:px-0 lg:pt-5">
      <div className="mb-6 flex flex-col gap-3 rounded-3xl bg-linear-to-r from-emerald-50 via-white to-cyan-50 p-5 shadow-sm ring-1 ring-slate-200 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Meu perfil
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{profile.fullName}</h1>
        </div>

        {!isEditing && (
          <Link
            to={routes.pets.mine.path}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
          >
            Ver meus pets ({profile.petsCount})
          </Link>
        )}

        {!isEditing && !deleteConfirm && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                // TODO: Implement logout
                window.location.href = '/login';
              }}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
            >
              Sair
            </button>

            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center justify-center rounded-full bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
            >
              Editar perfil
            </button>
          </div>
        )}

        {isEditing && (
          <button
            onClick={() => setDeleteConfirm(true)}
            className="ml-2 inline-flex items-center justify-center rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            Excluir conta
          </button>
        )}
      </div>

      {deleteConfirm && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Excluir conta</h2>
          <p className="mb-4 text-sm text-slate-600">
            Tem certeza que deseja excluir sua conta? Esta ação é irreversível e removerá todos os
            seus pets cadastrados.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteConfirm(false)}
              className="flex-1 rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteAccount}
              className="flex-1 rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Excluir conta
            </button>
          </div>
        </div>
      )}

      {!isEditing && !deleteConfirm && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Nome completo
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">{profile.fullName}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              E-mail
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">{profile.email}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Tipo de conta
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {profile.role === 'PESSOA_FISICA' ? 'Pessoa Física' : 'ONG'}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Data de nascimento
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {profile.birthDate
                ? new Date(profile.birthDate).toLocaleDateString('pt-BR')
                : 'Não informada'}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              CPF/CNPJ
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {formatDocument(
                profile.role === 'PESSOA_FISICA' ? profile.cpf : profile.cnpj,
                profile.role,
              ) || 'Não informado'}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Organização
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {profile.organizationName || 'Não informada'}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Cidade
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {profile.city || 'Não informada'}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Estado
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {formatState(profile.state) || 'Não informado'}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Membro desde
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {new Date(profile.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Pets cadastrados
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">{profile.petsCount}</p>
          </div>
        </div>
      )}

      {isEditing && !deleteConfirm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdateProfile();
          }}
          className="space-y-6"
        >
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Nome completo
            </p>
            <input
              type="text"
              value={editForm.fullName || ''}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Digite seu nome completo"
            />
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Data de nascimento
            </p>
            <input
              type="date"
              value={editForm.birthDate || ''}
              onChange={(e) => handleInputChange('birthDate', e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Cidade
            </p>
            <input
              type="text"
              value={editForm.city || ''}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Digite sua cidade"
            />
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Estado
            </p>
            <FormSelect
              value={editForm.state || ''}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className="mt-1"
            >
              <option value="">Selecione</option>
              {brazilianStates.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </FormSelect>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Nome da organização
            </p>
            <input
              type="text"
              value={editForm.organizationName || ''}
              onChange={(e) => handleInputChange('organizationName', e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Digite o nome da organização (se aplicável)"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 rounded-full bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
