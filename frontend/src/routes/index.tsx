import type { AppRouteObject } from './types';
import { authRoutes, authStandaloneRoutes } from './auth.routes';
import { dashboardRoutes } from './dashboard.routes';
import { publicRoutes } from './public.routes';
import AuthLayout from '@/components/layouts/auth';
import DashboardLayout from '@/components/layouts/dashboard';
import ProtectedLayout from '@/components/layouts/dashboard/protected-layout';
import MarketingLayout from '@/components/layouts/marketing-layout';

export const appRoutes: AppRouteObject[] = [
  ...authStandaloneRoutes,
  {
    element: <AuthLayout />,
    children: authRoutes,
  },
  {
    element: <ProtectedLayout />,
    children: [
      {
        element: <DashboardLayout />,
        children: dashboardRoutes,
      },
    ],
  },
  {
    element: <MarketingLayout />,
    children: publicRoutes,
  },
];

export * from './keys';
export * from './types';
