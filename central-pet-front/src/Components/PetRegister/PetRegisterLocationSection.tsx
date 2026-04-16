import FormField from '@/Components/Form/FormField';
import FormInput from '@/Components/Form/FormInput';
import FormSelect from '@/Components/Form/FormSelect';
import FormSection from '@/Components/Form/FormSection';
import type { PetRegisterFormData } from '@/storage/pets';

// TODO: Mover a lista de estados para um arquivo separado ou pro banco, caso seja necessário reutilizá-la em outros lugares do projeto
const brazilianStates = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

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
      <FormField label="Estado" error={formErrors.state}>
        <FormSelect
          accent="emerald"
          value={formData.state}
          onChange={(event) => onUpdateField('state', event.target.value)}
        >
          <option value="">Selecione</option>
          {brazilianStates.map((state) => (
            <option key={state.value} value={state.value}>
              {state.label}
            </option>
          ))}
        </FormSelect>
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
