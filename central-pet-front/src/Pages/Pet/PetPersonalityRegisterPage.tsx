import { useParams } from 'react-router-dom';
import PetRegisterForm from '@/Components/PetRegister/PetRegisterForm';

const PetPersonalityRegisterPage = () => {
  const { petId } = useParams();
  const numericPetId = Number(petId);
  const resolvedPetId = Number.isFinite(numericPetId) ? numericPetId : undefined;
  const pageKey = resolvedPetId ? `edit-${resolvedPetId}` : 'new';

  return <PetRegisterForm key={pageKey} petId={resolvedPetId} />;
};

export default PetPersonalityRegisterPage;
