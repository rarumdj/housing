import { useSyncExternalStore } from 'react';
import { AuthKeys, StorageTypes } from '@/services/auth/keys';
import type { AuthSession } from '@/types/domain';

type Listener = () => void;

export type AuthSnapshot = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthSession['user'] | null;
  rememberMe: boolean;
};

type StorageType = (typeof StorageTypes)[keyof typeof StorageTypes];

const initialState: AuthSnapshot = {
  accessToken: null,
  refreshToken: null,
  user: null,
  rememberMe: false,
};

const loadAuthState = (): AuthSnapshot => {
  try {
    const local = localStorage.getItem(AuthKeys.tokenStorage);
    const session = sessionStorage.getItem(AuthKeys.tokenStorage);
    const raw = local || session;
    return raw ? { ...initialState, ...JSON.parse(raw) } : initialState;
  } catch {
    return initialState;
  }
};

const persistState = (state: AuthSnapshot) => {
  if (state.rememberMe) {
    localStorage.setItem(AuthKeys.tokenStorage, JSON.stringify(state));
    sessionStorage.removeItem(AuthKeys.tokenStorage);
    return;
  }

  sessionStorage.setItem(AuthKeys.tokenStorage, JSON.stringify(state));
  localStorage.removeItem(AuthKeys.tokenStorage);
};

const createAuthStore = () => {
  let state: AuthSnapshot = typeof window === 'undefined' ? initialState : loadAuthState();
  const listeners = new Set<Listener>();

  const emit = () => listeners.forEach((listener) => listener());

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.key === AuthKeys.tokenStorage) {
        state = loadAuthState();
        emit();
      }
    });
  }

  return {
    getSnapshot: () => state,
    subscribe: (listener: Listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    signIn: (session: AuthSession, storage: StorageType = StorageTypes.session) => {
      state = {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        user: session.user,
        rememberMe: storage === StorageTypes.local || !!session.rememberMe,
      };
      persistState(state);
      emit();
    },
    updateUser: (user: AuthSession['user']) => {
      state = { ...state, user };
      persistState(state);
      emit();
    },
    setTokens: (accessToken: string, refreshToken: string) => {
      state = { ...state, accessToken, refreshToken };
      persistState(state);
      emit();
    },
    signOut: () => {
      const lastSignedOutUserEmail = state.user?.email?.trim();

      if (lastSignedOutUserEmail) {
        sessionStorage.setItem(AuthKeys.lastSignedOutUserEmail, lastSignedOutUserEmail);
      } else {
        sessionStorage.removeItem(AuthKeys.lastSignedOutUserEmail);
      }

      state = initialState;
      localStorage.removeItem(AuthKeys.tokenStorage);
      sessionStorage.removeItem(AuthKeys.tokenStorage);
      emit();
    },
    isAuthenticated: () => !!state.accessToken && !!state.user,
  };
};

export const authStore = createAuthStore();

export const useAuthStore = () =>
  useSyncExternalStore(authStore.subscribe, authStore.getSnapshot, authStore.getSnapshot);
