import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchInstitutionById } from '@/lib/institutions/use-institutions';
import { api } from '@/lib/api';
import { ensureAllPublicIds, mapApiResponseToPet } from '@/storage/pets/pet-helpers';
import type { Pet } from '@/Models/pet';
import { routes } from '@/routes';
import { Institution } from '@/Models';

export default function InstitutionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPetsLoading, setIsPetsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    fetchInstitutionById(id)
      .then((data) => setInstitution(data))
      .catch((err) => setError(err instanceof Error ? err : new Error('Erro')))
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    if (!institution?.userId) return;
    setIsPetsLoading(true);
    (async () => {
      try {
        const response = await api.get(`/pets?responsibleUserId=${institution.userId}`);
        const payload = response.data && (response.data.data ?? response.data);
        if (Array.isArray(payload)) {
          ensureAllPublicIds(payload);
          const mapped = payload.map(mapApiResponseToPet);
          setPets(mapped);
        } else {
          setPets([]);
        }
      } catch (_err) {
        setPets([]);
      } finally {
        setIsPetsLoading(false);
      }
    })();
  }, [institution?.userId]);

  if (isLoading) return <div className="p-4">Carregando instituição...</div>;
  if (error) return <div className="p-4 text-red-600">Erro: {error.message}</div>;
  if (!institution) return <div className="p-4">Instituição não encontrada.</div>;

  return (
    <div className="p-4">
      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 leading-tight">{institution.name}</h1>
            <p className="mt-2 text-base text-gray-700">
              {[institution.city, institution.state].filter(Boolean).join(' • ') || '—'}
            </p>
            <p className="mt-3 text-sm text-gray-600">
              E-mail público:{' '}
              <span className="text-gray-800">{institution.email ?? 'Não informado'}</span>
            </p>
          </div>

          <div className="text-right">
            {(institution.foundedAt ?? institution.foundedAt) && (
              <>
                <div className="text-sm text-gray-500">Fundada em</div>
                {/*TODO: Arrumar data de fundação*/}
                <div className="text-base font-medium text-gray-700">
                  {new Date().toLocaleDateString('pt-BR')}
                </div>
              </>
            )}

            <div className="text-sm text-gray-500">Cadastro na plataforma</div>
            <div
              className="text-base font-medium text-gray-700"
              title="Data de cadastro na plataforma"
            >
              {new Date(institution.createdAt ?? '').toLocaleDateString('pt-BR') || ''}
            </div>

            <div className="mt-2 text-sm text-slate-600">
              {typeof institution.petsCount === 'number'
                ? `${institution.petsCount} pet${institution.petsCount === 1 ? '' : 's'}`
                : ''}
            </div>
          </div>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">Pets desta instituição</h2>

        {isPetsLoading ? (
          <div className="text-gray-600">Carregando pets...</div>
        ) : pets.length === 0 ? (
          <div className="rounded-md border border-dashed p-6 text-center text-gray-600">
            Nenhum pet cadastrado por esta instituição.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pets.map((pet) => (
              <article
                key={pet.id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition flex"
              >
                <img
                  src={pet.photo}
                  alt={pet.name}
                  className="h-32 w-32 object-cover rounded-l-lg flex-shrink-0"
                />
                <div className="p-3 flex flex-col justify-center">
                  <h3 className="text-md font-semibold text-gray-800">{pet.name}</h3>
                  <p className="mt-1 text-xs text-gray-600">{pet.physicalCharacteristics}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <Link
                      to={routes.pets.detail.build(pet.id)}
                      className="text-sm font-medium text-cyan-600 hover:underline"
                    >
                      Ver pet
                    </Link>
                    <span className="text-xs text-gray-500">{pet.sourceName}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div>
        <Link
          to={routes.institutions.list.path}
          className="rounded-full border px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          Voltar à lista
        </Link>
      </div>
    </div>
  );
}
