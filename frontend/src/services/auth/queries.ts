import { useMutation, useQuery } from '@tanstack/react-query';
import authApi from './api';
import { AuthApiKeys } from './keys';
import type { LoginPayload, LogoutPayload, RegisterPayload } from './types';

export const useLoginMutation = () => {
  return useMutation({
    mutationKey: [AuthApiKeys.login],
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationKey: [AuthApiKeys.register],
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
  });
};

export const useMeQuery = (enabled: boolean) => {
  return useQuery({
    queryKey: [AuthApiKeys.me],
    queryFn: () => authApi.me(),
    enabled,
    staleTime: 1000 * 60 * 10,
  });
};

export const useLogoutMutation = () => {
  return useMutation({
    mutationKey: [AuthApiKeys.logout],
    mutationFn: (payload: LogoutPayload) => authApi.logout(payload),
  });
};
