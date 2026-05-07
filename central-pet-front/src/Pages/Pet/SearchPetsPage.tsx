import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { usePets } from '@/lib/pets';
import { brazilianStates, formatPetSpecies, formatState } from '@/lib/formatters';
import { getPetRouteId } from '@/storage/pets/pet-helpers';
import { routes } from '@/routes';

type SearchFilterKey = 'state' | 'species' | 'sex' | 'size';

const allowedSpecies = ['DOG', 'CAT'] as const;
const allowedSexes = ['MALE', 'FEMALE'] as const;
const allowedSizes = ['SMALL', 'MEDIUM', 'LARGE'] as const;

const speciesLabelMap: Record<(typeof allowedSpecies)[number], string> = {
  DOG: 'Cachorro',
  CAT: 'Gato',
};

const sexLabelMap: Record<(typeof allowedSexes)[number], string> = {
  MALE: 'Macho',
  FEMALE: 'Fêmea',
};

const sizeLabelMap: Record<(typeof allowedSizes)[number], string> = {
  SMALL: 'Pequeno',
  MEDIUM: 'Médio',
  LARGE: 'Grande',
};

export default function SearchPetsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedState = searchParams.get('state') ?? '';
  const selectedSpecies = searchParams.get('species') ?? '';
  const selectedSex = searchParams.get('sex') ?? '';
  const selectedSize = searchParams.get('size') ?? '';

  const filters = useMemo(
    () => ({
      state: selectedState || undefined,
      species: allowedSpecies.includes(selectedSpecies as (typeof allowedSpecies)[number])
        ? (selectedSpecies as (typeof allowedSpecies)[number])
        : undefined,
      sex: allowedSexes.includes(selectedSex as (typeof allowedSexes)[number])
        ? (selectedSex as (typeof allowedSexes)[number])
        : undefined,
      size: allowedSizes.includes(selectedSize as (typeof allowedSizes)[number])
        ? (selectedSize as (typeof allowedSizes)[number])
        : undefined,
    }),
    [selectedSize, selectedSex, selectedSpecies, selectedState],
  );

  const { pets, isLoading, error } = usePets(filters);

  const handleFilterChange = (key: SearchFilterKey, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <section className="w-full px-1 pb-8 pt-4 lg:px-0 lg:pt-5">
      <div className="mb-6 rounded-3xl bg-linear-to-r from-cyan-50 via-white to-emerald-50 p-5 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-3xl font-bold text-slate-900">Buscar pets</h1>
        <p className="mt-2 text-sm text-slate-600">
          Filtre por estado, espécie, porte e sexo para encontrar o pet ideal.
        </p>
      </div>

      <div className="mb-6 grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-5">
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Estado
          <select
            aria-label="Estado"
            value={selectedState}
            onChange={(event) => handleFilterChange('state', event.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2"
          >
            <option value="">Todos</option>
            {brazilianStates.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Espécie
          <select
            aria-label="Espécie"
            value={selectedSpecies}
            onChange={(event) => handleFilterChange('species', event.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2"
          >
            <option value="">Todas</option>
            {allowedSpecies.map((species) => (
              <option key={species} value={species}>
                {speciesLabelMap[species]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Porte
          <select
            aria-label="Porte"
            value={selectedSize}
            onChange={(event) => handleFilterChange('size', event.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2"
          >
            <option value="">Todos</option>
            {allowedSizes.map((size) => (
              <option key={size} value={size}>
                {sizeLabelMap[size]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Sexo
          <select
            aria-label="Sexo"
            value={selectedSex}
            onChange={(event) => handleFilterChange('sex', event.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2"
          >
            <option value="">Todos</option>
            {allowedSexes.map((sex) => (
              <option key={sex} value={sex}>
                {sexLabelMap[sex]}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={handleClearFilters}
          className="self-end rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Limpar filtros
        </button>
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
          Carregando pets...
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">
          Não foi possível carregar os pets no momento.
        </div>
      ) : null}

      {!isLoading && !error && pets.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
          Nenhum pet encontrado para os filtros selecionados.
        </div>
      ) : null}

      {!isLoading && !error && pets.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
            <article key={pet.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <img src={pet.photo} alt={pet.name} className="h-52 w-full rounded-2xl object-cover" />

              <h2 className="mt-4 text-xl font-bold text-slate-900">{pet.name}</h2>
              <p className="mt-1 text-sm text-slate-600">
                {formatPetSpecies(pet.species)}
                {pet.city ? ` • ${pet.city}` : ''}
                {pet.state ? `/${formatState(pet.state)}` : ''}
              </p>

              <p className="mt-2 text-sm text-slate-600">{pet.physicalCharacteristics}</p>

              <Link
                to={routes.pets.detail.build(getPetRouteId(pet))}
                className="mt-4 inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
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
