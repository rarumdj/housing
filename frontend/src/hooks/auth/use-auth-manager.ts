import { useMemo } from 'react';
import { authStore, useAuthStore } from './auth-store';
import { StorageTypes } from '@/services/auth/keys';
import type { AuthSession } from '@/types/domain';

type StorageType = (typeof StorageTypes)[keyof typeof StorageTypes];

export const useAuthManager = () => {
  const auth = useAuthStore();

  return useMemo(
    () => ({
      auth,
      user: auth.user ?? undefined,
      isAuthenticated: authStore.isAuthenticated(),
      setSession: (session: AuthSession, storage: StorageType = StorageTypes.session) => {
        authStore.signIn(session, storage);
      },
      updateUser: (user: AuthSession['user']) => {
        authStore.updateUser(user);
      },
      clearSession: () => {
        authStore.signOut();
      },
    }),
    [auth]
  );
};
