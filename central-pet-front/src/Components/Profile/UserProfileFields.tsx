import { useFormContext } from 'react-hook-form';
import FormInput from '@/Components/Form/FormInput';
import FormField from '@/Components/Form/FormField';
import FormSelect from '@/Components/Form/FormSelect';
import { brazilianStates } from '@/lib/formatters';
import { type UserProfileFormData } from '@/lib/validation/profile';

const UserProfileFields = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<UserProfileFormData>();

  return (
    <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
      <FormField label="Nome completo" error={errors.fullName?.message}>
        <FormInput {...register('fullName')} placeholder="Seu nome completo" />
      </FormField>

      <FormField label="Data de nascimento" error={errors.birthDate?.message}>
        <FormInput {...register('birthDate')} type="date" />
      </FormField>

      <FormField label="Cidade" error={errors.city?.message}>
        <FormInput {...register('city')} placeholder="Sua cidade" />
      </FormField>

      <FormField label="Estado" error={errors.state?.message}>
        <FormSelect {...register('state')}>
          <option value="">Selecione seu estado</option>
          {brazilianStates.map((state) => (
            <option key={state.value} value={state.value}>
              {state.label}
            </option>
          ))}
        </FormSelect>
      </FormField>

      <FormField label="Telefone Fixo (opcional)" error={errors.phone?.message}>
        <FormInput {...register('phone')} placeholder="(00) 0000-0000" />
      </FormField>

      <FormField label="Celular / WhatsApp (opcional)" error={errors.mobile?.message}>
        <FormInput {...register('mobile')} placeholder="(00) 00000-0000" />
      </FormField>
    </div>
  );
};

export default UserProfileFields;
