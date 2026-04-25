import { useState } from 'react';
import { api } from '@/lib/api';

export default function CreateAdminForm({ onCreated }: { onCreated?: () => void }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    setTempPassword(null);

    try {
      const payload: {
        fullName: string;
        email: string;
        password?: string;
      } = { fullName, email, password: undefined };
      if (password) payload.password = password;
      const res = await api.post('/admin/create-admin', payload);
      setTempPassword(res.data?.data?.tempPassword ?? null);
      setFullName('');
      setEmail('');
      setPassword('');
      if (onCreated) onCreated();
    } catch (_err) {
      // @ts-expect-error mensagem de erro pode estar em formatos diferentes dependendo do tipo de falha (ex: validação, rede, etc)
      setError(_err?.response?.data?.message || 'Erro ao criar admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-4 rounded shadow">
      <h3 className="text-sm font-semibold mb-2">Criar Admin (ROOT)</h3>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="Nome completo"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="Senha temporária (opcional)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex gap-2">
          <button disabled={loading} className="bg-purple-600 text-white px-3 py-2 rounded">
            Criar Admin
          </button>
          <button
            type="button"
            onClick={() => {
              setFullName('');
              setEmail('');
              setPassword('');
              setTempPassword(null);
              setError(null);
            }}
            className="px-3 py-2 border rounded"
          >
            Limpar
          </button>
        </div>
      </form>

      {loading && <p className="text-sm text-gray-500 mt-2">Criando...</p>}
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      {tempPassword && (
        <div className="mt-3 p-2 border rounded bg-gray-50">
          <p className="text-xs text-gray-600">Senha temporária gerada:</p>
          <p className="font-mono font-semibold">{tempPassword}</p>
          <p className="text-xs text-gray-500">
            Compartilhe essa senha com o novo admin e peça para alterá-la no primeiro login.
          </p>
        </div>
      )}
    </div>
  );
}
