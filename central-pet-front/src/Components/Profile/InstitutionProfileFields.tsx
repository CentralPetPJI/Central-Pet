import { useFormContext } from 'react-hook-form';
import FormInput from '@/Components/Form/FormInput';
import FormField from '@/Components/Form/FormField';
import { type InstitutionFormData } from '@/lib/validation/institution';
import React from 'react';
import { formatCnpjInput } from '@/lib/formatters';
import { AuthUser } from '@/Models';
interface InstitutionProfileFieldsProps {
  user: AuthUser | null;
}

const InstitutionProfileFields: React.FC<InstitutionProfileFieldsProps> = ({ user }) => {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<InstitutionFormData>();

  if (!user) {
    return null;
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <FormField label="Nome do Perfil" error={errors.name?.message}>
        <FormInput {...register('name')} placeholder="Ex: Patas Amigas" />
      </FormField>

      <FormField label="CNPJ (Opcional)" error={errors.cnpj?.message}>
        <FormInput
          {...register('cnpj', {
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              const formatted = formatCnpjInput(e.target.value);
              setValue('cnpj', formatted, { shouldValidate: true });
            },
          })}
          placeholder="00.000.000/0000-00"
        />
      </FormField>

      <div className="sm:col-span-2">
        <FormField label="Descrição / História" error={errors.description?.message}>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-slate-900 outline-none focus:border-cyan-500 transition resize-none"
            placeholder="Conte um pouco sobre o seu trabalho com os animais..."
          />
        </FormField>
      </div>

      <FormField label="Instagram" error={errors.instagram?.message}>
        <FormInput {...register('instagram')} placeholder="@seu_perfil" />
      </FormField>

      <FormField label="Website" error={errors.website?.message}>
        <FormInput {...register('website')} placeholder="https://exemplo.org" />
      </FormField>
    </div>
  );
};

export default InstitutionProfileFields;
