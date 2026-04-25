import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Navigate } from 'react-router-dom';
import { Users, ShieldAlert, History, FileSearch, AlertTriangle } from 'lucide-react';

import { UsersTab, PetsTab, ReportsTab, AuditTab } from './Components';

type Tab = 'users' | 'pets' | 'reports' | 'audit';

export default function AdminPage() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('users');

  function isAdminRole(role: unknown): role is 'ADMIN' | 'ROOT' {
    return role === 'ADMIN' || role === 'ROOT';
  }

  if (!currentUser || !isAdminRole(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <ShieldAlert className="h-8 w-8 text-purple-600" />
        <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <TabButton
            active={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
            icon={<Users className="h-5 w-5" />}
            label="Usuários"
          />
          <TabButton
            active={activeTab === 'pets'}
            onClick={() => setActiveTab('pets')}
            icon={<FileSearch className="h-5 w-5" />}
            label="Pets"
          />
          <TabButton
            active={activeTab === 'reports'}
            onClick={() => setActiveTab('reports')}
            icon={<AlertTriangle className="h-5 w-5" />}
            label="Denúncias"
          />
          <TabButton
            active={activeTab === 'audit'}
            onClick={() => setActiveTab('audit')}
            icon={<History className="h-5 w-5" />}
            label="Auditoria"
          />
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'pets' && <PetsTab />}
        {activeTab === 'reports' && <ReportsTab />}
        {activeTab === 'audit' && <AuditTab />}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
        ${
          active
            ? 'border-purple-600 text-purple-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}
