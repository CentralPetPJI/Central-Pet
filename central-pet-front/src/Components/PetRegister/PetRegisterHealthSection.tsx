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

interface PetRegisterHealthSectionProps {
  formData: PetRegisterFormData;
  onUpdateField: <K extends keyof PetRegisterFormData>(
    field: K,
    value: PetRegisterFormData[K],
  ) => void;
}

const PetRegisterHealthSection = ({ formData, onUpdateField }: PetRegisterHealthSectionProps) => (
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
          checked={formData[field]}
          onChange={(event) => onUpdateField(field, event.target.checked)}
          label={label}
        />
      ))}
    </div>
  </FormSection>
);

export default PetRegisterHealthSection;
