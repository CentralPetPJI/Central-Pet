import FormSection from '@/Components/Form/FormSection';
import SelectableCard from '@/Components/Form/SelectableCard';
import { PersonalityTraitIcon, type PetPersonalityOption } from '@/storage/pets';

interface PetRegisterBehaviorSectionProps {
  isLoading?: boolean;
  options: PetPersonalityOption[];
  selectedPersonalities: string[];
  onTogglePersonality: (personalityId: string) => void;
}

const PetRegisterBehaviorSection = ({
  isLoading = false,
  options,
  selectedPersonalities,
  onTogglePersonality,
}: PetRegisterBehaviorSectionProps) => (
  <FormSection
    className="mt-4"
    accentClassName="text-violet-700"
    eyebrow="Comportamentos"
    title="Personalidades com ícones"
  >
    {isLoading ? (
      <p className="rounded-2xl border border-cyan-100 bg-white p-4 text-sm text-slate-600">
        Carregando personalidades disponíveis...
      </p>
    ) : options.length > 0 ? (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {options.map((option) => (
          <SelectableCard
            key={option.id}
            description={option.description}
            icon={<PersonalityTraitIcon iconSvg={option.iconSvg} />}
            isSelected={selectedPersonalities.includes(option.id)}
            onClick={() => onTogglePersonality(option.id)}
            title={option.title}
          />
        ))}
      </div>
    ) : (
      <p className="rounded-2xl border border-cyan-100 bg-white p-4 text-sm text-slate-600">
        Não foi possível carregar as personalidades disponíveis.
      </p>
    )}
  </FormSection>
);

export default PetRegisterBehaviorSection;
