import { Link } from 'react-router-dom';
import PetProfileEmptyState from '@/Components/PetProfile/PetProfileEmptyState';

interface PetProfileGalleryProps {
  editPath: string;
  name: string;
  photos: string[];
}

const PetProfileGallery = ({ editPath, name, photos }: PetProfileGalleryProps) => (
  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 lg:p-5">
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-xl font-bold text-slate-900">Galeria</h2>
      <Link
        to={editPath}
        className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
      >
        Editar cadastro
      </Link>
    </div>
    {photos.length > 0 ? (
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo, index) => (
          <img
            key={`${photo.slice(0, 30)}-${index}`}
            src={photo}
            alt={`Foto descritiva ${index + 1} de ${name}`}
            className="h-40 w-full rounded-[1.25rem] object-cover"
          />
        ))}
      </div>
    ) : (
      <div className="mt-4">
        <PetProfileEmptyState message="Nenhuma foto descritiva adicionada." />
      </div>
    )}
  </div>
);

export default PetProfileGallery;
