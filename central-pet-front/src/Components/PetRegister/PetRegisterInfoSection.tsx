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
} from '@/Mocks/PetRegisterFormMock';

type FormErrors = Partial<Record<keyof PetRegisterFormData, string>>;

interface PetRegisterInfoSectionProps {
  formData: PetRegisterFormData;
  formErrors: FormErrors;
  onUpdateField: <K extends keyof PetRegisterFormData>(
    field: K,
    value: PetRegisterFormData[K],
  ) => void;
}

const PetRegisterInfoSection = ({
  formData,
  formErrors,
  onUpdateField,
}: PetRegisterInfoSectionProps) => (
  <FormSection accentClassName="text-cyan-700" eyebrow="Informacoes" title="Dados basicos do pet">
    <div className="grid gap-3 md:grid-cols-2">
      <FormField label="Nome" error={formErrors.name}>
        <FormInput
          value={formData.name}
          onChange={(event) => onUpdateField('name', event.target.value)}
        />
      </FormField>
      <FormField label="Idade" error={formErrors.age}>
        <FormInput
          value={formData.age}
          onChange={(event) => onUpdateField('age', event.target.value)}
        />
      </FormField>
      <FormField label="Raca" error={formErrors.breed}>
        <FormInput
          value={formData.breed}
          onChange={(event) => onUpdateField('breed', event.target.value)}
        />
      </FormField>
      <FormField label="Especie" error={formErrors.species}>
        <FormSelect
          value={formData.species}
          onChange={(event) => onUpdateField('species', event.target.value)}
        >
          {petSpeciesOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </FormSelect>
      </FormField>
      <FormField label="Sexo">
        <FormSelect
          value={formData.sex}
          onChange={(event) => onUpdateField('sex', event.target.value)}
        >
          {petSexOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </FormSelect>
      </FormField>
      <FormField label="Porte">
        <FormSelect
          value={formData.size}
          onChange={(event) => onUpdateField('size', event.target.value)}
        >
          {petSizeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </FormSelect>
      </FormField>
      <FormCheckbox
        checked={formData.microchipped}
        onChange={(event) => onUpdateField('microchipped', event.target.checked)}
        label="Microchipado"
      />
    </div>
  </FormSection>
);

export default PetRegisterInfoSection;
