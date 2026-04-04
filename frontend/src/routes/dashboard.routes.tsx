import type { AppRouteObject } from './types';
import { dashboardKeys } from './keys';
import { RoleProtectedRoute } from '@/hooks/auth/role-protected-route';
import TenantDashboardPage from '@/pages/dashboard/tenant';
import LandlordDashboardPage from '@/pages/dashboard/landlord';
import { PlaceholderPage } from '@/components/placeholder-page';

export const dashboardRoutes: AppRouteObject[] = [
  {
    path: dashboardKeys.tenant.home.path,
    element: (
      <RoleProtectedRoute roles={['TENANT', 'ADMIN']}>
        <TenantDashboardPage />
      </RoleProtectedRoute>
    ),
  },
  {
    path: dashboardKeys.tenant.applications.path,
    element: (
      <RoleProtectedRoute roles={['TENANT', 'ADMIN']}>
        <PlaceholderPage title="My Applications" description="Track your bookings here soon." />
      </RoleProtectedRoute>
    ),
  },
  {
    path: dashboardKeys.landlord.home.path,
    element: (
      <RoleProtectedRoute roles={['LANDLORD', 'ADMIN']}>
        <LandlordDashboardPage />
      </RoleProtectedRoute>
    ),
  },
  {
    path: dashboardKeys.landlord.properties.path,
    element: (
      <RoleProtectedRoute roles={['LANDLORD', 'ADMIN']}>
        <PlaceholderPage title="Manage Properties" description="Property management tools are coming soon." />
      </RoleProtectedRoute>
    ),
  },
  {
    path: dashboardKeys.landlord.create.path,
    element: (
      <RoleProtectedRoute roles={['LANDLORD', 'ADMIN']}>
        <PlaceholderPage title="New Property" description="The property wizard is coming soon." />
      </RoleProtectedRoute>
    ),
  },
];
