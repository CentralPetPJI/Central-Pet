import { formatDocument } from '@/lib/formatters';
import { UserProfile } from '@/Models/user.ts';

export function UserProfileModal({ user, onClose }: { user: UserProfile; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full mx-4 z-10 overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Perfil de {user.fullName}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            Fechar
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <p className="text-xs text-gray-500">Nome completo</p>
            <p className="font-medium">{user.fullName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Papel</p>
            <p className="font-medium">{user.role}</p>
          </div>
          {(user.cpf || user.cnpj) && (
            <div>
              <p className="text-xs text-gray-500">Documento (CPF/CNPJ)</p>
              <p className="font-medium">{formatDocument(user.cpf ?? user.cnpj, user.role)}</p>
            </div>
          )}
          {user.phone && (
            <div>
              <p className="text-xs text-gray-500">Telefone</p>
              <p className="font-medium">{user.phone}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500">Data de criação</p>
            <p className="font-medium">{new Date(user.createdAt).toLocaleString()}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Dados brutos</p>
            <pre className="text-xs bg-gray-100 p-2 rounded max-h-40 overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>
        <div className="p-3 border-t text-right">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
