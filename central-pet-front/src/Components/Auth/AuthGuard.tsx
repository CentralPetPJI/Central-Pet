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
  const { isAuthenticated, isLoading, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redireciona para login, salvando a página que o usuário tentou acessar
      navigate(routes.login.path, {
        state: { from: location.pathname },
        replace: true,
      });
      return;
    }

    // Redireciona para troca de senha se necessário
    if (
      isAuthenticated &&
      currentUser?.mustChangePassword &&
      location.pathname !== routes.admin.setupPassword.path
    ) {
      navigate(routes.admin.setupPassword.path, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location, currentUser]);

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
