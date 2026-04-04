import type { BaseResponse } from '../_types';
import type { TenantBooking } from '@/types/domain';

export type TenantBookingsResponse = BaseResponse<TenantBooking[]>;
