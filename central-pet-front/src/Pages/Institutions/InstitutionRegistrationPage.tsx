import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createInstitution } from '@/lib/institutions/use-institutions';
import { Store, ArrowRight, ShieldCheck, Globe } from 'lucide-react';
import { SiInstagram } from '@icons-pack/react-simple-icons';
import { routes } from '@/routes';
import { formatCnpjInput } from '@/lib/formatters';
import { institutionSchema, type InstitutionFormData } from '@/lib/validation/institution';

export default function InstitutionRegistrationPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<InstitutionFormData>({
    resolver: zodResolver(institutionSchema),
    defaultValues: {
      name: '',
      description: '',
      cnpj: '',
      instagram: '',
      website: '',
      foundedAt: '',
    },
  });

  const onSubmit = async (data: InstitutionFormData) => {
    setIsSubmitting(true);
    try {
      await createInstitution(data);
      navigate(routes.institutions.mine.path);
    } catch (_err) {
      alert('Erro ao ativar perfil público. Verifique se você já possui uma página ativa.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-600 text-white shadow-[0_0_20px_rgba(8,145,178,0.4)] mb-6">
          <Store size={32} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ativar Perfil Público</h1>
        <p className="mt-3 text-slate-500 font-medium max-w-sm mx-auto">
          Conecte sua causa a novos apoiadores e encontre lares para seus pets.
        </p>
      </div>

      <div className="flex justify-center gap-10 mb-10">
        {[
          { icon: ShieldCheck, label: 'Credibilidade' },
          { icon: Globe, label: 'Visibilidade' },
          { icon: SiInstagram, label: 'Conexão' },
        ].map((item, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2">
            <item.icon className="text-cyan-600" size={24} />
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-800 ml-1">Nome do Perfil ou Projeto</label>
          <input
            {...register('name')}
            type="text"
            placeholder="Ex: Projeto Patas Amigas"
            className="w-full rounded-2xl border border-slate-200 px-5 py-3.5 text-slate-900 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition"
          />
          {errors.name && (
            <p className="text-sm text-rose-500 font-bold ml-1">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-800 ml-1">Descrição Curta</label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Conte um pouco sobre seu trabalho e missão..."
            className="w-full rounded-2xl border border-slate-200 px-5 py-3.5 text-slate-900 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition resize-none"
          />
          {errors.description && (
            <p className="text-sm text-rose-500 font-bold ml-1">{errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-800 ml-1">CNPJ (Opcional)</label>
          <input
            {...register('cnpj', {
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                const formatted = formatCnpjInput(e.target.value);
                setValue('cnpj', formatted, { shouldValidate: true });
              },
            })}
            type="text"
            inputMode="numeric"
            placeholder="00.000.000/0000-00"
            className="w-full rounded-2xl border border-slate-200 px-5 py-3.5 text-slate-900 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition"
          />
          {errors.cnpj && (
            <p className="text-sm text-rose-500 font-bold ml-1">{errors.cnpj.message}</p>
          )}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-bold text-white transition hover:bg-slate-800 hover:shadow-[0_0_20px_rgba(15,23,42,0.4)] disabled:opacity-50"
          >
            {isSubmitting ? 'Ativando...' : 'Ativar Perfil Público'}
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
