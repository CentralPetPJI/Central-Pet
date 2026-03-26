import dogImage from '@/assets/image/dog.png';
import type { PetRegisterFormData } from '@/Mocks/PetRegisterFormMock';
import PetProfileFactGrid, {
  type PetProfileFact,
} from '@/Components/PetProfile/PetProfileFactGrid';

interface PetProfileOverviewProps {
  formData: PetRegisterFormData;
}

const PetProfileOverview = ({ formData }: PetProfileOverviewProps) => {
  // TODO: Isso deve vir do back, talvez ;)
  const overviewItems: PetProfileFact[] = [
    { label: 'Microchip', value: formData.microchipped ? 'Sim' : 'Não' },
    { label: 'Tutor', value: formData.tutor },
    { label: 'Abrigo', value: formData.shelter },
    { label: 'Cidade', value: formData.city },
  ];
  const profilePhotoSrc = formData.profilePhoto || dogImage;

  return (
    <section className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50">
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

      <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 lg:p-5">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
            {formData.sex}
          </span>
          <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-800">
            Porte {formData.size}
          </span>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
            {formData.age}
          </span>
          <span className="rounded-full bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-700">
            {formData.breed}
          </span>
        </div>

        <div className="mt-4">
          <PetProfileFactGrid columnsClassName="sm:grid-cols-2" items={overviewItems} />
        </div>
      </div>
    </section>
  );
};

export default PetProfileOverview;
