import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { isDevelopment } from '@/lib/dev-mode';
import PetRegisterActions from '@/Components/PetRegister/PetRegisterActions';
import PetRegisterBehaviorSection from '@/Components/PetRegister/PetRegisterBehaviorSection';
import PetRegisterHeader from '@/Components/PetRegister/PetRegisterHeader';
import PetRegisterHealthSection from '@/Components/PetRegister/PetRegisterHealthSection';
import PetRegisterInfoSection from '@/Components/PetRegister/PetRegisterInfoSection';
import PetRegisterLocationSection from '@/Components/PetRegister/PetRegisterLocationSection';
import PetRegisterPhotosSection from '@/Components/PetRegister/PetRegisterPhotosSection';
import { saveIdMapping } from '@/Mocks/PetIdMapping';
import { petPersonalityStorageKey } from '@/Mocks/PetPersonalityOptions';
import {
  initialPetRegisterFormData,
  petRegisterFormSchema,
  petRegisterStorageKey,
  type PetRegisterFormData,
} from '@/Mocks/PetRegisterFormMock';
import {
  buildPetFromRegisterForm,
  buildRegisterFormDataFromPet,
  getPetById,
  getPetProfileById,
  getStoredPets,
  savePet,
} from '@/Mocks/PetsStorage';
import { routes } from '@/routes';

type FormErrors = Partial<Record<keyof PetRegisterFormData, string>>;
type ValidationIssue = {
  path: PropertyKey[];
  message: string;
};

interface RegisterPageInitialState {
  formData: PetRegisterFormData;
  selectedPersonalities: string[];
}

const getInitialRegisterPageState = (petId?: number): RegisterPageInitialState => {
  if (typeof petId === 'number' && Number.isFinite(petId)) {
    const savedProfile = getPetProfileById(petId);

    if (savedProfile) {
      return {
        formData: savedProfile.formData,
        selectedPersonalities: savedProfile.selectedPersonalities,
      };
    }

    const petSummary = getPetById(petId);

    if (petSummary) {
      return {
        formData: buildRegisterFormDataFromPet(petSummary),
        selectedPersonalities: [],
      };
    }
  }

  window.localStorage.removeItem(petRegisterStorageKey);
  window.localStorage.removeItem(petPersonalityStorageKey);

  return {
    formData: initialPetRegisterFormData,
    selectedPersonalities: [],
  };
};

interface PetRegisterFormProps {
  petId?: number;
}

