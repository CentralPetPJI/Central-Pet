import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { routes } from '@/routes';

type MyPetItem = {
  id: string;
  name: string;
  species: string;
  breed?: string;
  city?: string;
  state?: string;
  adoptionStatus: string;
};

const statusLabelMap: Record<string, string> = {
  AVAILABLE: 'Disponivel',
  IN_PROCESS: 'Em processo',
  ADOPTED: 'Adotado',
  UNAVAILABLE: 'Indisponivel',
};

function formatSpecies(species: string) {
  if (species === 'DOG') {
    return 'Cao';
  }

  if (species === 'CAT') {
    return 'Gato';
  }

  return species;
}

export default function MyPetsPage() {
  const { currentUser, isLoading: isAuthLoading } = useAuth();
  const [pets, setPets] = useState<MyPetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadPets = async () => {
      if (isAuthLoading) {
        return;
      }

      if (!currentUser?.id) {
        setPets([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await api.get<{ data: MyPetItem[] }>('/pets', {
          params: {
            responsibleUserId: currentUser.id,
          },
        });

        if (!isMounted) {
          return;
        }

        setPets(response.data.data);
      } catch {
        if (!isMounted) {
          return;
        }

        setErrorMessage('Nao foi possivel carregar os pets cadastrados.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadPets();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.id, isAuthLoading]);

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

      {!isLoading && !errorMessage && pets.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Nenhum pet cadastrado</h2>
          <p className="mt-2 text-sm text-slate-600">
            Quando este usuario cadastrar um pet, ele aparecera aqui.
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
                    {formatSpecies(pet.species)}
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

              <Link
                to={routes.pets.detail.build(pet.id)}
                className="mt-5 inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
              >
                Ver perfil
              </Link>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
