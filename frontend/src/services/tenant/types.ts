import type { BaseResponse } from '../_types';
import type { TenantBooking, TenantProfile } from '@/types/domain';

export type TenantBookingsResponse = BaseResponse<TenantBooking[]>;
export type TenantProfileResponse = BaseResponse<TenantProfile>;
