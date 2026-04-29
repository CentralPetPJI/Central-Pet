import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { History } from 'lucide-react';
import { UserProfile } from '@/Models/user.ts';
import { AuditLog } from '@/Models/AuditLog';

export function AuditTab() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterUserId, setFilterUserId] = useState<string>('');
  const [users, setUsers] = useState<UserProfile[]>([]);

  // pagination
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/admin/users');
        setUsers(res.data?.data ?? res.data ?? []);
      } catch (_e) {
        /* empty */
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const url = `/admin/audit-logs${filterUserId ? `?userId=${encodeURIComponent(filterUserId)}&page=${page}&limit=${limit}` : `?page=${page}&limit=${limit}`}`;
        const response = await api.get(url);
        const body = response.data ?? {};
        setLogs(body.data ?? body ?? []);
        setTotal(body.total ?? 0);
      } catch (_error) {
        /* empty */
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [filterUserId, page, limit]);

  if (loading) return <div>Carregando logs...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <select
          value={filterUserId}
          onChange={(e) => {
            setFilterUserId(e.target.value);
            setPage(1);
          }}
          className="border px-2 py-1 rounded"
        >
          <option value="">Todos os usuários</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.fullName} ({u.email})
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            setFilterUserId('');
            setPage(1);
          }}
          className="text-sm text-gray-500"
        >
          Limpar
        </button>
      </div>

      {logs.map((log) => (
        <div
          key={log.id}
          className="p-4 border border-gray-100 rounded-lg bg-gray-50 flex items-start gap-4"
        >
          <div className="mt-1 bg-purple-100 p-2 rounded-full">
            <History className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              <span className="font-bold">{log.user?.fullName ?? 'Desconhecido'}</span> executou{' '}
              <span className="text-purple-600 font-semibold">{log.action}</span>
            </p>
            <p className="text-xs text-gray-500 mb-2">
              Alvo: {log.targetType} ({log.targetId})
            </p>
            <div className="bg-white p-2 rounded border border-gray-200 text-xs font-mono">
              {JSON.stringify(log.details)}
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              {new Date(log.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      ))}

      {/* pagination controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          {total === 0
            ? 'Mostrando 0 de 0'
            : `Mostrando ${(page - 1) * limit + 1} - ${Math.min(page * limit, total)} de ${total}`}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1 rounded border bg-white"
          >
            Anterior
          </button>
          <span className="text-sm">Página {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page * limit >= total}
            className="px-3 py-1 rounded border bg-white"
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
}
