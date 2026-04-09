import { useParams } from 'react-router-dom';
import PetRegisterForm from '@/Components/PetRegister/PetRegisterForm';

const PetPersonalityRegisterPage = () => {
  const { petId } = useParams();
  const resolvedPetId = petId ? String(petId) : undefined;
  const pageKey = resolvedPetId != null ? `edit-${resolvedPetId}` : 'new';

  return <PetRegisterForm key={pageKey} petId={resolvedPetId} />;
};

export default PetPersonalityRegisterPage;
