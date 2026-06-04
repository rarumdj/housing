import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import landlordApi, { type ConnectPayoutPayload } from './api';
import { LandlordQueryKeys } from './keys';
import type { LandlordOnboardingPayload } from '@/types/domain';

export const useLandlordOnboardingQuery = (enabled = true) =>
  useQuery({
    queryKey: [LandlordQueryKeys.onboarding],
    queryFn: () => landlordApi.getOnboarding(),
    enabled,
  });

export const useSaveOnboardingMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: LandlordOnboardingPayload) => landlordApi.saveOnboarding(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [LandlordQueryKeys.onboarding] }),
  });
};

export const useCompleteOnboardingMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: LandlordOnboardingPayload) => landlordApi.completeOnboarding(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [LandlordQueryKeys.onboarding] }),
  });
};

export const useSendPhoneOtpMutation = () =>
  useMutation({
    mutationFn: () => landlordApi.sendPhoneOtp(),
  });

export const useVerifyPhoneOtpMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => landlordApi.verifyPhoneOtp(code),
    onSuccess: () => qc.invalidateQueries({ queryKey: [LandlordQueryKeys.onboarding] }),
  });
};

export const useConnectPayoutMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ConnectPayoutPayload) => landlordApi.connectPayout(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [LandlordQueryKeys.onboarding] }),
  });
};

export const useUploadDocumentsMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ files, labels }: { files: File[]; labels: string[] }) =>
      landlordApi.uploadDocuments(files, labels),
    onSuccess: () => qc.invalidateQueries({ queryKey: [LandlordQueryKeys.onboarding] }),
  });
};

export const useDeleteDocumentMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (url: string) => landlordApi.deleteDocument(url),
    onSuccess: () => qc.invalidateQueries({ queryKey: [LandlordQueryKeys.onboarding] }),
  });
};
