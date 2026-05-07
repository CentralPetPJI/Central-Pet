import dogImage from '@/assets/image/dog.png';
import type { PetRegisterFormData } from '@/storage/pets';
import PetProfileFactGrid, {
  type PetProfileFact,
} from '@/Components/PetProfile/PetProfileFactGrid';
import { formatPetSex, formatPetSize } from '@/lib/formatters';
import { formatPetAge } from '@/lib/pet-age';

interface PetProfileOverviewProps {
  formData: PetRegisterFormData;
  locationText?: string;
}

const PetProfileOverview = ({ formData, locationText }: PetProfileOverviewProps) => {
  const overviewItems: PetProfileFact[] = [
    { label: 'Microchip', value: formData.microchipped ? 'Sim' : 'Nao' },
  ];
  const profilePhotoSrc = formData.profilePhoto || dogImage;

  return (
    <section className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
        <img
          src={profilePhotoSrc}
          alt={`Foto de perfil de ${formData.name}`}
          className="h-full min-h-80 w-full object-cover"
          onError={(event) => {
            if (event.currentTarget.src.endsWith(dogImage)) {
              return;
            }

            event.currentTarget.src = dogImage;
          }}
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 lg:p-5">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
            {formatPetSex(formData.sex)}
          </span>
          <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-800">
            Porte {formatPetSize(formData.size)}
          </span>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
            {formatPetAge(formData.age)}
          </span>
          <span className="rounded-full bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-700">
            {formData.breed}
          </span>
          {locationText ? (
            <span className="rounded-full bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-800">
              {locationText}
            </span>
          ) : null}
        </div>

        <div className="mt-4">
          <PetProfileFactGrid columnsClassName="sm:grid-cols-2" items={overviewItems} />
        </div>
      </div>
    </section>
  );
};

export default PetProfileOverview;
