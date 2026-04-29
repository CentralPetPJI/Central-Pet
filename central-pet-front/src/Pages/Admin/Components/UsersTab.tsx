import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import CreateAdminForm from '../CreateAdminForm';
import { UserCheck, UserX } from 'lucide-react';
import { UserProfileModal } from '../UserProfileModal';
import { UserProfile } from '@/Models/user.ts';

export function UsersTab() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.data ?? response.data ?? []);
    } catch (_error) {
      /* empty */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (userId: string) => {
    try {
      await api.patch(`/admin/users/${userId}/toggle-status`);
      fetchUsers();
    } catch (_error) {
      /* empty */
    }
  };

  if (loading) return <div>Carregando usuários...</div>;

  return (
    <div>
      <div className="mb-4 flex justify-end">
        {currentUser && ['ROOT'].includes(currentUser.role) && (
          <CreateAdminForm onCreated={fetchUsers} />
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Papel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="text-left w-full text-sm font-medium text-gray-900 hover:underline"
                  >
                    {user.fullName}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.deleted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                  >
                    {user.deleted ? 'Desativado' : 'Ativo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStatus(user.id);
                    }}
                    className={`inline-flex items-center gap-1 ${user.deleted ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'}`}
                  >
                    {user.deleted ? (
                      <UserCheck className="h-4 w-4" />
                    ) : (
                      <UserX className="h-4 w-4" />
                    )}
                    {user.deleted ? 'Reativar' : 'Desativar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}
