import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import PetProfileFactGrid, {
  type PetProfileFact,
} from '@/Components/PetProfile/PetProfileFactGrid';
import PetProfileGallery from '@/Components/PetProfile/PetProfileGallery';
import PetProfileHero from '@/Components/PetProfile/PetProfileHero';
import PetProfileOverview from '@/Components/PetProfile/PetProfileOverview';
import PetProfilePersonalityList from '@/Components/PetProfile/PetProfilePersonalityList';
import PetProfileSection from '@/Components/PetProfile/PetProfileSection';
import { mapPetApiResponseToRegisterFormData } from '@/Models/pet-mapper';
import type { PetApiResponse } from '@/Models/pet';
import { petPersonalityOptions } from '@/storage/pets';
import { type PetRegisterFormData } from '@/storage/pets';
import { resolveBackendId } from '@/storage/pets';
import { routes } from '@/routes';
import AdoptionRequestArea from '@/Pages/Pet/AdoptionRequestArea.tsx';

const PetPersonalityProfilePage = () => {
  const { petId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [displayMessage, setDisplayMessage] = useState(location.state?.successMessage ?? '');
  const [formData, setFormData] = useState<PetRegisterFormData>();
  const [petApi, setPetApi] = useState<PetApiResponse | undefined>(undefined);
  const [selectedPersonalities, setSelectedPersonalities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

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
  useEffect(() => {
    if (!petId) {
      setIsLoading(false);
      setIsNotFound(true);
      return;
    }

    let isMounted = true;
    const loadPet = async () => {
      setIsLoading(true);
      setIsNotFound(false);

      try {
        const backendId = resolveBackendId(petId);
        const response = await api.get<{ data: PetApiResponse }>(`/pets/${String(backendId)}`);

        if (!isMounted) {
          return;
        }

        setPetApi(response.data.data);
        setFormData(mapPetApiResponseToRegisterFormData(response.data.data));
        setSelectedPersonalities(response.data.data.selectedPersonalities ?? []);
      } catch {
        if (!isMounted) {
          return;
        }

        setIsNotFound(true);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadPet();

    return () => {
      isMounted = false;
    };
  }, [petId]);

  if (!formData) {
    return null;
  }

  const isOwner = Boolean(currentUser?.id && petApi && currentUser.id === petApi.responsibleUserId);
  const editPath = petId && isOwner ? routes.pets.edit.build(petId) : undefined;

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
      {isLoading ? (
        <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Carregando perfil do pet...
        </div>
      ) : null}
      {isNotFound && !isLoading ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4" role="alert">
          <p className="text-sm font-medium text-red-700">
            Pet não encontrado. Verifique se o ID está correto ou tente novamente mais tarde.
          </p>
        </div>
      ) : null}
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
      {!isNotFound ? (
        <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <PetProfileHero formData={formData} />

          {/* Solicitar adoção: botão e formulário de consentimento */}
          <div className="p-4 lg:p-5 border-b border-slate-100 bg-white">
            {currentUser ? (
              !isOwner ? (
                <AdoptionRequestArea
                  petId={petId}
                  formData={formData}
                  setDisplayMessage={setDisplayMessage}
                />
              ) : null
            ) : (
              <div className="flex items-center gap-3">
                {/*TODO: Usuários anônimos podem ver apenas ONGs*/}
                <p className="text-sm text-slate-600">
                  Faça login para enviar uma solicitação de adoção.
                </p>
                <a
                  className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white"
                  href={routes.login.path}
                >
                  Entrar
                </a>
              </div>
            )}
          </div>

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
      ) : null}
    </section>
  );
};

export default PetPersonalityProfilePage;
