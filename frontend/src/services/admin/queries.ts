import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import adminApi, { AdminQueryKeys } from './api';
import { PropertyQueryKeys } from '@/services/properties/keys';
import type { PlatformFee } from '@/types/domain';

export const useAdminUsersQuery = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: [AdminQueryKeys.users, params],
    queryFn: () => adminApi.listUsers(params),
  });

export const useAdminUserDetailQuery = (id: string) =>
  useQuery({
    queryKey: [AdminQueryKeys.userDetail, id],
    queryFn: () => adminApi.getUserDetail(id),
    enabled: !!id,
  });

export const useVerifyUserMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string; status: string; reason?: string }) =>
      adminApi.verifyUser(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [AdminQueryKeys.users] });
      qc.invalidateQueries({ queryKey: [AdminQueryKeys.userDetail] });
      qc.invalidateQueries({ queryKey: [AdminQueryKeys.overview] });
    },
  });
};

export const useToggleActiveMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.toggleActive(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [AdminQueryKeys.users] });
      qc.invalidateQueries({ queryKey: [AdminQueryKeys.userDetail] });
    },
  });
};

export const useAdminPropertiesQuery = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: [AdminQueryKeys.properties, params],
    queryFn: () => adminApi.listProperties(params),
  });

export const useVerifyPropertyMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string; verificationStatus: string; reason?: string }) =>
      adminApi.verifyProperty(id, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [AdminQueryKeys.properties] });
      qc.invalidateQueries({ queryKey: [AdminQueryKeys.overview] });
      qc.invalidateQueries({ queryKey: [PropertyQueryKeys.detail, variables.id] });
      qc.invalidateQueries({ queryKey: [PropertyQueryKeys.list] });
    },
  });
};

export const useAdminDeletePropertyMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteProperty(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: [AdminQueryKeys.properties] });
      qc.invalidateQueries({ queryKey: [AdminQueryKeys.overview] });
      qc.invalidateQueries({ queryKey: [PropertyQueryKeys.detail, id] });
      qc.invalidateQueries({ queryKey: [PropertyQueryKeys.list] });
    },
  });
};

export const useAdminFeesQuery = () =>
  useQuery({
    queryKey: [AdminQueryKeys.fees],
    queryFn: () => adminApi.listFees(),
  });

export const useCreateFeeMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<PlatformFee>) => adminApi.createFee(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [AdminQueryKeys.fees] });
    },
  });
};

export const useUpdateFeeMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<PlatformFee> & { id: string }) =>
      adminApi.updateFee(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [AdminQueryKeys.fees] });
    },
  });
};

export const useDeleteFeeMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteFee(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [AdminQueryKeys.fees] });
    },
  });
};

export const useAdminOverviewQuery = () =>
  useQuery({
    queryKey: [AdminQueryKeys.overview],
    queryFn: () => adminApi.getOverview(),
  });

export const useAdminRevenueQuery = () =>
  useQuery({
    queryKey: [AdminQueryKeys.revenue],
    queryFn: () => adminApi.getRevenue(),
  });

export const useAdminLandlordAnalyticsQuery = () =>
  useQuery({
    queryKey: [AdminQueryKeys.landlordAnalytics],
    queryFn: () => adminApi.getLandlordAnalytics(),
  });

export const useAdminTenantAnalyticsQuery = () =>
  useQuery({
    queryKey: [AdminQueryKeys.tenantAnalytics],
    queryFn: () => adminApi.getTenantAnalytics(),
  });
