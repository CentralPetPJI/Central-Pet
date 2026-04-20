import { useFormContext } from 'react-hook-form';
import FormCheckbox from '@/Components/Form/FormCheckbox';
import FormSection from '@/Components/Form/FormSection';
import type { PetRegisterFormData } from '@/storage/pets';

// TODO: Mover isso pro back, talvez ;)
const healthFields = [
  ['vaccinated', 'Vacinado'],
  ['neutered', 'Castrado'],
  ['dewormed', 'Vermifugado'],
  ['needsHealthCare', 'Necessita de cuidados de saude'],
  ['physicalLimitation', 'Limitacao fisica'],
  ['visualLimitation', 'Limitacao visual'],
  ['hearingLimitation', 'Limitacao auditiva'],
] as const;

const PetRegisterHealthSection = () => {
  const { register } = useFormContext<PetRegisterFormData>();

  return (
    <FormSection
      className="mt-4"
      accentClassName="text-rose-700"
      eyebrow="Saude"
      title="Status clinico"
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
