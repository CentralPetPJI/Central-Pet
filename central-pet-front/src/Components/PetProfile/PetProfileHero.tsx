import type { PetRegisterFormData } from '@/storage/pets';

interface PetProfileHeroProps {
  formData: PetRegisterFormData;
}

const PetProfileHero = ({ formData }: PetProfileHeroProps) => (
  <div className="bg-linear-to-r from-emerald-500 via-cyan-500 to-sky-500 px-5 py-7 text-white lg:px-6">
    <h1 className="mt-3 text-3xl font-black tracking-tight lg:text-4xl">{formData.name}</h1>
    <p className="mt-2 max-w-3xl text-sm leading-6 text-cyan-50">
      {formData.age} • {formData.breed} • {formData.sex} • Porte {formData.size}
    </p>
  </div>
);

export default PetProfileHero;
