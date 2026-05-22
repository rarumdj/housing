import type { AppRouteObject } from './types';
import { dashboardKeys } from './keys';
import { RoleProtectedRoute } from '@/hooks/auth/role-protected-route';
import TenantDashboardPage from '@/pages/dashboard/tenant';
import TenantOnboardingPage from '@/pages/dashboard/tenant/onboarding';
import TenantApplicationsPage from '@/pages/dashboard/tenant/applications';
import LandlordDashboardPage from '@/pages/dashboard/landlord';
import LandlordPropertiesPage from '@/pages/dashboard/landlord/properties';
import CreatePropertyPage from '@/pages/dashboard/landlord/create';
import EditPropertyPage from '@/pages/dashboard/landlord/edit';
import LandlordPropertyDetailPage from '@/pages/dashboard/landlord/detail';
import LandlordMessagesPage from '@/pages/dashboard/landlord/messages';
import ApplicationReviewPage from '@/pages/dashboard/landlord/application-review';
import AdminDashboardPage from '@/pages/dashboard/admin';
import AdminUsersPage from '@/pages/dashboard/admin/users';
import AdminUserDetailPage from '@/pages/dashboard/admin/user-detail';
import AdminPropertiesPage from '@/pages/dashboard/admin/properties';
import AdminFeesPage from '@/pages/dashboard/admin/fees';
import PropertyDetailPage from '@/pages/properties/detail';

export const dashboardRoutes: AppRouteObject[] = [
  // ── Tenant ──
  {
    path: dashboardKeys.tenant.home.path,
    element: (
      <RoleProtectedRoute roles={['TENANT']}>
        <TenantDashboardPage />
      </RoleProtectedRoute>
    ),
  },
  {
    path: dashboardKeys.tenant.onboarding.path,
    element: (
      <RoleProtectedRoute roles={['TENANT']}>
        <TenantOnboardingPage />
      </RoleProtectedRoute>
    ),
  },
  {
    path: dashboardKeys.tenant.applications.path,
    element: (
      <RoleProtectedRoute roles={['TENANT']}>
        <TenantApplicationsPage />
      </RoleProtectedRoute>
    ),
  },
  // ── Landlord ──
  {
    path: dashboardKeys.landlord.home.path,
    element: (
      <RoleProtectedRoute roles={['LANDLORD']}>
        <LandlordDashboardPage />
      </RoleProtectedRoute>
    ),
  },
  {
    path: dashboardKeys.landlord.properties.path,
    element: (
      <RoleProtectedRoute roles={['LANDLORD']}>
        <LandlordPropertiesPage />
      </RoleProtectedRoute>
    ),
  },
  {
    path: dashboardKeys.landlord.create.path,
    element: (
      <RoleProtectedRoute roles={['LANDLORD']}>
        <CreatePropertyPage />
      </RoleProtectedRoute>
    ),
  },
  {
    path: dashboardKeys.landlord.detail.paramPath,
    element: (
      <RoleProtectedRoute roles={['LANDLORD']}>
        <LandlordPropertyDetailPage />
      </RoleProtectedRoute>
    ),
  },
  {
    path: dashboardKeys.landlord.edit.paramPath,
    element: (
      <RoleProtectedRoute roles={['LANDLORD']}>
        <EditPropertyPage />
      </RoleProtectedRoute>
    ),
  },
  {
    path: dashboardKeys.landlord.messages.path,
    element: (
      <RoleProtectedRoute roles={['LANDLORD']}>
        <LandlordMessagesPage />
      </RoleProtectedRoute>
    ),
  },
  {
    path: dashboardKeys.landlord.applicationReview.paramPath,
    element: (
      <RoleProtectedRoute roles={['LANDLORD']}>
        <ApplicationReviewPage />
      </RoleProtectedRoute>
    ),
  },
  // ── Admin ──
  {
    path: dashboardKeys.admin.home.path,
    element: (
      <RoleProtectedRoute roles={['ADMIN']}>
        <AdminDashboardPage />
      </RoleProtectedRoute>
    ),
  },
  {
    path: dashboardKeys.admin.users.path,
    element: (
      <RoleProtectedRoute roles={['ADMIN']}>
        <AdminUsersPage />
      </RoleProtectedRoute>
    ),
  },
  {
    path: dashboardKeys.admin.userDetail.paramPath,
    element: (
      <RoleProtectedRoute roles={['ADMIN']}>
        <AdminUserDetailPage />
      </RoleProtectedRoute>
    ),
  },
  {
    path: dashboardKeys.admin.properties.path,
    element: (
      <RoleProtectedRoute roles={['ADMIN']}>
        <AdminPropertiesPage />
      </RoleProtectedRoute>
    ),
  },
  {
    path: dashboardKeys.admin.propertyDetail.paramPath,
    element: (
      <RoleProtectedRoute roles={['ADMIN']}>
        <PropertyDetailPage />
      </RoleProtectedRoute>
    ),
  },
  {
    path: dashboardKeys.admin.fees.path,
    element: (
      <RoleProtectedRoute roles={['ADMIN']}>
        <AdminFeesPage />
      </RoleProtectedRoute>
    ),
  },
];
