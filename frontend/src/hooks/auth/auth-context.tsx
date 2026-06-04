import { useEffect, type PropsWithChildren } from 'react';
import { configureAxiosAuth } from '@/lib/axios';
import { authStore } from './auth-store';

const AuthProvider = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    configureAxiosAuth({
      getAccessToken: () => authStore.getSnapshot().accessToken,
      logout: () => authStore.signOut(),
    });
  }, []);

  return children;
};

export default AuthProvider;
