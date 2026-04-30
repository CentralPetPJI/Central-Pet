import { useFormContext } from 'react-hook-form';
import FormCheckbox from '@/Components/Form/FormCheckbox';
import FormField from '@/Components/Form/FormField';
import FormInput from '@/Components/Form/FormInput';
import FormSection from '@/Components/Form/FormSection';
import FormSelect from '@/Components/Form/FormSelect';
import {
  petSizeOptions,
  petSexOptions,
  petSpeciesOptions,
  type PetRegisterFormData,
} from '@/storage/pets';

const PetRegisterInfoSection = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<PetRegisterFormData>();

  return (
    <FormSection accentClassName="text-cyan-700" eyebrow="Informacoes" title="Dados basicos do pet">
      <div className="grid gap-3 md:grid-cols-2">
        <FormField label="Nome" error={errors.name?.message}>
          <FormInput {...register('name')} />
        </FormField>
        <FormField label="Idade" error={errors.age?.message}>
          <FormInput {...register('age')} />
        </FormField>
        <FormField label="Raca" error={errors.breed?.message}>
          <FormInput {...register('breed')} />
        </FormField>
        <FormField label="Especie" error={errors.species?.message}>
          <FormSelect {...register('species')}>
            {petSpeciesOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FormSelect>
        </FormField>
        <FormField label="Sexo" error={errors.sex?.message}>
          <FormSelect {...register('sex')}>
            {petSexOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FormSelect>
        </FormField>
        <FormField label="Porte" error={errors.size?.message}>
          <FormSelect {...register('size')}>
            {petSizeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FormSelect>
        </FormField>
        <FormCheckbox {...register('microchipped')} label="Microchipado" />
      </div>
    </FormSection>
  );
};

export default PetRegisterInfoSection;