const PetRegisterForm = ({ petId }: PetRegisterFormProps) => {
  const navigate = useNavigate();
  const { currentUser, isLoading: isAuthLoading } = useAuth();
  const initialState = getInitialRegisterPageState(petId);
  const [formData, setFormData] = useState<PetRegisterFormData>(initialState.formData);
  const [selectedPersonalities, setSelectedPersonalities] = useState<string[]>(
    initialState.selectedPersonalities,
  );
  const [saveMessage, setSaveMessage] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const latestPetPath = getStoredPets()[0]
    ? routes.pets.detail.build(getStoredPets()[0].id)
    : routes.pets.new.path;
  const isEditMode = typeof petId === 'number' && Number.isFinite(petId);

  const updateField = <K extends keyof PetRegisterFormData>(
    field: K,
    value: PetRegisterFormData[K],
  ) => {
    setFormErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      const updatedErrors = { ...currentErrors };
      delete updatedErrors[field];
      return updatedErrors;
    });

    setFormData((currentData) => {
      const updatedData = { ...currentData, [field]: value };
      window.localStorage.setItem(petRegisterStorageKey, JSON.stringify(updatedData));

      return updatedData;
    });
  };

  const togglePersonality = (personalityId: string) => {
    setSelectedPersonalities((currentOptions) => {
      const updatedOptions = currentOptions.includes(personalityId)
        ? currentOptions.filter((optionId) => optionId !== personalityId)
        : [...currentOptions, personalityId];

      window.localStorage.setItem(petPersonalityStorageKey, JSON.stringify(updatedOptions));

      return updatedOptions;
    });
  };

  const readFilesAsDataUrls = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return [];
    }

    return Promise.all(
      Array.from(files).map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
            reader.readAsDataURL(file);
          }),
      ),
    );
  };

  const handleProfilePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const [photo] = await readFilesAsDataUrls(event.target.files);

    if (!photo) {
      return;
    }

    updateField('profilePhoto', photo);
  };

  const handleGalleryPhotosChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const photos = await readFilesAsDataUrls(event.target.files);

    if (photos.length === 0) {
      return;
    }

    updateField('galleryPhotos', photos);
  };

  const removeGalleryPhoto = (photoIndex: number) => {
    updateField(
      'galleryPhotos',
      formData.galleryPhotos.filter((_, index) => index !== photoIndex),
    );
  };

  const mapIssuesToErrors = (issues: ValidationIssue[]): FormErrors =>
    issues.reduce<FormErrors>((errors, issue) => {
      const fieldName = issue.path[0];

      if (typeof fieldName === 'string' && !(fieldName in errors)) {
        errors[fieldName as keyof PetRegisterFormData] = issue.message;
      }

      return errors;
    }, {});

  const handleSavePet = async () => {
    if (isAuthLoading) {
      setSaveMessage('Carregando usuario atual. Tente novamente em instantes.');
      return;
    }

    const resolvedUserId = currentUser?.id ?? (isDevelopment() ? 'dev-user' : undefined);
    if (!resolvedUserId) {
      setSaveMessage('Nao foi possivel identificar o usuario atual.');
      return;
    }

    const normalizedFormData = {
      ...formData,
      name: formData.name.trim(),
      breed: formData.breed.trim() || 'SRD',
      age: formData.age.trim(),
      tutor: formData.tutor.trim(),
      shelter: formData.shelter.trim(),
      city: formData.city.trim(),
      contact: formData.contact.trim(),
    };
    const validationResult = petRegisterFormSchema.safeParse(normalizedFormData);

    if (!validationResult.success) {
      setFormErrors(mapIssuesToErrors(validationResult.error.issues));
      setSaveMessage('');
      return;
    }

    setFormErrors({});
    let savedPetId: number | undefined;
    let savedOnBackend = false;

    try {
      const backendPayload = {
        profilePhoto: validationResult.data.profilePhoto,
        galleryPhotos: validationResult.data.galleryPhotos ?? [],
        name: validationResult.data.name,
        age: validationResult.data.age,
        species: validationResult.data.species, // 'dog' | 'cat'
        breed: validationResult.data.breed,
        sex: validationResult.data.sex, // 'Macho' | 'Femea'
        size: validationResult.data.size, // 'Pequeno' | 'Medio' | 'Grande'
        microchipped: validationResult.data.microchipped,
        tutor: validationResult.data.tutor,
        shelter: validationResult.data.shelter,
        city: validationResult.data.city,
        contact: validationResult.data.contact,
        vaccinated: validationResult.data.vaccinated,
        neutered: validationResult.data.neutered,
        dewormed: validationResult.data.dewormed,
        needsHealthCare: validationResult.data.needsHealthCare,
        physicalLimitation: validationResult.data.physicalLimitation,
        visualLimitation: validationResult.data.visualLimitation,
        hearingLimitation: validationResult.data.hearingLimitation,
        selectedPersonalities: selectedPersonalities,
        responsibleUserId: resolvedUserId,
      };

      const response = await api.post<{ message: string; data: { id: string } }>(
        '/pets',
        backendPayload,
      );

      const backendId = response.data.data.id;

      // Backend retorna UUID, mas frontend usa IDs numéricos
      // Gera ID local e salva o mapeamento para sincronização
      const currentPets = getStoredPets();
      savedPetId = currentPets.reduce((highestId, pet) => Math.max(highestId, pet.id), 0) + 1;

      saveIdMapping(savedPetId, backendId);

      savedOnBackend = true;
    } catch {
      // Erro ao salvar no backend - continua com salvamento local
      savedPetId = undefined;
    }

    const petToSave = buildPetFromRegisterForm(
      validationResult.data,
      selectedPersonalities,
      savedPetId,
      resolvedUserId,
    );
    savePet(petToSave, {
      id: petToSave.id,
      formData: validationResult.data,
      selectedPersonalities,
    });

    setFormData(validationResult.data);
    window.localStorage.removeItem(petRegisterStorageKey);
    window.localStorage.removeItem(petPersonalityStorageKey);
    const successMessage = isEditMode
      ? 'Pet atualizado com sucesso.'
      : savedOnBackend
        ? 'Pet salvo com sucesso.'
        : 'Pet salvo localmente com sucesso.';

    navigate(routes.pets.detail.build(petToSave.id), {
      state: { successMessage },
    });
  };

  return (
    <section className="mx-auto w-full max-w-345 px-1 pb-16 pt-4">
      <div className="rounded-[1.75rem] bg-linear-to-br from-cyan-100 via-white to-emerald-100 p-5 lg:p-6 shadow-[0_20px_60px_rgba(14,116,144,0.10)]">
        <PetRegisterHeader isEditMode={isEditMode} />
        <PetRegisterActions
          isEditMode={isEditMode}
          latestPetPath={latestPetPath}
          onSave={handleSavePet}
          saveMessage={saveMessage}
          selectedPersonalitiesCount={selectedPersonalities.length}
        />
        <PetRegisterPhotosSection
          formData={formData}
          profilePhotoError={formErrors.profilePhoto}
          onGalleryPhotosChange={handleGalleryPhotosChange}
          onProfilePhotoChange={handleProfilePhotoChange}
          onRemoveGalleryPhoto={removeGalleryPhoto}
        />

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <PetRegisterInfoSection
            formData={formData}
            formErrors={formErrors}
            onUpdateField={updateField}
          />
          <PetRegisterLocationSection
            formData={formData}
            formErrors={formErrors}
            onUpdateField={updateField}
          />
        </div>

        <PetRegisterHealthSection formData={formData} onUpdateField={updateField} />
        <PetRegisterBehaviorSection
          selectedPersonalities={selectedPersonalities}
          onTogglePersonality={togglePersonality}
        />
      </div>
    </section>
  );
};

export default PetRegisterForm;
