import { Navigate, Outlet } from 'react-router-dom';
import { authKeys } from '@/routes/keys';
import { useAuthManager } from '@/hooks/auth/use-auth-manager';

const ProtectedLayout = () => {
  const { isAuthenticated } = useAuthManager();

  if (!isAuthenticated) {
    return <Navigate to={authKeys.login.path} replace />;
  }

  return <Outlet />;
};

export default ProtectedLayout;
