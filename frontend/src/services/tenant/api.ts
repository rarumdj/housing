import { Axios } from '@/lib/axios';
import { TenantApiKeys } from './keys';
import type { TenantBookingsResponse } from './types';

const tenantApi = {
  async bookings(): Promise<TenantBookingsResponse> {
    return Axios.get(TenantApiKeys.bookings);
  },
};

export default tenantApi;
