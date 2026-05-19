import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { formatPetSpecies } from '@/lib/formatters';
import { routes } from '@/routes';
import type { PetListItem } from '@/Models/pet';
import { usePetRegistryStore } from '@/storage';

const statusLabelMap: Record<string, string> = {
  AVAILABLE: 'Disponível',
  ADOPTED: 'Adotado',
  UNAVAILABLE: 'Indisponível',
};

export default function MyPetsPage() {
  const { currentUser, isLoading: isAuthLoading } = useAuth();
  const { myPets, isMyPetsLoading, myPetsError, actions } = usePetRegistryStore();
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);
  const [deletingPetId, setDeletingPetId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthLoading || !currentUser?.id) return;

    void actions.fetchMyPets(currentUser.id);
  }, [currentUser?.id, isAuthLoading, actions]);

  const handleDeletePet = async (pet: PetListItem) => {
    const confirmed = window.confirm(`Tem certeza que deseja excluir o pet "${pet.name}"?`);

    if (!confirmed) {
      return;
    }

    setDeleteErrorMessage(null);
    setDeletingPetId(pet.id);

    try {
      await actions.deletePet(pet.id);
    } catch {
      setDeleteErrorMessage('Não foi possível excluir o pet. Tente novamente.');
    } finally {
      setDeletingPetId(null);
    }
  };

  const isLoading = isMyPetsLoading || isAuthLoading;
  const pets = myPets;
  const errorMessage = myPetsError;

  return (
    <section className="w-full px-1 pb-8 pt-4 lg:px-0 lg:pt-5">
      <div className="mb-6 flex flex-col gap-3 rounded-3xl bg-linear-to-r from-emerald-50 via-white to-cyan-50 p-5 shadow-sm ring-1 ring-slate-200 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Gestao de pets
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Meus pets cadastrados</h1>
        </div>

        <Link
          to={routes.pets.new.path}
          className="inline-flex items-center justify-center rounded-full bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
        >
          Cadastrar novo pet
        </Link>
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
          Carregando pets...
        </div>
      ) : null}

      {!isLoading && errorMessage ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">
          {errorMessage}
        </div>
      ) : null}

      {!isLoading && !errorMessage && deleteErrorMessage ? (
        <div className="mb-4 rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">
          {deleteErrorMessage}
        </div>
      ) : null}

      {!isLoading && !errorMessage && pets.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Nenhum pet cadastrado</h2>
          <p className="mt-2 text-sm text-slate-600">
            Quando você cadastrar um pet, ele aparecerá aqui.
          </p>
        </div>
      ) : null}

      {!isLoading && !errorMessage && pets.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pets.map((pet) => (
            <article
              key={pet.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{pet.name}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {formatPetSpecies(pet.species)}
                    {pet.breed ? ` • ${pet.breed}` : ''}
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {statusLabelMap[pet.adoptionStatus] ?? pet.adoptionStatus}
                </span>
              </div>

              <p className="mt-4 text-sm text-slate-500">
                {pet.city ?? 'Cidade nao informada'}
                {pet.state ? `/${pet.state}` : ''}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  to={routes.pets.detail.build(pet.id)}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
                >
                  Ver perfil
                </Link>
                <button
                  type="button"
                  onClick={() => void handleDeletePet(pet)}
                  disabled={deletingPetId === pet.id}
                  className="inline-flex items-center justify-center rounded-full border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {deletingPetId === pet.id ? 'Excluindo...' : 'Excluir pet'}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
