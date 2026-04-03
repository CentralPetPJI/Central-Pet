import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PetProfileFactGrid, {
  type PetProfileFact,
} from '@/Components/PetProfile/PetProfileFactGrid';
import PetProfileGallery from '@/Components/PetProfile/PetProfileGallery';
import PetProfileHero from '@/Components/PetProfile/PetProfileHero';
import PetProfileOverview from '@/Components/PetProfile/PetProfileOverview';
import PetProfilePersonalityList from '@/Components/PetProfile/PetProfilePersonalityList';
import PetProfileSection from '@/Components/PetProfile/PetProfileSection';
import { petPersonalityOptions } from '@/Mocks/PetPersonalityOptions';
import { initialPetRegisterFormData, type PetRegisterFormData } from '@/Mocks/PetRegisterFormMock';
import { getPetById, getPetProfileById } from '@/Mocks/PetsStorage';
import { routes } from '@/routes';

const PetPersonalityProfilePage = () => {
  const { petId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [displayMessage, setDisplayMessage] = useState(location.state?.successMessage ?? '');

  // Limpar a mensagem após 3 segundos
  useEffect(() => {
    if (displayMessage) {
      const timer = setTimeout(() => {
        setDisplayMessage('');
        // Remove successMessage from location.state to prevent reappearing on remount
        navigate(location.pathname, { replace: true, state: {} });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [displayMessage, location.pathname, navigate]);
  const numericPetId = Number(petId);

  const profileState: {
    formData: PetRegisterFormData;
    selectedPersonalities: string[];
  } = (() => {
    if (!Number.isFinite(numericPetId)) {
      return {
        formData: initialPetRegisterFormData,
        selectedPersonalities: [],
      };
    }

    const savedProfile = getPetProfileById(numericPetId);

    if (savedProfile) {
      return {
        formData: savedProfile.formData,
        selectedPersonalities: savedProfile.selectedPersonalities,
      };
    }

    const petSummary = getPetById(numericPetId);

    if (!petSummary) {
      return {
        formData: initialPetRegisterFormData,
        selectedPersonalities: [],
      };
    }

    return {
      formData: {
        ...initialPetRegisterFormData,
        name: petSummary.name,
        species: petSummary.species,
        profilePhoto: petSummary.photo,
      },
      selectedPersonalities: [],
    };
  })();

  const { formData, selectedPersonalities } = profileState;
  const editPath = Number.isFinite(numericPetId) ? routes.pets.edit.build(numericPetId) : undefined;

  const activeOptions = petPersonalityOptions.filter((option) =>
    selectedPersonalities.includes(option.id),
  );

  // TODO: Isso deve vir do back, talvez ;)
  const healthItems: PetProfileFact[] = [
    { label: 'Vacinado', value: formData.vaccinated },
    { label: 'Castrado', value: formData.neutered },
    { label: 'Vermifugado', value: formData.dewormed },
    { label: 'Necessita de cuidados de saude', value: formData.needsHealthCare },
    { label: 'Limitacao fisica', value: formData.physicalLimitation },
    { label: 'Limitacao visual', value: formData.visualLimitation },
    { label: 'Limitacao auditiva', value: formData.hearingLimitation },
  ].map((item) => ({
    ...item,
    value: item.value ? 'Sim' : 'Nao',
  }));

  const locationItems: PetProfileFact[] = [
    { label: 'Tutor', value: formData.tutor },
    { label: 'Abrigo', value: formData.shelter },
    { label: 'Cidade', value: formData.city },
    { label: 'Contato', value: formData.contact },
  ];

  return (
    <section className="mx-auto w-full max-w-[1320px] px-1 pb-16 pt-4">
      {displayMessage && (
        <div
          className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <p className="text-sm font-medium text-emerald-700">{displayMessage}</p>
        </div>
      )}
      <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <PetProfileHero formData={formData} />

        <div className="p-5 lg:p-6">
          <div className="space-y-4">
            <PetProfileOverview formData={formData} />
            <PetProfileGallery
              editPath={editPath}
              name={formData.name}
              photos={formData.galleryPhotos}
            />
          </div>

          <div className="mt-4 space-y-3">
            <PetProfileSection title="Saude">
              <PetProfileFactGrid items={healthItems} />
            </PetProfileSection>

            <PetProfileSection title="Comportamento">
              <PetProfilePersonalityList options={activeOptions} />
            </PetProfileSection>

            <PetProfileSection title="Localizacao">
              <PetProfileFactGrid
                columnsClassName="sm:grid-cols-2 lg:grid-cols-4"
                items={locationItems}
              />
            </PetProfileSection>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PetPersonalityProfilePage;
