import type { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { authKeys, getPostLoginPath } from '@/routes/keys';
import { useAuthManager } from './use-auth-manager';
import type { UserRole } from '@/types/domain';

type RoleProtectedRouteProps = PropsWithChildren<{
  roles?: UserRole[];
}>;

export function RoleProtectedRoute({ children, roles }: RoleProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthManager();

  if (!isAuthenticated) {
    return <Navigate to={authKeys.login.path} replace />;
  }

  if (roles?.length && user && !roles.includes(user.role)) {
    return <Navigate to={getPostLoginPath(user.role)} replace />;
  }

  return <>{children}</>;
}
