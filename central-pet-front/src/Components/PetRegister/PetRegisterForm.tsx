import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { mapPetApiResponseToRegisterFormData } from '@/Models/pet-mapper';
import type { PetApiResponse } from '@/Models/pet';
import PetRegisterActions from '@/Components/PetRegister/PetRegisterActions';
import PetRegisterBehaviorSection from '@/Components/PetRegister/PetRegisterBehaviorSection';
import PetRegisterHeader from '@/Components/PetRegister/PetRegisterHeader';
import PetRegisterHealthSection from '@/Components/PetRegister/PetRegisterHealthSection';
import PetRegisterInfoSection from '@/Components/PetRegister/PetRegisterInfoSection';
import PetRegisterPhotosSection from '@/Components/PetRegister/PetRegisterPhotosSection';
import {
  buildPetSubmitPayload,
  isProfileLocationComplete,
  resolvePersonalitySelection,
} from '@/Components/PetRegister/pet-register-payload';
import { ensurePublicId, resolveBackendId } from '@/storage/pets';
import {
  mergePetPersonalityOptionsWithIcons,
  petPersonalityOptions,
  petPersonalityStorageKey,
  type PetPersonalityApiOption,
  type PetPersonalityOption,
} from '@/storage/pets';
import {
  petRegisterFormSchema,
  petRegisterStorageKey,
  type PetRegisterFormData,
} from '@/storage/pets';
import { routes } from '@/routes';

interface PetRegisterFormProps {
  petId?: string;
}

