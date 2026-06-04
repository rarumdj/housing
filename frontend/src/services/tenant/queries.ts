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

export const useUploadTenantDocumentsMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ files, labels }: { files: File[]; labels: string[] }) =>
      tenantApi.uploadDocuments(files, labels),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TenantQueryKeys.profile] }),
  });
};

export const useDeleteTenantDocumentMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (url: string) => tenantApi.deleteDocument(url),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TenantQueryKeys.profile] }),
  });
};

export const useTenantBookingsQuery = () =>
  useQuery({
    queryKey: [TenantQueryKeys.bookings],
    queryFn: () => tenantApi.bookings(),
  });
