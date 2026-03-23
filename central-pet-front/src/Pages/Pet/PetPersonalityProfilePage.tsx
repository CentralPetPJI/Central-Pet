import { useParams } from 'react-router-dom';
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

  const activeOptions = petPersonalityOptions.filter((option) =>
    selectedPersonalities.includes(option.id),
  );

  // TODO: Isso deve vir do back, talvez ;)
  const healthItems: PetProfileFact[] = [
    { label: 'Vacinado', value: formData.vaccinated },
    { label: 'Castrado', value: formData.neutered },
    { label: 'Vermifugado', value: formData.dewormed },
    { label: 'Neccessita de cuidados de saude', value: formData.needsHealthCare },
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
      <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <PetProfileHero formData={formData} />

        <div className="p-5 lg:p-6">
          <div className="space-y-4">
            <PetProfileOverview formData={formData} />
            <PetProfileGallery
              editPath={routes.pets.edit.build(petId ?? '')}
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
