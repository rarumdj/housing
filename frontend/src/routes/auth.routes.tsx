import type { AppRouteObject } from './types';
import { authKeys } from './keys';
import LoginPage from '@/pages/auth/login';
import RegisterPage from '@/pages/auth/register';
import EmailVerifyPage from '@/pages/auth/email-verify';

export const authStandaloneRoutes: AppRouteObject[] = [];

export const authRoutes: AppRouteObject[] = [
  {
    path: authKeys.login.path,
    element: <LoginPage />,
  },
  {
    path: authKeys.register.path,
    element: <RegisterPage />,
  },
  {
    path: authKeys.emailVerify.paramPath,
    element: <EmailVerifyPage />,
  },
];
