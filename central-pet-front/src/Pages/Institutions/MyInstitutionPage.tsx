import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useMyInstitution,
  updateInstitution,
  deleteMyInstitution,
} from '@/lib/institutions/use-institutions';
import { CheckCircle, AlertCircle, Save, ArrowLeft, ExternalLink, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { routes } from '@/routes';
import { useAuth } from '@/lib/auth';
import { institutionSchema, type InstitutionFormData } from '@/lib/validation/institution';
import { formatDocumentInput, sanitizeDocument } from '@/lib/formatters';

export default function MyInstitutionPage() {
  const { institution, isLoading, refetch } = useMyInstitution();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<InstitutionFormData>({
    resolver: zodResolver(institutionSchema),
  });

  useEffect(() => {
    if (institution) {
      reset({
        name: institution.name,
        description: institution.description ?? '',
        cnpj: institution.cnpj ?? '',
        instagram: institution.instagram ?? '',
        website: institution.website ?? '',
        foundedAt: institution.foundedAt ? institution.foundedAt.split('T')[0] : '',
      });
    }
  }, [institution, reset]);

  if (isLoading) return <div className="p-8 text-center">Carregando dados da instituição...</div>;

  if (!institution) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">Você ainda não possui uma vitrine institucional.</h2>
        <Link
          to={routes.institutions.register.path}
          className="mt-4 inline-block text-cyan-600 hover:underline"
        >
          Ativar agora
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: InstitutionFormData) => {
    setIsSaving(true);
    setMessage(null);
    try {
      const payload = { ...data, cnpj: data.cnpj ? sanitizeDocument(data.cnpj) : undefined };
      await updateInstitution(payload);
      setMessage({ type: 'success', text: 'Dados atualizados com sucesso!' });
      await refetch();
    } catch (_err) {
      setMessage({ type: 'error', text: 'Erro ao atualizar dados.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        'Tem certeza que deseja desativar sua página de abrigo? Esta ação não pode ser desfeita facilmente.',
      )
    )
      return;

    setIsDeleting(true);
    try {
      await deleteMyInstitution();
      navigate(routes.profile.path);
    } catch (_err) {
      setMessage({ type: 'error', text: 'Erro ao desativar página.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link
            to={routes.profile.path}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-cyan-600 mb-2 transition"
          >
            <ArrowLeft size={16} /> Voltar ao Perfil
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Minha Instituição</h1>
          <p className="text-slate-500 font-medium">
            Gerencie como seu abrigo aparece para o público.
          </p>
        </div>

        <Link
          to={routes.institutions.detail.build(institution.id)}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 shadow-sm"
        >
          <ExternalLink size={18} /> Ver Página Pública
        </Link>
      </div>

      <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        {institution.id && (
          <div
            className={`p-4 flex items-center gap-3 ${institution.verified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}
          >
            {institution.verified ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="text-sm font-bold">
              {institution.verified ? 'Perfil Verificado' : 'Perfil em Análise Administrativa'}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-8">
          {message && (
            <div
              className={`rounded-2xl p-4 text-sm font-bold animate-in fade-in slide-in-from-top-2 ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                  : 'bg-rose-50 text-rose-800 border border-rose-100'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800 ml-1">Nome da Vitrine</label>
              <input
                type="text"
                {...register('name')}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-slate-900 outline-none focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-50 transition"
              />
              {errors.name && (
                <p className="text-xs text-rose-500 font-bold ml-1">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800 ml-1">CNPJ (Opcional)</label>
              <input
                type="text"
                {...register('cnpj', {
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                    const formatted = formatDocumentInput(e.target.value, 'ONG');
                    setValue('cnpj', formatted, { shouldValidate: true });
                  },
                })}
                inputMode="numeric"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-slate-900 outline-none focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-50 transition"
              />
              {errors.cnpj && (
                <p className="text-xs text-rose-500 font-bold ml-1">{errors.cnpj.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800 ml-1">Data de Fundação</label>
              <input
                type="date"
                {...register('foundedAt')}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-slate-900 outline-none focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-50 transition"
              />
              {errors.foundedAt && (
                <p className="text-xs text-rose-500 font-bold ml-1">{errors.foundedAt.message}</p>
              )}
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-slate-800 ml-1">Descrição do Abrigo</label>
              <textarea
                rows={4}
                {...register('description')}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-slate-900 outline-none focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-50 transition resize-none"
                placeholder="Conte sobre sua história, missão e como as pessoas podem ajudar..."
              />
              {errors.description && (
                <p className="text-xs text-rose-500 font-bold ml-1">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800 ml-1">Instagram</label>
              <input
                type="text"
                {...register('instagram')}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-slate-900 outline-none focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-50 transition"
                placeholder="@seu_perfil"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800 ml-1">Website</label>
              <input
                type="text"
                {...register('website')}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-slate-900 outline-none focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-50 transition"
                placeholder="https://exemplo.org"
              />
              {errors.website && (
                <p className="text-xs text-rose-500 font-bold ml-1">{errors.website.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-between border-t border-slate-100 pt-6">
            {currentUser?.role === 'PESSOA_FISICA' && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-50 px-6 py-3.5 text-sm font-bold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
              >
                <Trash2 size={18} />
                {isDeleting ? 'Desativando...' : 'Desativar Página'}
              </button>
            )}

            <div className="flex gap-2">
              {isDirty && (
                <button
                  type="button"
                  onClick={() => reset()}
                  className="px-6 py-3.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition"
                >
                  Descartar
                </button>
              )}
              <button
                type="submit"
                disabled={isSaving || !isDirty}
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-8 py-3.5 text-sm font-bold text-white transition hover:bg-cyan-700 shadow-lg shadow-cyan-100 disabled:opacity-50"
              >
                <Save size={18} />
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
