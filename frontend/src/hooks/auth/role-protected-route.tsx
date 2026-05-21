import type { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { authKeys, dashboardKeys } from '@/routes/keys';
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
    const home =
      user.role === 'ADMIN' ? dashboardKeys.admin.home.path :
      user.role === 'LANDLORD' ? dashboardKeys.landlord.home.path :
      dashboardKeys.tenant.home.path;
    return <Navigate to={home} replace />;
  }

  return <>{children}</>;
}
