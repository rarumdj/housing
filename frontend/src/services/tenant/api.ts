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

  async bookings(): Promise<TenantBookingsResponse> {
    return Axios.get(TenantApiKeys.bookings);
  },
};

export default tenantApi;
