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
import { type PetPersonalityApiOption, type PetPersonalityOption } from '@/storage/pets';
import { type PetRegisterFormData } from '@/storage/pets';
import { resolveBackendId } from '@/storage/pets';
import { routes } from '@/routes';
import AdoptionRequestArea from '@/Pages/Pet/AdoptionRequestArea.tsx';
import { AlertTriangle } from 'lucide-react';
import ReportPetModal from '@/Components/Moderation/ReportPetModal';

const PetPersonalityProfilePage = () => {
  const { petId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [displayMessage, setDisplayMessage] = useState(location.state?.successMessage ?? '');
  const [formData, setFormData] = useState<PetRegisterFormData>();
  const [locationText, setLocationText] = useState('');
  const [petApi, setPetApi] = useState<PetApiResponse | undefined>(undefined);
  const [personalityOptions, setPersonalityOptions] = useState<PetPersonalityOption[]>([]);
  const [selectedPersonalities, setSelectedPersonalities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');

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
        const [response, personalityResponse] = await Promise.all([
          api.get<{ data: PetApiResponse }>(`/pets/${String(backendId)}`),
          api.get<{ data: PetPersonalityApiOption[] }>('/personality-traits').catch(() => null),
        ]);

        if (!isMounted) {
          return;
        }

        const petData = response.data.data;
        const city = petData.city?.trim() ?? '';
        const state = petData.state?.trim() ?? '';
        const normalizedLocation = city && state ? `${city} - ${state}` : city || state;

        setFormData(mapPetApiResponseToRegisterFormData(petData));
        setLocationText(normalizedLocation);
        setSelectedPersonalities(petData.selectedPersonalities ?? []);
        setPersonalityOptions(personalityResponse?.data.data ?? []);
        setPetApi(response.data.data);
      } catch {
        if (!isMounted) {
          return;
        }

        setLocationText('');
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
  const activeOptions = personalityOptions.filter((option) =>
    selectedPersonalities.includes(option.id),
  );
  const personalityEmptyMessage =
    selectedPersonalities.length > 0 && personalityOptions.length === 0
      ? 'Não foi possível carregar as personalidades deste pet.'
      : undefined;

  const handleReportClick = () => {
    if (!currentUser) {
      navigate(routes.login.path);
      return;
    }
    setIsReportModalOpen(true);
  };

  const handleReportConfirm = async (reason: string) => {
    if (!petId) return;

    try {
      await api.post('/moderation/reports', {
        targetType: 'PET',
        targetId: String(resolveBackendId(petId)),
        reason,
      });
      setDisplayMessage('Denúncia enviada com sucesso. Nossa equipe irá analisar.');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erro ao enviar denúncia. Tente novamente.';
      setDisplayMessage(`Falha na denúncia: ${msg}`);
    } finally {
      setIsReportModalOpen(false);
    }
  };

  const handleDeletePet = async () => {
    if (!petApi) {
      return;
    }

    const confirmed = window.confirm(`Tem certeza que deseja excluir o pet "${petApi.name}"?`);

    if (!confirmed) {
      return;
    }

    setDeleteErrorMessage('');
    setIsDeleting(true);

    try {
      await api.delete(`/pets/${petApi.id}`);
      navigate(routes.pets.mine.path);
    } catch {
      setDeleteErrorMessage('Não foi possível excluir o pet. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  // TODO: Isso deve vir do back, talvez ;)
  const healthItems: PetProfileFact[] = [
    { label: 'Vacinado', value: formData.vaccinated },
    { label: 'Castrado', value: formData.neutered },
    { label: 'Vermifugado', value: formData.dewormed },
    { label: 'Necessita de cuidados de saúde', value: formData.needsHealthCare },
    { label: 'Limitacao fisica', value: formData.physicalLimitation },
    { label: 'Limitacao visual', value: formData.visualLimitation },
    { label: 'Limitacao auditiva', value: formData.hearingLimitation },
  ].map((item) => ({
    ...item,
    value: item.value ? 'Sim' : 'Não',
  }));

  return (
    <section className="mx-auto w-full max-w-330 px-1 pb-16 pt-4">
      {isLoading ? (
        <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Carregando perfil do pet...
        </div>
      ) : null}
      {isNotFound && !isLoading ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4" role="alert">
          <p className="text-sm font-medium text-red-700">
            Pet nao encontrado. Verifique se o ID esta correto ou tente novamente mais tarde.
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
      {deleteErrorMessage && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4" role="alert">
          <p className="text-sm font-medium text-red-700">{deleteErrorMessage}</p>
        </div>
      )}
      {!isNotFound ? (
        <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <PetProfileHero formData={formData} locationText={locationText} />

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
              <PetProfileOverview formData={formData} locationText={locationText} />
              <PetProfileGallery
                editPath={editPath}
                name={formData.name}
                photos={formData.galleryPhotos}
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {isOwner && (
                <button
                  type="button"
                  onClick={() => void handleDeletePet()}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isDeleting ? 'Excluindo...' : 'Excluir pet'}
                </button>
              )}
              {!isOwner && (
                <button
                  onClick={handleReportClick}
                  className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Denunciar conteúdo impróprio
                </button>
              )}
            </div>

            <div className="mt-8 space-y-3">
              <PetProfileSection title="Saude">
                <PetProfileFactGrid items={healthItems} />
              </PetProfileSection>

              <PetProfileSection title="Comportamento">
                <PetProfilePersonalityList
                  emptyMessage={personalityEmptyMessage}
                  options={activeOptions}
                />
              </PetProfileSection>
            </div>
          </div>
        </div>
      ) : null}

      <ReportPetModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onConfirm={handleReportConfirm}
        petName={formData.name}
      />
    </section>
  );
};

export default PetPersonalityProfilePage;