const PetRegisterForm = ({ petId }: PetRegisterFormProps) => {
  const navigate = useNavigate();
  const { currentUser, isLoading: isAuthLoading } = useAuth();
  const [personalityOptions, setPersonalityOptions] =
    useState<PetPersonalityOption[]>(petPersonalityOptions);
  const [selectedPersonalities, setSelectedPersonalities] = useState<string[]>([]);
  const [isInitializing, setIsInitializing] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const isEditMode = Boolean(petId);

  const methods = useForm<PetRegisterFormData>({
    resolver: zodResolver(petRegisterFormSchema),
  });

  const { reset, handleSubmit, watch, setValue } = methods;
  const formData = watch();
  const responsibleLocation = {
    city: currentUser?.city?.trim() ?? '',
    state: currentUser?.state?.trim() ?? '',
  };
  const isResponsibleLocationMissing = !isProfileLocationComplete(responsibleLocation);

  useEffect(() => {
    let isMounted = true;

    const loadPersonalityOptions = async () => {
      try {
        const response = await api.get<{ data: PetPersonalityApiOption[] }>('/personality-traits');

        if (isMounted) {
          setPersonalityOptions(mergePetPersonalityOptionsWithIcons(response.data.data));
        }
      } catch {
        if (isMounted) {
          setPersonalityOptions(petPersonalityOptions);
        }
      }
    };

    void loadPersonalityOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    window.localStorage.removeItem(petRegisterStorageKey);
    window.localStorage.removeItem(petPersonalityStorageKey);

    if (!isEditMode || !petId) {
      reset();
      setSelectedPersonalities([]);
      return;
    }

    let isMounted = true;
    const loadPetForEdit = async () => {
      setIsInitializing(true);
      setSaveMessage('');

      try {
        const backendId = resolveBackendId(petId);
        const response = await api.get<{ data: PetApiResponse }>(`/pets/${String(backendId)}`);

        if (!isMounted) {
          return;
        }

        const petData = response.data.data;
        const mappedData = mapPetApiResponseToRegisterFormData(petData);
        reset(mappedData);
        setSelectedPersonalities(petData.selectedPersonalities ?? []);
      } catch {
        if (!isMounted) {
          return;
        }
        setSaveMessage('Nao foi possivel carregar o pet para edicao.');
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    void loadPetForEdit();

    return () => {
      isMounted = false;
    };
  }, [isEditMode, petId, reset]);

  const togglePersonality = (personalityId: string) => {
    setSelectedPersonalities((currentOptions) => {
      const updatedOptions = resolvePersonalitySelection(
        currentOptions,
        personalityId,
        personalityOptions,
      );

      window.localStorage.setItem(petPersonalityStorageKey, JSON.stringify(updatedOptions));

      return updatedOptions;
    });
  };

  const handleSavePet = async (data: PetRegisterFormData) => {
    if (isAuthLoading || isInitializing) {
      setSaveMessage('Carregando usuario atual. Tente novamente em instantes.');
      return;
    }

    if (!currentUser?.id) {
      setSaveMessage('Nao foi possivel identificar o usuario atual.');
      return;
    }

    if (isResponsibleLocationMissing) {
      setSaveMessage('Atualize cidade e estado no seu perfil antes de publicar este pet.');
      return;
    }

    const normalizedFormData = buildPetSubmitPayload(data, selectedPersonalities);

    try {
      let response: { data: { message: string; data: PetApiResponse } };

      if (isEditMode && petId) {
        const backendId = resolveBackendId(petId);
        response = await api.patch<{ message: string; data: PetApiResponse }>(
          `/pets/${String(backendId)}`,
          normalizedFormData,
        );
      } else {
        response = await api.post<{ message: string; data: PetApiResponse }>(
          '/pets',
          normalizedFormData,
        );
      }

      const publicId = ensurePublicId(response.data.data.id, response.data.data.name);

      window.localStorage.removeItem(petRegisterStorageKey);
      window.localStorage.removeItem(petPersonalityStorageKey);

      navigate(routes.pets.detail.build(publicId), {
        state: {
          successMessage: isEditMode ? 'Pet atualizado com sucesso.' : 'Pet salvo com sucesso.',
        },
      });
    } catch {
      setSaveMessage('Nao foi possivel salvar o pet no momento.');
    }
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

    setValue('profilePhoto', photo, { shouldDirty: true, shouldValidate: true });
  };

  const handleGalleryPhotosChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const photos = await readFilesAsDataUrls(event.target.files);

    if (photos.length === 0) {
      return;
    }

    setValue('galleryPhotos', [...(formData.galleryPhotos || []), ...photos], {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const removeGalleryPhoto = (photoIndex: number) => {
    if (!formData.galleryPhotos || photoIndex < 0 || photoIndex >= formData.galleryPhotos.length) {
      return;
    }

    setValue(
      'galleryPhotos',
      formData.galleryPhotos.filter((_, index) => index !== photoIndex),
      { shouldDirty: true, shouldValidate: true },
    );
  };

  const onErrors = (_errors: unknown) => {
    // caso de erro no formulario, podemos colocar isso no onSubimit
    //  onSubmit={handleSubmit(handleSavePet, onErrors)}
  };
  return (
    <FormProvider {...methods}>
      <form
        //onSubmit={handleSubmit(handleSavePet)}
        onSubmit={handleSubmit(handleSavePet, onErrors)}
        className="mx-auto w-full max-w-345 px-1 pb-16 pt-4"
      >
        <div className="rounded-[1.75rem] bg-linear-to-br from-cyan-100 via-white to-emerald-100 p-5 lg:p-6 shadow-[0_20px_60px_rgba(14,116,144,0.10)]">
          <PetRegisterHeader isEditMode={isEditMode} />
          <PetRegisterActions
            isEditMode={isEditMode}
            petId={petId}
            saveMessage={saveMessage}
            selectedPersonalitiesCount={selectedPersonalities.length}
            isSaveDisabled={isAuthLoading || isInitializing || isResponsibleLocationMissing}
          />
          <PetRegisterPhotosSection
            onGalleryPhotosChange={handleGalleryPhotosChange}
            onProfilePhotoChange={handleProfilePhotoChange}
            onRemoveGalleryPhoto={removeGalleryPhoto}
          />

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start">
            <PetRegisterInfoSection />
            <PetRegisterHealthSection />
          </div>
          <PetRegisterBehaviorSection
            options={personalityOptions}
            selectedPersonalities={selectedPersonalities}
            onTogglePersonality={togglePersonality}
          />
        </div>
      </form>
    </FormProvider>
  );
};

export default PetRegisterForm;
