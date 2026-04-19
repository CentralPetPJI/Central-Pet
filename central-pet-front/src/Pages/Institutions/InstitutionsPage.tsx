import { Link } from 'react-router-dom';
import { useInstitutions } from '@/lib/institutions/use-institutions';
import { routes } from '@/routes';

export default function InstitutionsPage() {
  const { institutions, isLoading, error, refetch } = useInstitutions();

  if (isLoading) return <div className="p-4">Carregando instituições...</div>;
  if (error) return <div className="p-4 text-red-600">Erro: {error.message}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Instituições</h1>

      {institutions.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-gray-200 p-8 text-center bg-white">
          <div className="text-2xl font-medium">Nenhuma instituição cadastrada ainda</div>
          <div className="text-sm text-gray-600">
            Ainda não há ONGs cadastradas no sistema. Volte mais tarde ou peça para uma instituição
            se cadastrar.
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => void refetch()}
              className="rounded-full bg-cyan-600 px-4 py-2 text-white hover:bg-cyan-700"
            >
              Recarregar
            </button>
            <Link
              to={routes.home.path}
              className="rounded-full border px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Voltar
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {institutions.map((inst) => (
            <article
              key={inst.id}
              className="overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition"
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-slate-900">{inst.name}</h2>
                      {inst.verified && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                          Verificado
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {[inst.city, inst.state].filter(Boolean).join(' • ') || '—'}
                    </p>
                    <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                      {inst.description || inst.email || 'Sem e-mail público'}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500 text-right">
                    <div>{new Date(inst.createdAt ?? '').toLocaleDateString() || ''}</div>
                    <div className="mt-2 text-sm text-slate-600">
                      {typeof inst.petsCount === 'number'
                        ? `${inst.petsCount} pet${inst.petsCount === 1 ? '' : 's'}`
                        : '—'}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2">
                  <Link
                    to={routes.institutions.detail.build(inst.id)}
                    className="rounded-full border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Ver detalhes
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
