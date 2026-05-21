import { Axios } from '@/lib/axios';
import type { BaseResponse } from '../_types';
import type { ApplicationDetail, LandlordBooking } from '@/types/domain';

const BookingApiKeys = {
  landlordBookings: '/landlords/me/bookings',
  applicationDetail: (id: string) => `/bookings/${id}/application`,
  apply: '/bookings',
  accept: (id: string) => `/bookings/${id}/accept`,
  decline: (id: string) => `/bookings/${id}/decline`,
  cancel: (id: string) => `/bookings/${id}/cancel`,
  terminateLease: (id: string) => `/landlords/leases/${id}/terminate`,
} as const;

export const BookingQueryKeys = {
  landlordBookings: 'landlord-bookings',
  applicationDetail: 'application-detail',
} as const;

const bookingsApi = {
  async getLandlordBookings(statuses?: string[]): Promise<BaseResponse<LandlordBooking[]>> {
    const params = statuses?.length ? { status: statuses.join(',') } : {};
    return Axios.get(BookingApiKeys.landlordBookings, { params });
  },
  async getApplicationDetail(id: string): Promise<BaseResponse<ApplicationDetail>> {
    return Axios.get(BookingApiKeys.applicationDetail(id));
  },
  async apply(propertyId: string, message?: string): Promise<BaseResponse> {
    return Axios.post(BookingApiKeys.apply, { propertyId, message });
  },
  async accept(id: string): Promise<BaseResponse> {
    return Axios.put(BookingApiKeys.accept(id));
  },
  async decline(id: string, reason: string): Promise<BaseResponse> {
    return Axios.put(BookingApiKeys.decline(id), { reason });
  },
  async cancel(id: string): Promise<BaseResponse> {
    return Axios.put(BookingApiKeys.cancel(id));
  },
  async terminateLease(leaseId: string): Promise<BaseResponse> {
    return Axios.post(BookingApiKeys.terminateLease(leaseId));
  },
};

export default bookingsApi;
