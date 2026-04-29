import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatDocument, brazilianStates } from '@/lib/formatters';
import FormSelect from '@/Components/Form/FormSelect';
import { routes } from '@/routes';
import type { AuthUser } from '@/Models/auth';
import type { UserProfile } from '@/Models/user';
import { UserX, ShieldCheck } from 'lucide-react';
import { userProfileSchema } from '@/lib/validation/profile';

export default function ProfilePage() {
  const { currentUser, isLoading: isAuthLoading, logout, syncCurrentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const logoutTimerRef = useRef<number | null>(null);

  const editableKeys: (keyof UserProfile)[] = [
    'fullName',
    'birthDate',
    'city',
    'state',
    'organizationName',
    'phone',
    'mobile',
    'instagram',
    'facebook',
    'website',
    'foundedAt',
  ];

  const hasChanges = !!(
    profile &&
    editableKeys.some(
      (k) => String(editForm[k] ?? '') !== String((profile as UserProfile)[k] ?? ''),
    )
  );

  const profileToEditForm = (p: UserProfile) => ({
    fullName: p.fullName,
    birthDate: p.birthDate ? new Date(p.birthDate).toISOString() : '',
    city: p.city ?? '',
    state: p.state ?? '',
    organizationName: p.organizationName ?? '',
    phone: p.phone ?? '',
    mobile: p.mobile ?? '',
    instagram: p.instagram ?? '',
    facebook: p.facebook ?? '',
    website: p.website ?? '',
    foundedAt: p.foundedAt ?? '',
  });

  const resetEditForm = () => {
    if (!profile) return;
    setEditForm(profileToEditForm(profile));
    setValidationErrors({});
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
        setEditForm(profileToEditForm(response.data.data));
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

  const validate = () => {
    const result = userProfileSchema.safeParse(editForm);
    if (result.success) {
      setValidationErrors({});
      return true;
    }

    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const path = issue.path[0]?.toString();
      if (path) {
        errors[path] = issue.message;
      }
    });
    setValidationErrors(errors);
    return false;
  };

  const handleInputChange = (field: keyof Partial<UserProfile>, value: string | undefined) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value === '' ? undefined : value,
    }));
    // Clear error for the field being changed
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleUpdateProfile = async () => {
    if (!profile || !currentUser?.id) return;

    if (!validate()) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await api.patch<{ data: UserProfile }>(`/users/me`, editForm);

      setProfile(response.data.data);
      syncCurrentUser({
        ...(currentUser as AuthUser),
        ...response.data.data,
        updatedAt: new Date().toISOString(),
      });
      setSuccessMessage('Perfil atualizado com sucesso!');
    } catch (_error) {
      setErrorMessage('Não foi possível atualizar o perfil.');
    } finally {
      setIsSaving(false);
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
              className="h-20 w-20 shrink-0 flex items-center justify-center rounded-3xl bg-cyan-600 text-white text-2xl font-bold shadow-lg shadow-cyan-100"
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

            <Link
              to={routes.termsOfResponsibility.path}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
            >
              <ShieldCheck size={18} className="text-[#4fb8c5]" />
              Termos de Uso
            </Link>

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
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Informações Pessoais
              </h2>

              {hasChanges && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                  <button
                    onClick={resetEditForm}
                    className="text-sm font-bold text-slate-500 hover:text-slate-800 px-3 py-2 transition"
                  >
                    Descartar
                  </button>
                  <button
                    onClick={handleUpdateProfile}
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
                  aria-invalid={!!validationErrors.fullName}
                  aria-describedby={validationErrors.fullName ? 'fullName-error' : undefined}
                  value={editForm.fullName ?? ''}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={`w-full rounded-2xl border ${
                    validationErrors.fullName
                      ? 'border-rose-500 ring-4 ring-rose-50'
                      : 'border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50'
                  } bg-white px-5 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-300`}
                  placeholder="Seu nome completo"
                />
                {validationErrors.fullName && (
                  <p className="text-xs font-bold text-rose-500 ml-1 mt-1.5">
                    {validationErrors.fullName}
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
                  aria-invalid={!!validationErrors.birthDate}
                  aria-describedby={validationErrors.birthDate ? 'birthDate-error' : undefined}
                  max={new Date().toISOString().split('T')[0]}
                  value={editForm.birthDate ?? ''}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  className={`w-full rounded-2xl border ${
                    validationErrors.birthDate
                      ? 'border-rose-500 ring-4 ring-rose-50'
                      : 'border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50'
                  } bg-white px-5 py-3.5 text-slate-900 outline-none transition`}
                />
                {validationErrors.birthDate && (
                  <p className="text-xs font-bold text-rose-500 ml-1 mt-1.5">
                    {validationErrors.birthDate}
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
                  aria-invalid={!!validationErrors.city}
                  aria-describedby={validationErrors.city ? 'city-error' : undefined}
                  value={editForm.city ?? ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={`w-full rounded-2xl border ${
                    validationErrors.city
                      ? 'border-rose-500 ring-4 ring-rose-50'
                      : 'border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50'
                  } bg-white px-5 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-300`}
                  placeholder="Sua cidade"
                />
                {validationErrors.city && (
                  <p className="text-xs font-bold text-rose-500 ml-1 mt-1.5">
                    {validationErrors.city}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="state" className="text-sm font-bold text-slate-800 ml-1">
                  Estado
                </label>
                <FormSelect
                  id="state"
                  aria-invalid={!!validationErrors.state}
                  aria-describedby={validationErrors.state ? 'state-error' : undefined}
                  value={editForm.state || ''}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className={`${validationErrors.state ? 'border-rose-500 ring-4 ring-rose-50' : 'border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50'} bg-white! py-3.5! px-5!`}
                >
                  <option value="">Selecione seu estado</option>
                  {brazilianStates.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </FormSelect>
                {validationErrors.state && (
                  <p className="text-xs font-bold text-rose-500 ml-1 mt-1.5">
                    {validationErrors.state}
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
                  aria-invalid={!!validationErrors.phone}
                  aria-describedby={validationErrors.phone ? 'phone-error' : undefined}
                  value={editForm.phone ?? ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
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
                  aria-invalid={!!validationErrors.mobile}
                  aria-describedby={validationErrors.mobile ? 'mobile-error' : undefined}
                  value={editForm.mobile ?? ''}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50 placeholder:text-slate-300"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="instagram" className="text-sm font-bold text-slate-800 ml-1">
                  Instagram (opcional)
                </label>
                <input
                  id="instagram"
                  type="text"
                  aria-invalid={!!validationErrors.instagram}
                  aria-describedby={validationErrors.instagram ? 'instagram-error' : undefined}
                  value={editForm.instagram ?? ''}
                  onChange={(e) => handleInputChange('instagram', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50 placeholder:text-slate-300"
                  placeholder="@seu_perfil"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="facebook" className="text-sm font-bold text-slate-800 ml-1">
                  Facebook (opcional)
                </label>
                <input
                  id="facebook"
                  type="text"
                  aria-invalid={!!validationErrors.facebook}
                  aria-describedby={validationErrors.facebook ? 'facebook-error' : undefined}
                  value={editForm.facebook ?? ''}
                  onChange={(e) => handleInputChange('facebook', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50 placeholder:text-slate-300"
                  placeholder="facebook.com/seu_perfil"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="website" className="text-sm font-bold text-slate-800 ml-1">
                  Website (opcional)
                </label>
                <input
                  id="website"
                  type="text"
                  aria-invalid={!!validationErrors.website}
                  aria-describedby={validationErrors.website ? 'website-error' : undefined}
                  value={editForm.website ?? ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50 placeholder:text-slate-300"
                  placeholder="https://sua-ong.org"
                />
              </div>

              {profile.role === 'ONG' && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="foundedAt" className="text-sm font-bold text-slate-800 ml-1">
                      Data de Fundação
                    </label>
                    <input
                      id="foundedAt"
                      type="date"
                      aria-invalid={!!validationErrors.foundedAt}
                      aria-describedby={validationErrors.foundedAt ? 'foundedAt-error' : undefined}
                      max={new Date().toISOString().split('T')[0]}
                      value={editForm.foundedAt ?? ''}
                      onChange={(e) => handleInputChange('foundedAt', e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="organizationName"
                      className="text-sm font-bold text-slate-800 ml-1"
                    >
                      Nome da Organização
                    </label>
                    <input
                      id="organizationName"
                      type="text"
                      aria-invalid={!!validationErrors.organizationName}
                      aria-describedby={
                        validationErrors.organizationName ? 'organizationName-error' : undefined
                      }
                      value={editForm.organizationName ?? ''}
                      onChange={(e) => handleInputChange('organizationName', e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50 placeholder:text-slate-300"
                      placeholder="Ex: Abrigo Felizes"
                    />
                  </div>
                </>
              )}

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
                      Localização
                    </span>
                    <p className="text-slate-600 font-medium">
                      {profile.city || '—'}
                      {profile.city && profile.state ? ' / ' : ''}
                      {profile.state || ''}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Telefone
                    </span>
                    <p className="text-slate-600 font-medium">{profile.phone || '—'}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Celular
                    </span>
                    <p className="text-slate-600 font-medium">{profile.mobile || '—'}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Site
                    </span>
                    <p className="text-slate-600 font-medium">
                      {profile.website ? (
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noreferrer"
                          className="underline"
                        >
                          {profile.website}
                        </a>
                      ) : (
                        '—'
                      )}
                    </p>
                  </div>

                  {profile.role === 'ONG' && (
                    <div className="space-y-1">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                        Organização
                      </span>
                      <p className="text-slate-600 font-medium">
                        {profile.organizationName || '—'}
                      </p>
                    </div>
                  )}

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
          </div>
        )}
      </div>
    </section>
  );
}
