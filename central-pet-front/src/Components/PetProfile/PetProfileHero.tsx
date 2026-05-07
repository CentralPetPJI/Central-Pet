import type { PetRegisterFormData } from '@/storage/pets';
import { formatPetSex, formatPetSize } from '@/lib/formatters';
import { formatPetAge } from '@/lib/pet-age';

interface PetProfileHeroProps {
  formData: PetRegisterFormData;
  locationText?: string;
}

const PetProfileHero = ({ formData, locationText }: PetProfileHeroProps) => (
  <div className="bg-linear-to-r from-emerald-500 via-cyan-500 to-sky-500 px-5 py-7 text-white lg:px-6">
    <h1 className="mt-3 text-3xl font-black tracking-tight lg:text-4xl">{formData.name}</h1>
    <p className="mt-2 max-w-3xl text-sm leading-6 text-cyan-50">
      {formatPetAge(formData.age)} • {formData.breed} • {formatPetSex(formData.sex)} • Porte{' '}
      {formatPetSize(formData.size)}
    </p>
    {locationText ? (
      <div className="mt-4">
        <span className="inline-flex rounded-full bg-white/16 px-3 py-1 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur-xs">
          {locationText}
        </span>
      </div>
    ) : null}
  </div>
);

export default PetProfileHero;
