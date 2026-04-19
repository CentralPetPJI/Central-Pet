import { useFormContext } from 'react-hook-form';
import FormField from '@/Components/Form/FormField';
import FormInput from '@/Components/Form/FormInput';
import FormSelect from '@/Components/Form/FormSelect';
import FormSection from '@/Components/Form/FormSection';
import { brazilianStates } from '@/lib/formatters';
import { type PetRegisterFormData } from '@/storage/pets';

const PetRegisterLocationSection = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<PetRegisterFormData>();

  return (
    <FormSection
      accentClassName="text-emerald-700"
      eyebrow="Onde encontrar"
      title="Localizacao e contato"
    >
      <div className="grid gap-3 md:grid-cols-2">
        <FormField label="Tutor Responsavel" error={errors.tutor?.message}>
          <FormInput {...register('tutor')} placeholder="Ex: Maria Silva" />
        </FormField>
        <FormField label="Abrigo / Origem" error={errors.shelter?.message}>
          <FormInput {...register('shelter')} placeholder="Ex: Abrigo Esperanca" />
        </FormField>
        <FormField label="Cidade" error={errors.city?.message}>
          <FormInput {...register('city')} placeholder="Ex: Campinas" />
        </FormField>
        <FormField label="Estado" error={errors.state?.message}>
          <FormSelect {...register('state')}>
            <option value="">Selecione o estado</option>
            {brazilianStates.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </FormSelect>
        </FormField>
        <FormField label="Contato para Adocao" error={errors.contact?.message}>
          <FormInput {...register('contact')} accent="emerald" placeholder="(00) 00000-0000" />
        </FormField>
      </div>
    </FormSection>
  );
};

export default PetRegisterLocationSection;
