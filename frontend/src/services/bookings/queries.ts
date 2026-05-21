import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import bookingsApi, { BookingQueryKeys } from './api';
import { PropertyQueryKeys } from '../properties/keys';
import { TenantQueryKeys } from '../tenant/keys';

export const useLandlordBookingsQuery = (statuses?: string[]) =>
  useQuery({
    queryKey: [BookingQueryKeys.landlordBookings, statuses],
    queryFn: () => bookingsApi.getLandlordBookings(statuses),
  });

export const useApplicationDetailQuery = (id: string) =>
  useQuery({
    queryKey: [BookingQueryKeys.applicationDetail, id],
    queryFn: () => bookingsApi.getApplicationDetail(id),
    enabled: !!id,
  });

export const useApplyMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ propertyId, message }: { propertyId: string; message?: string }) =>
      bookingsApi.apply(propertyId, message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TenantQueryKeys.bookings] });
      qc.invalidateQueries({ queryKey: [BookingQueryKeys.landlordBookings] });
    },
  });
};

export const useAcceptBookingMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingsApi.accept(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [BookingQueryKeys.landlordBookings] });
      qc.invalidateQueries({ queryKey: [BookingQueryKeys.applicationDetail] });
      qc.invalidateQueries({ queryKey: [PropertyQueryKeys.activity] });
      qc.invalidateQueries({ queryKey: [TenantQueryKeys.bookings] });
    },
  });
};

export const useDeclineBookingMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => bookingsApi.decline(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [BookingQueryKeys.landlordBookings] });
      qc.invalidateQueries({ queryKey: [BookingQueryKeys.applicationDetail] });
      qc.invalidateQueries({ queryKey: [PropertyQueryKeys.activity] });
      qc.invalidateQueries({ queryKey: [TenantQueryKeys.bookings] });
    },
  });
};

export const useCancelBookingMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingsApi.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [BookingQueryKeys.landlordBookings] });
      qc.invalidateQueries({ queryKey: [PropertyQueryKeys.activity] });
      qc.invalidateQueries({ queryKey: [TenantQueryKeys.bookings] });
    },
  });
};

export const useTerminateLeaseMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (leaseId: string) => bookingsApi.terminateLease(leaseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [BookingQueryKeys.landlordBookings] });
      qc.invalidateQueries({ queryKey: [PropertyQueryKeys.activity] });
      qc.invalidateQueries({ queryKey: [PropertyQueryKeys.myProperties] });
    },
  });
};
