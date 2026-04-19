import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatDocument, brazilianStates, formatDocumentInput } from '@/lib/formatters';
import FormSelect from '@/Components/Form/FormSelect';
import { routes } from '@/routes';
import type { UserProfile } from '@/Models/user';
import { UserX, Store, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { userProfileSchema, type UserProfileFormData } from '@/lib/validation/profile';
import {
  useMyInstitution,
  createInstitution,
  updateInstitution,
  deleteMyInstitution,
} from '@/lib/institutions/use-institutions';
import { institutionSchema, type InstitutionFormData } from '@/lib/validation/institution';

export default function ProfilePage() {
  const { currentUser, isLoading: isAuthLoading, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const logoutTimerRef = useRef<number | null>(null);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors, isDirty: profileIsDirty },
  } = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
  });

  // Institution State
  const { institution, refetch: refetchInst } = useMyInstitution();
  const [isSavingInst, setIsSavingInst] = useState(false);
  const [isCreatingInst, setIsCreatingInst] = useState(false);
  const [isDeletingInst, setIsDeletingInst] = useState(false);

  const {
    register: registerInst,
    handleSubmit: handleSubmitInst,
    reset: resetInst,
    getValues: getInstValues,
    formState: { errors: instErrors },
  } = useForm<InstitutionFormData>({
    resolver: zodResolver(institutionSchema),
  });

  const handleDeleteInstitution = async () => {
    if (
      !confirm(
        'Tem certeza que deseja desativar sua página de abrigo? Esta ação não pode ser desfeita facilmente.',
      )
    )
      return;

    setIsDeletingInst(true);
    try {
      await deleteMyInstitution();
      await refetchInst();
      setSuccessMessage('Página de abrigo desativada com sucesso.');
    } catch (_err) {
      setErrorMessage('Erro ao desativar página.');
    } finally {
      setIsDeletingInst(false);
    }
  };

  useEffect(() => {
    if (institution) {
      resetInst({
        name: institution.name,
        description: institution.description ?? '',
        cnpj: institution.cnpj ?? '',
        instagram: institution.instagram ?? '',
        website: institution.website ?? '',
        foundedAt: institution.foundedAt ? institution.foundedAt.split('T')[0] : '',
      });
    } else if (profile && !institution) {
      resetInst({
        name: profile.organizationName || profile.fullName,
        cnpj: profile.cnpj || '',
      });
    }
  }, [institution, profile, resetInst]);

  const profileToFormData = (p: UserProfile): UserProfileFormData => ({
    fullName: p.fullName,
    birthDate: p.birthDate ?? '',
    city: p.city ?? '',
    state: p.state ?? '',
    phone: p.phone ?? '',
    mobile: p.mobile ?? '',
  });

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

        const data = response.data.data;
        setProfile(data);
        resetProfile(profileToFormData(data));
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
  }, [currentUser?.id, isAuthLoading, resetProfile]);

  const handleUpdateProfile = async (data: UserProfileFormData) => {
    if (!profile || !currentUser?.id) return;

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await api.patch<{ data: UserProfile }>(`/users/me`, data);
      const updatedProfile = response.data.data;
      setProfile(updatedProfile);
      resetProfile(profileToFormData(updatedProfile));
      setSuccessMessage('Perfil atualizado com sucesso!');
    } catch (_error) {
      setErrorMessage('Não foi possível atualizar o perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveInstitution = async (data: InstitutionFormData) => {
    setIsSavingInst(true);
    try {
      // sanitize CNPJ (digits only) before sending
      const payloadInst = { ...data, cnpj: data.cnpj ? data.cnpj.replace(/\D/g, '') : undefined };
      if (institution) {
        await updateInstitution(payloadInst);
        setSuccessMessage('Vitrine atualizada!');
      } else {
        await createInstitution(payloadInst);
        setSuccessMessage('Vitrine criada com sucesso!');
      }
      await refetchInst();
      setIsCreatingInst(false);
    } catch (_err) {
      setErrorMessage('Erro ao salvar vitrine.');
    } finally {
      setIsSavingInst(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser?.id) return;

    try {
      await api.post(`/users/me/deactivate`);

      // Backend performs soft-delete cascade — show user-friendly message
      setDeleteConfirm(false);
      setSuccessMessage(
        'Sua conta foi desativada. Seus dados serão mantidos por 90 dias para fins de auditoria; após esse período serão removidos permanentemente.',
      );

      // Perform logout through auth context (delayed so user can read the success message)
      logoutTimerRef.current = window.setTimeout(() => {
        void logout(routes.login.path);
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

  if (errorMessage && !profile) {
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
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-400 shadow-sm mb-6">
          <UserX size={40} strokeWidth={1.5} />
        </div>

        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Ops! Perfil não encontrado
        </h2>
        <p className="mt-3 max-w-xs text-slate-500 font-medium leading-relaxed">
          Parece que você não está autenticado ou houve um problema ao carregar seus dados.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            to={routes.login.path}
            className="inline-flex items-center justify-center rounded-full bg-cyan-600 px-8 py-3.5 text-sm font-bold text-white transition hover:bg-cyan-700 shadow-lg shadow-cyan-100"
          >
            Fazer login
          </Link>
          <Link
            to={routes.home.path}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-8 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full px-4 pb-12 pt-8">
      <div className="mx-auto max-w-4xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-100">
          <div className="flex items-center gap-5">
            <div
              className="h-20 w-20 flex-shrink-0 flex items-center justify-center rounded-3xl bg-cyan-600 text-white text-2xl font-bold shadow-lg shadow-cyan-100"
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

            <div className="min-w-0">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                {profile.fullName}
              </h1>
              <p className="text-slate-500 font-medium">{profile.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={routes.pets.mine.path}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
            >
              Meus pets ({profile.petsCount})
            </Link>

            <button
              onClick={() => logout().then(() => (window.location.href = '/login'))}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
            >
              Sair
            </button>

            <button
              onClick={() => setDeleteConfirm(true)}
              className="inline-flex items-center justify-center rounded-2xl bg-rose-50 px-5 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-100"
            >
              Desativar conta
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="mt-6 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-sm font-semibold text-emerald-800 animate-in fade-in slide-in-from-top-2">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mt-6 rounded-2xl bg-rose-50 border border-rose-100 p-4 text-sm font-semibold text-rose-800 animate-in fade-in slide-in-from-top-2">
            {errorMessage}
          </div>
        )}

        {deleteConfirm && (
          <div className="mt-8 rounded-3xl bg-rose-50/50 border border-rose-100 p-6 md:p-8 animate-in zoom-in-95">
            <h2 className="text-xl font-black text-slate-900">Desativar conta</h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              Ao desativar sua conta, seus dados e pets serão desativados e mantidos por{' '}
              <span className="font-bold text-slate-900">90 dias </span>
              para fins de auditoria. Após esse período, serão removidos permanentemente.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 rounded-2xl bg-rose-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-rose-700 shadow-lg shadow-rose-100"
              >
                Confirmar desativação
              </button>
            </div>
          </div>
        )}

        {!deleteConfirm && (
          <div className="mt-10">
            <form onSubmit={handleSubmitProfile(handleUpdateProfile)}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Informações Pessoais
                </h2>

                {profileIsDirty && (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                    <button
                      type="button"
                      onClick={() => resetProfile()}
                      className="text-sm font-bold text-slate-500 hover:text-slate-800 px-3 py-2 transition"
                    >
                      Descartar
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="rounded-2xl bg-cyan-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-700 disabled:opacity-50 shadow-lg shadow-cyan-100"
                    >
                      {isSaving ? 'Salvando...' : 'Salvar alterações'}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
                {/* Editable Fields */}
                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-sm font-bold text-slate-800 ml-1">
                    Nome completo
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    {...registerProfile('fullName')}
                    aria-invalid={!!profileErrors.fullName}
                    className={`w-full rounded-2xl border ${
                      profileErrors.fullName
                        ? 'border-rose-500 ring-4 ring-rose-50'
                        : 'border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50'
                    } bg-white px-5 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-300`}
                    placeholder="Seu nome completo"
                  />
                  {profileErrors.fullName && (
                    <p className="text-xs font-bold text-rose-500 ml-1 mt-1.5">
                      {profileErrors.fullName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="birthDate" className="text-sm font-bold text-slate-800 ml-1">
                    Data de nascimento
                  </label>
                  <input
                    id="birthDate"
                    type="date"
                    {...registerProfile('birthDate')}
                    aria-invalid={!!profileErrors.birthDate}
                    max={new Date().toISOString().split('T')[0]}
                    className={`w-full rounded-2xl border ${
                      profileErrors.birthDate
                        ? 'border-rose-500 ring-4 ring-rose-50'
                        : 'border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50'
                    } bg-white px-5 py-3.5 text-slate-900 outline-none transition`}
                  />
                  {profileErrors.birthDate && (
                    <p className="text-xs font-bold text-rose-500 ml-1 mt-1.5">
                      {profileErrors.birthDate.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-bold text-slate-800 ml-1">
                    Cidade
                  </label>
                  <input
                    id="city"
                    type="text"
                    {...registerProfile('city')}
                    aria-invalid={!!profileErrors.city}
                    className={`w-full rounded-2xl border ${
                      profileErrors.city
                        ? 'border-rose-500 ring-4 ring-rose-50'
                        : 'border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50'
                    } bg-white px-5 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-300`}
                    placeholder="Sua cidade"
                  />
                  {profileErrors.city && (
                    <p className="text-xs font-bold text-rose-500 ml-1 mt-1.5">
                      {profileErrors.city.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="state" className="text-sm font-bold text-slate-800 ml-1">
                    Estado
                  </label>
                  <FormSelect
                    id="state"
                    {...registerProfile('state')}
                    aria-invalid={!!profileErrors.state}
                    className={`${profileErrors.state ? 'border-rose-500 ring-4 ring-rose-50' : 'border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50'} !bg-white !py-3.5 !px-5`}
                  >
                    <option value="">Selecione seu estado</option>
                    {brazilianStates.map((state) => (
                      <option key={state.value} value={state.value}>
                        {state.label}
                      </option>
                    ))}
                  </FormSelect>
                  {profileErrors.state && (
                    <p className="text-xs font-bold text-rose-500 ml-1 mt-1.5">
                      {profileErrors.state.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-bold text-slate-800 ml-1">
                    Telefone Fixo (opcional)
                  </label>
                  <input
                    id="phone"
                    type="text"
                    {...registerProfile('phone')}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50 placeholder:text-slate-300"
                    placeholder="(00) 0000-0000"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="mobile" className="text-sm font-bold text-slate-800 ml-1">
                    Celular / WhatsApp (opcional)
                  </label>
                  <input
                    id="mobile"
                    type="text"
                    {...registerProfile('mobile')}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50 placeholder:text-slate-300"
                    placeholder="(00) 00000-0000"
                  />
                </div>

                {/* Divider for Read-only information */}
                <div className="sm:col-span-2 pt-6 mt-4 border-t border-slate-100">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight mb-6">
                    Informações da Conta
                  </h3>
                  <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-1">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                        E-mail
                      </span>
                      <p className="text-slate-600 font-medium">{profile.email}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                        CPF / CNPJ
                      </span>
                      <p className="text-slate-600 font-medium">
                        {formatDocument(
                          profile.role === 'PESSOA_FISICA' ? profile.cpf : profile.cnpj,
                          profile.role,
                        ) || '—'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                        Tipo
                      </span>
                      <p className="text-slate-600 font-medium">
                        {profile.role === 'PESSOA_FISICA' ? 'Pessoa Física' : 'ONG'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                        Membro desde
                      </span>
                      <p className="text-slate-600 font-medium">
                        {new Date(profile.createdAt).toLocaleDateString('pt-BR', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                        Pets Cadastrados
                      </span>
                      <p className="text-slate-600 font-medium">{profile.petsCount} pets</p>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* Public Showcase Section */}
            <div className="mt-12 pt-10 border-t border-slate-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Store className="text-cyan-600" size={28} />
                    Vitrine Pública
                  </h2>
                  <p className="text-slate-500 font-medium mt-1">
                    Configure como seu abrigo ou perfil de protetor aparece para o público.
                  </p>
                </div>

                {!institution && !isCreatingInst && (
                  <div className="flex-1 rounded-3xl bg-slate-900 p-6 md:p-8 shadow-[0_0_20px_rgba(6,182,212,0.15)] border border-cyan-500/20 animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="h-14 w-14 flex-shrink-0 flex items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                          <Store size={28} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-white tracking-tight">
                            Potencialize seu trabalho
                          </h3>
                          <p className="text-slate-400 font-medium text-sm">
                            Ative sua vitrine pública para ganhar visibilidade.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsCreatingInst(true)}
                        className="whitespace-nowrap rounded-2xl bg-cyan-500 px-8 py-4 text-sm font-black text-slate-950 transition hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95"
                      >
                        Ativar Perfil de Abrigo
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {(institution || isCreatingInst) && (
                <div className="rounded-3xl bg-slate-50 border border-slate-100 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4">
                  <form onSubmit={handleSubmitInst(handleSaveInstitution)}>
                    <div className="flex items-center justify-between mb-8">
                      {institution?.id ? (
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-10 w-10 items-center justify-center rounded-full ${institution.verified ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}
                          >
                            {institution.verified ? (
                              <CheckCircle size={20} />
                            ) : (
                              <AlertCircle size={20} />
                            )}
                          </span>
                          <div>
                            <p className="text-sm font-black text-slate-900">
                              {institution.verified ? 'Perfil Verificado' : 'Perfil em Análise'}
                            </p>
                            <p className="text-xs text-slate-500 font-medium">
                              {institution.verified
                                ? 'Sua vitrine possui o selo de confiança.'
                                : 'Sua vitrine está visível, mas aguarda validação.'}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                            <Store size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">Nova Vitrine</p>
                            <p className="text-xs text-slate-500 font-medium">
                              Preencha os dados abaixo para ativar seu perfil público.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        {institution && currentUser?.role === 'PESSOA_FISICA' && (
                          <button
                            type="button"
                            onClick={handleDeleteInstitution}
                            disabled={isDeletingInst}
                            className="rounded-2xl bg-rose-50 px-6 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
                          >
                            {isDeletingInst ? 'Desativando...' : 'Desativar Página'}
                          </button>
                        )}

                        <button
                          type="submit"
                          disabled={isSavingInst}
                          className="rounded-2xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
                        >
                          <Save size={18} className="mr-2 inline" />
                          {isSavingInst ? 'Salvando...' : 'Salvar Vitrine'}
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-800 ml-1">
                          Nome da Vitrine (Ex: Abrigo Felizes)
                        </label>
                        <input
                          type="text"
                          {...registerInst('name')}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-slate-900 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50 transition"
                        />
                        {instErrors.name && (
                          <p className="text-xs text-rose-500 font-bold ml-1">
                            {instErrors.name.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-800 ml-1">
                          CNPJ (Opcional para Protetores)
                        </label>
                        <input
                          type="text"
                          {...registerInst('cnpj', {
                            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                              const formatted = formatDocumentInput(e.target.value, 'ONG');
                              resetInst(
                                { ...getInstValues(), cnpj: formatted },
                                { keepDefaultValues: true },
                              );
                            },
                          })}
                          inputMode="numeric"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-slate-900 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50 transition"
                        />
                        {instErrors.cnpj && (
                          <p className="text-xs text-rose-500 font-bold ml-1">
                            {instErrors.cnpj.message}
                          </p>
                        )}
                      </div>

                      <div className="sm:col-span-2 space-y-2">
                        <label className="text-sm font-bold text-slate-800 ml-1">
                          Descrição / História
                        </label>
                        <textarea
                          rows={3}
                          {...registerInst('description')}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-slate-900 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50 transition resize-none"
                          placeholder="Conte um pouco sobre o seu trabalho com os animais..."
                        />
                        {instErrors.description && (
                          <p className="text-xs text-rose-500 font-bold ml-1">
                            {instErrors.description.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-800 ml-1">
                          Instagram da Instituição
                        </label>
                        <input
                          type="text"
                          {...registerInst('instagram')}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-slate-900 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50 transition"
                          placeholder="@seu_abrigo"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-800 ml-1">Website</label>
                        <input
                          type="text"
                          {...registerInst('website')}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-slate-900 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50 transition"
                          placeholder="https://sua-ong.org"
                        />
                        {instErrors.website && (
                          <p className="text-xs text-rose-500 font-bold ml-1">
                            {instErrors.website.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </form>

                  <p className="mt-6 text-xs text-slate-400 font-medium italic">
                    * A localização (Cidade/Estado) e o contato principal são sincronizados com seus
                    dados pessoais acima.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
