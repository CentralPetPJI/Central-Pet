import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FieldError from '@/Components/Form/FieldError';
import FormCheckbox from '@/Components/Form/FormCheckbox';
import FormField from '@/Components/Form/FormField';
import FormInput from '@/Components/Form/FormInput';
import FormSection from '@/Components/Form/FormSection';
import FormSelect from '@/Components/Form/FormSelect';
import SelectableCard from '@/Components/Form/SelectableCard';
import { petPersonalityOptions, petPersonalityStorageKey } from '@/Mocks/PetPersonalityOptions';
import {
  initialPetRegisterFormData,
  petRegisterFormSchema,
  petRegisterStorageKey,
  petSpeciesOptions,
  petSexOptions,
  petSizeOptions,
  type PetRegisterFormData,
} from '@/Mocks/PetRegisterFormMock';
import {
  buildRegisterFormDataFromPet,
  buildPetFromRegisterForm,
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

interface PetPersonalityRegisterPageContentProps {
  petId?: number;
}

const PetPersonalityRegisterPageContent = ({ petId }: PetPersonalityRegisterPageContentProps) => {
  const navigate = useNavigate();
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

  const handleSavePet = () => {
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
    const petToSave = buildPetFromRegisterForm(
      validationResult.data,
      selectedPersonalities,
      isEditMode ? petId : undefined,
    );
    savePet(petToSave, {
      id: petToSave.id,
      formData: validationResult.data,
      selectedPersonalities,
    });

    setFormData(validationResult.data);
    window.localStorage.removeItem(petRegisterStorageKey);
    window.localStorage.removeItem(petPersonalityStorageKey);
    setSaveMessage(isEditMode ? 'Pet atualizado com sucesso.' : 'Pet salvo com sucesso.');
    navigate(routes.pets.detail.build(petToSave.id));
  };

  return (
    <section className="mx-auto w-full max-w-345 px-1 pb-16 pt-4">
      <div className="rounded-[1.75rem] bg-linear-to-br from-cyan-100 via-white to-emerald-100 p-5 lg:p-6 shadow-[0_20px_60px_rgba(14,116,144,0.10)]">
        <div className="max-w-4xl">
          <span className="inline-flex rounded-full bg-white/80 px-4 py-1 text-sm font-medium text-cyan-900">
            {isEditMode ? 'Edicao do cadastro' : 'Fluxo do doador'}
          </span>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 lg:text-4xl">
            {isEditMode ? 'Edite o cadastro do pet' : 'Cadastre o pet para adocao'}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 lg:text-base">
            Preencha as informacoes que serao exibidas para adotantes no perfil do pet.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            {selectedPersonalities.length} selecionada(s)
          </span>
          <button
            type="button"
            onClick={handleSavePet}
            className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            {isEditMode ? 'Salvar alteracoes' : 'Salvar pet'}
          </button>
          <Link
            to={latestPetPath}
            className="rounded-full border border-cyan-300 bg-white px-5 py-3 text-sm font-semibold text-cyan-700 transition hover:border-cyan-500 hover:bg-cyan-50"
          >
            Visualizar como adotante
          </Link>
        </div>

        {saveMessage ? (
          <p className="mt-3 text-sm font-medium text-emerald-700">{saveMessage}</p>
        ) : null}

        <FormSection className="mt-6" accentClassName="text-sky-700" eyebrow="Fotos">
          <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
            <div>
              <span className="mb-3 block text-sm font-medium text-slate-700">
                Foto de perfil do pet
              </span>
              <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50">
                <img
                  src={formData.profilePhoto}
                  alt={`Foto de perfil de ${formData.name}`}
                  className="h-56 w-full object-cover"
                />
              </div>
              <label className="mt-3 block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                  Obrigatorio
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhotoChange}
                  className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-sky-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-sky-700"
                />
                <FieldError message={formErrors.profilePhoto} />
              </label>
            </div>

            <div>
              <span className="mb-3 block text-sm font-medium text-slate-700">
                Galeria de fotos
              </span>
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-5">
                <p className="text-sm leading-6 text-slate-600">
                  Envie imagens extras para mostrar rotina, postura, pelagem ou detalhes do pet.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryPhotosChange}
                  className="mt-4 block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-emerald-700"
                />
              </div>

              {formData.galleryPhotos.length > 0 ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {formData.galleryPhotos.map((photo, index) => (
                    <div
                      key={`${photo.slice(0, 30)}-${index}`}
                      className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white"
                    >
                      <img
                        src={photo}
                        alt={`Foto descritiva ${index + 1} de ${formData.name}`}
                        className="h-36 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryPhoto(index)}
                        className="w-full border-t border-slate-200 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                      >
                        Remover foto
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">Nenhuma foto descritiva adicionada.</p>
              )}
            </div>
          </div>
        </FormSection>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <FormSection
            accentClassName="text-cyan-700"
            eyebrow="Informacoes"
            title="Dados basicos do pet"
          >
            <div className="grid gap-3 md:grid-cols-2">
              <FormField label="Nome" error={formErrors.name}>
                <FormInput
                  value={formData.name}
                  onChange={(event) => updateField('name', event.target.value)}
                />
              </FormField>
              <FormField label="Idade" error={formErrors.age}>
                <FormInput
                  value={formData.age}
                  onChange={(event) => updateField('age', event.target.value)}
                />
              </FormField>
              <FormField label="Raca" error={formErrors.breed}>
                <FormInput
                  value={formData.breed}
                  onChange={(event) => updateField('breed', event.target.value)}
                />
              </FormField>
              <FormField label="Especie" error={formErrors.species}>
                <FormSelect
                  value={formData.species}
                  onChange={(event) => updateField('species', event.target.value)}
                >
                  {petSpeciesOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </FormSelect>
              </FormField>
              <FormField label="Sexo">
                <FormSelect
                  value={formData.sex}
                  onChange={(event) => updateField('sex', event.target.value)}
                >
                  {petSexOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </FormSelect>
              </FormField>
              <FormField label="Porte">
                <FormSelect
                  value={formData.size}
                  onChange={(event) => updateField('size', event.target.value)}
                >
                  {petSizeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </FormSelect>
              </FormField>
              <FormCheckbox
                checked={formData.microchipped}
                onChange={(event) => updateField('microchipped', event.target.checked)}
                label="Microchipado"
              />
            </div>
          </FormSection>

          <FormSection
            accentClassName="text-emerald-700"
            eyebrow="Localizacao"
            title="Origem e contato"
          >
            <div className="grid gap-3 md:grid-cols-2">
              <FormField label="Tutor" error={formErrors.tutor}>
                <FormInput
                  accent="emerald"
                  value={formData.tutor}
                  onChange={(event) => updateField('tutor', event.target.value)}
                />
              </FormField>
              <FormField label="Abrigo" error={formErrors.shelter}>
                <FormInput
                  accent="emerald"
                  value={formData.shelter}
                  onChange={(event) => updateField('shelter', event.target.value)}
                />
              </FormField>
              <FormField label="Cidade" error={formErrors.city}>
                <FormInput
                  accent="emerald"
                  value={formData.city}
                  onChange={(event) => updateField('city', event.target.value)}
                />
              </FormField>
              <FormField label="Contato" error={formErrors.contact}>
                <FormInput
                  accent="emerald"
                  value={formData.contact}
                  onChange={(event) => updateField('contact', event.target.value)}
                />
              </FormField>
            </div>
          </FormSection>
        </div>

        <FormSection
          className="mt-4"
          accentClassName="text-rose-700"
          eyebrow="Saude"
          title="Status clinico"
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              ['vaccinated', 'Vacinado'],
              ['neutered', 'Castrado'],
              ['dewormed', 'Vermifugado'],
              ['needsHealthCare', 'Necessita de cuidados de saude'],
              ['physicalLimitation', 'Limitacao fisica'],
              ['visualLimitation', 'Limitacao visual'],
              ['hearingLimitation', 'Limitacao auditiva'],
            ].map(([field, label]) => (
              <FormCheckbox
                key={field}
                accent="rose"
                checked={formData[field as keyof PetRegisterFormData] as boolean}
                onChange={(event) =>
                  updateField(field as keyof PetRegisterFormData, event.target.checked)
                }
                label={label}
              />
            ))}
          </div>
        </FormSection>

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
                onClick={() => togglePersonality(option.id)}
                title={option.title}
              />
            ))}
          </div>
        </FormSection>
      </div>
    </section>
  );
};

const PetPersonalityRegisterPage = () => {
  const { petId } = useParams();
  const numericPetId = Number(petId);
  const resolvedPetId = Number.isFinite(numericPetId) ? numericPetId : undefined;
  const pageKey = resolvedPetId ? `edit-${resolvedPetId}` : 'new';

  return <PetPersonalityRegisterPageContent key={pageKey} petId={resolvedPetId} />;
};

export default PetPersonalityRegisterPage;
