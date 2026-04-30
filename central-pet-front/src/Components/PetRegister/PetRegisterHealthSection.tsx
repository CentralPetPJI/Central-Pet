import { useFormContext } from 'react-hook-form';
import FormCheckbox from '@/Components/Form/FormCheckbox';
import FormSection from '@/Components/Form/FormSection';
import type { PetRegisterFormData } from '@/storage/pets';

// TODO: Mover isso pro back, talvez ;)
const healthFields = [
  ['vaccinated', 'Vacinado'],
  ['neutered', 'Castrado'],
  ['dewormed', 'Vermifugado'],
  ['physicalLimitation', 'Limitacao fisica'],
  ['visualLimitation', 'Limitacao visual'],
  ['hearingLimitation', 'Limitacao auditiva'],
  ['needsHealthCare', 'Necessita de cuidados de saude'],
] as const;

// TODO: validar a disposição dos checkbox para a quantidade correta de itens (maior que atual talvez)

const PetRegisterHealthSection = () => {
  const { register } = useFormContext<PetRegisterFormData>();

  return (
    <FormSection
      className="h-full"
      accentClassName="text-rose-700"
      eyebrow="Saude"
      title="Status clinico"
    >
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-2">
        {healthFields.map(([field, label]) => (
          <FormCheckbox
            key={field}
            accent="rose"
            {...register(field as keyof PetRegisterFormData)}
            label={label}
          />
        ))}
      </div>
    </FormSection>
  );
};

export default PetRegisterHealthSection;
