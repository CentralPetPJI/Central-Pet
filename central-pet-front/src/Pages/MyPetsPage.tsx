import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatPetSpecies } from '@/lib/formatters';
import { getLocalId, getPetProfileById, getStoredPets } from '@/storage/pets';
import { routes } from '@/routes';
import { mapPetApiResponseToPetListItem } from '@/Models/pet-mapper';
import type { PetApiResponse, PetListItem } from '@/Models/pet';

const statusLabelMap: Record<string, string> = {
  AVAILABLE: 'Disponivel',
  IN_PROCESS: 'Em processo',
  ADOPTED: 'Adotado',
  UNAVAILABLE: 'Indisponivel',
};

/**
 * Retorna o ID apropriado para uso em rotas locais.
 * Se houver mapeamento (pet cadastrado via frontend), usa o localId.
 * Caso contrário, retorna o ID do backend como está.
 */
function getPetRouteId(backendId: string): string | number {
  const localId = getLocalId(backendId);
  return localId ?? backendId;
}

export default function MyPetsPage() {
  const { currentUser, isLoading: isAuthLoading } = useAuth();
  const [pets, setPets] = useState<PetListItem[]>([]);
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
        setErrorMessage(null);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await api.get<{ data: PetApiResponse[] }>('/pets', {
          params: {
            responsibleUserId: currentUser.id,
          },
        });

        if (!isMounted) {
          return;
        }

        const scopedPets = response.data.data.filter(
          (pet) => !pet.responsibleUserId || pet.responsibleUserId === currentUser.id,
        );

        // Converte para PetListItem mantendo o ID original do backend
        const normalizedPets = scopedPets.map((pet) =>
          mapPetApiResponseToPetListItem({
            ...pet,
            adoptionStatus: pet.adoptionStatus ?? 'AVAILABLE',
          }),
        );

        setPets(normalizedPets);
      } catch {
        if (!isMounted) {
          return;
        }

        // Alternativa: usar localStorage quando o backend não estiver disponível
        try {
          const localPets = getStoredPets().filter(
            (pet) => pet.responsibleUserId === currentUser.id,
          );

          // Converter Pet[] do localStorage para MyPetItem[] esperado
          const formattedPets: PetListItem[] = localPets.map((pet) => {
            // Busca o perfil completo para pegar dados adicionais
            const profile = getPetProfileById(pet.id);

            return {
              id: String(pet.id),
              name: pet.name,
              species: pet.species,
              breed: profile?.formData.breed,
              city: profile?.formData.city,
              state: profile?.formData.state,
              adoptionStatus: 'AVAILABLE', // Default para pets locais
            };
          });

          setPets(formattedPets);
          setErrorMessage(null); // Limpa mensagem de erro se localStorage funcionar
        } catch {
          setErrorMessage('Nao foi possivel carregar os pets cadastrados.');
        }
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

              <Link
                to={routes.pets.detail.build(getPetRouteId(pet.id))}
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
