import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import tenantApi from './api';
import { TenantQueryKeys } from './keys';
import type { TenantProfilePayload } from '@/types/domain';

export const useTenantProfileQuery = () =>
  useQuery({
    queryKey: [TenantQueryKeys.profile],
    queryFn: () => tenantApi.getProfile(),
  });

export const useUpdateTenantProfileMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TenantProfilePayload) => tenantApi.updateProfile(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TenantQueryKeys.profile] });
    },
  });
};

export const useCompleteOnboardingMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TenantProfilePayload) => tenantApi.completeOnboarding(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TenantQueryKeys.profile] });
    },
  });
};

export const useTenantBookingsQuery = () =>
  useQuery({
    queryKey: [TenantQueryKeys.bookings],
    queryFn: () => tenantApi.bookings(),
  });
