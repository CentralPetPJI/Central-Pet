import type { PetRegisterFormData } from '@/Mocks/PetRegisterFormMock';

interface PetProfileHeroProps {
  formData: PetRegisterFormData;
}

const PetProfileHero = ({ formData }: PetProfileHeroProps) => (
  <div className="bg-linear-to-r from-emerald-500 via-cyan-500 to-sky-500 px-5 py-7 text-white lg:px-6">
    <span className="inline-flex rounded-full bg-white/20 px-4 py-1 text-sm font-medium">
      Fluxo da pessoa física
    </span>
    <h1 className="mt-3 text-3xl font-black tracking-tight lg:text-4xl">{formData.name}</h1>
    <p className="mt-2 max-w-3xl text-sm leading-6 text-cyan-50">
      {formData.age} • {formData.breed} • {formData.sex} • Porte {formData.size}
    </p>
  </div>
);

export default PetProfileHero;
