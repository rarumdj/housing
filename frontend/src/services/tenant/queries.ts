import { useQuery } from '@tanstack/react-query';
import tenantApi from './api';
import { TenantQueryKeys } from './keys';

export const useTenantBookingsQuery = () => {
  return useQuery({
    queryKey: [TenantQueryKeys.bookings],
    queryFn: () => tenantApi.bookings(),
  });
};
