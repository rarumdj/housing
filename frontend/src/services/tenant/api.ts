import { Axios } from '@/lib/axios';
import { TenantApiKeys } from './keys';
import type { TenantBookingsResponse, TenantProfileResponse } from './types';
import type { BaseResponse } from '../_types';
import type { TenantProfile, TenantProfilePayload } from '@/types/domain';

const tenantApi = {
  async getProfile(): Promise<TenantProfileResponse> {
    return Axios.get(TenantApiKeys.profile);
  },

  async updateProfile(payload: TenantProfilePayload): Promise<TenantProfileResponse> {
    return Axios.put(TenantApiKeys.profile, payload);
  },

  async completeOnboarding(payload: TenantProfilePayload): Promise<TenantProfileResponse> {
    return Axios.post(TenantApiKeys.onboarding, payload);
  },

  async uploadDocuments(files: File[], labels: string[]): Promise<TenantProfileResponse> {
    const form = new FormData();
    files.forEach((file) => form.append('files', file));
    labels.forEach((label) => form.append('labels', label));
    return Axios.post(TenantApiKeys.documents, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  async deleteDocument(url: string): Promise<TenantProfileResponse> {
    return Axios.delete(TenantApiKeys.documents, { data: { url } });
  },

  async bookings(): Promise<TenantBookingsResponse> {
    return Axios.get(TenantApiKeys.bookings);
  },
};

export default tenantApi;
