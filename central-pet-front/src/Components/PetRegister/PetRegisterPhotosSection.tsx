import { useFormContext } from 'react-hook-form';
import FieldError from '@/Components/Form/FieldError';
import FormSection from '@/Components/Form/FormSection';
import type { PetRegisterFormData } from '@/storage/pets';
import React from 'react';

interface PetRegisterPhotosSectionProps {
  onGalleryPhotosChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onProfilePhotoChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onRemoveGalleryPhoto: (photoIndex: number) => void;
}

const PetRegisterPhotosSection = ({
  onGalleryPhotosChange,
  onProfilePhotoChange,
  onRemoveGalleryPhoto,
}: PetRegisterPhotosSectionProps) => {
  const {
    watch,
    formState: { errors },
  } = useFormContext<PetRegisterFormData>();

  const formData = watch();

  return (
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
              onChange={onProfilePhotoChange}
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-sky-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-sky-700"
            />
            <FieldError message={errors.profilePhoto?.message} />
          </label>
        </div>

        <div>
          <span className="mb-3 block text-sm font-medium text-slate-700">Galeria de fotos</span>
          <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-5">
            <p className="text-sm leading-6 text-slate-600">
              Envie imagens extras para mostrar rotina, postura, pelagem ou detalhes do pet.
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onGalleryPhotosChange}
              className="mt-4 block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-emerald-700"
            />
          </div>

          {formData.galleryPhotos && formData.galleryPhotos.length > 0 ? (
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
                    onClick={() => onRemoveGalleryPhoto(index)}
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
  );
};

export default PetRegisterPhotosSection;
