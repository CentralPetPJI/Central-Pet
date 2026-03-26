import FormField from '@/Components/Form/FormField';
import FormInput from '@/Components/Form/FormInput';
import FormSection from '@/Components/Form/FormSection';
import type { PetRegisterFormData } from '@/Mocks/PetRegisterFormMock';

type FormErrors = Partial<Record<keyof PetRegisterFormData, string>>;

interface PetRegisterLocationSectionProps {
  formData: PetRegisterFormData;
  formErrors: FormErrors;
  onUpdateField: <K extends keyof PetRegisterFormData>(
    field: K,
    value: PetRegisterFormData[K],
  ) => void;
}

const PetRegisterLocationSection = ({
  formData,
  formErrors,
  onUpdateField,
}: PetRegisterLocationSectionProps) => (
  <FormSection accentClassName="text-emerald-700" eyebrow="Localizacao" title="Origem e contato">
    <div className="grid gap-3 md:grid-cols-2">
      <FormField label="Tutor" error={formErrors.tutor}>
        <FormInput
          accent="emerald"
          value={formData.tutor}
          onChange={(event) => onUpdateField('tutor', event.target.value)}
        />
      </FormField>
      <FormField label="Abrigo" error={formErrors.shelter}>
        <FormInput
          accent="emerald"
          value={formData.shelter}
          onChange={(event) => onUpdateField('shelter', event.target.value)}
        />
      </FormField>
      <FormField label="Cidade" error={formErrors.city}>
        <FormInput
          accent="emerald"
          value={formData.city}
          onChange={(event) => onUpdateField('city', event.target.value)}
        />
      </FormField>
      <FormField label="Contato" error={formErrors.contact}>
        <FormInput
          accent="emerald"
          value={formData.contact}
          onChange={(event) => onUpdateField('contact', event.target.value)}
        />
      </FormField>
    </div>
  </FormSection>
);

export default PetRegisterLocationSection;
