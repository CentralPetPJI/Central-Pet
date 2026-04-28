import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { routes } from '@/routes';

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * Componente que protege rotas que exigem autenticação.
 * Se o usuário não estiver logado, redireciona para a página de login.
 */
export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redireciona para login, salvando a página que o usuário tentou acessar
      navigate(routes.login.path, {
        state: { from: location.pathname },
        replace: true,
      });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-pet"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
