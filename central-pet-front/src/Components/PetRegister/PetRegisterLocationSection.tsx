import { Link } from 'react-router-dom';
import { useFormContext } from 'react-hook-form';
import FormField from '@/Components/Form/FormField';
import FormInput from '@/Components/Form/FormInput';
import FormSection from '@/Components/Form/FormSection';
import { type PetRegisterFormData } from '@/storage/pets';
import { routes } from '@/routes';

interface PetRegisterLocationSectionProps {
  city?: string;
  state?: string;
  isLoading?: boolean;
  isLocationMissing?: boolean;
}

const PetRegisterLocationSection = ({
  city,
  state,
  isLoading = false,
  isLocationMissing = false,
}: PetRegisterLocationSectionProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<PetRegisterFormData>();

  const resolvedCity = isLoading ? 'Carregando...' : city || 'Nao informada';
  const resolvedState = isLoading ? 'Carregando...' : state || 'Nao informado';

  return (
    <FormSection
      accentClassName="text-emerald-700"
      eyebrow="Localizacao do responsavel"
      title="Usando a localizacao do seu perfil"
    >
      <p className="mb-4 text-sm text-slate-600">
        A cidade e o estado exibidos no anuncio sao herdados do perfil do responsavel e nao podem
        ser editados por pet.
      </p>

      {isLocationMissing ? (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Complete cidade e estado no seu perfil antes de publicar este pet.{' '}
          <Link className="font-semibold underline" to={routes.profile.path}>
            Atualizar perfil
          </Link>
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <FormField label="Tutor" error={errors.tutor?.message}>
          <FormInput {...register('tutor')} placeholder="Ex: Maria Silva" />
        </FormField>
        <FormField label="Abrigo" error={errors.shelter?.message}>
          <FormInput {...register('shelter')} placeholder="Ex: Abrigo Esperanca" />
        </FormField>
        <FormField label="Cidade do perfil" error={errors.city?.message}>
          <FormInput value={resolvedCity} readOnly disabled className="cursor-not-allowed" />
        </FormField>
        <FormField label="Estado do perfil" error={errors.state?.message}>
          <FormInput value={resolvedState} readOnly disabled className="cursor-not-allowed" />
        </FormField>
        <FormField label="Contato" error={errors.contact?.message}>
          <FormInput {...register('contact')} accent="emerald" placeholder="(00) 00000-0000" />
        </FormField>
      </div>
    </FormSection>
  );
};

export default PetRegisterLocationSection;
