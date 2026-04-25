import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Eye, EyeOff } from 'lucide-react';
import { resolvePublicId } from '@/storage/pets/pet-helpers';
import { routes } from '@/routes';
import { UserProfile } from '@/Models/user.ts';
import { PetApiResponse } from '@/Models';

export function PetsTab() {
  const [pets, setPets] = useState<PetApiResponse[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filterUserId, setFilterUserId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(12);
  const [total, setTotal] = useState<number>(0);

  const fetchPets = async (userId?: string, pageNum = 1) => {
    setLoading(true);
    try {
      const url = new URL('/admin/pets', window.location.origin);
      if (userId) url.searchParams.set('userId', String(userId));
      url.searchParams.set('page', String(pageNum));
      url.searchParams.set('limit', String(limit));

      const response = await api.get(url.pathname + url.search);
      const payload = response.data ?? {};
      setPets(payload.data ?? []);
      setTotal(payload.total ?? 0);
      setPage(payload.page ?? pageNum);
    } catch (_error) {
      // verificar log dos pets
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data ?? []);
    } catch (_error) {
      //
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPets();
  }, []);

  useEffect(() => {
    // when filter changes, reset to page 1 and reload pets
    setPage(1);
    fetchPets(filterUserId, 1);
  }, [filterUserId]);

  useEffect(() => {
    // when page changes, fetch new page
    fetchPets(filterUserId, page);
  }, [page]);

  const toggleDeletion = async (petId: string) => {
    try {
      await api.patch(`/admin/pets/${petId}/toggle-deletion`);
      fetchPets(filterUserId, page);
    } catch (_error) {
      //
    }
  };

  if (loading) return <div>Carregando pets...</div>;

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        <label className="text-sm text-gray-700">Filtrar por usuário:</label>
        <select
          value={filterUserId ?? ''}
          onChange={(e) => setFilterUserId(e.target.value || undefined)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="">Todos</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.fullName}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pets.map((pet) => (
          <div
            key={pet.id}
            className={`border rounded-lg overflow-hidden ${pet.deleted ? 'bg-gray-50 border-red-200' : 'bg-white border-gray-200'}`}
          >
            <img
              src={pet.profilePhoto}
              alt={pet.name}
              className={`w-full h-48 object-cover ${pet.deleted ? 'grayscale opacity-50' : ''}`}
            />
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{pet.name}</h3>
                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded-full ${pet.deleted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                >
                  {pet.deleted ? 'Bloqueado' : 'Visível'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-2">
                Responsável: {pet.responsibleUser?.fullName}
              </p>

              <div className="flex gap-2">
                <a
                  href={routes.pets.detail.build(resolvePublicId(pet.id))}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Ver perfil
                </a>
                <button
                  onClick={() => toggleDeletion(pet.id)}
                  className={`ml-auto py-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                    pet.deleted
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {pet.deleted ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  {pet.deleted ? 'Desbloquear Pet' : 'Bloquear Pet'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination controls */}
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Anterior
        </button>

        <div className="text-sm text-gray-700">
          Página {page} de {totalPages}
        </div>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
