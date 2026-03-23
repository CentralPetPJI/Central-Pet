import FormSection from '@/Components/Form/FormSection';
import SelectableCard from '@/Components/Form/SelectableCard';
import { petPersonalityOptions } from '@/Mocks/PetPersonalityOptions';

interface PetRegisterBehaviorSectionProps {
  selectedPersonalities: string[];
  onTogglePersonality: (personalityId: string) => void;
}

const PetRegisterBehaviorSection = ({
  selectedPersonalities,
  onTogglePersonality,
}: PetRegisterBehaviorSectionProps) => (
  <FormSection
    className="mt-4"
    accentClassName="text-violet-700"
    eyebrow="Comportamentos"
    title="Personalidades com icones"
  >
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {petPersonalityOptions.map((option) => (
        <SelectableCard
          key={option.id}
          description={option.description}
          icon={option.icon}
          isSelected={selectedPersonalities.includes(option.id)}
          onClick={() => onTogglePersonality(option.id)}
          title={option.title}
        />
      ))}
    </div>
  </FormSection>
);

export default PetRegisterBehaviorSection;
