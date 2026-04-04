import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export function ProtectedRoute({ role }: { role?: 'LANDLORD' | 'TENANT' | 'ADMIN' }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'LANDLORD' ? '/landlord/dashboard' : '/dashboard'} replace />;
  }

  return <Outlet />;
}
