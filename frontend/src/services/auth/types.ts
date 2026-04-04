import type { BaseResponse } from '../_types';
import type { AuthSession, AuthUser } from '@/types/domain';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: 'LANDLORD' | 'TENANT';
}

export interface LogoutPayload {
  refreshToken: string | null;
}

export type LoginResponse = BaseResponse<AuthSession>;
export type RegisterResponse = BaseResponse<AuthSession>;
export type MeResponse = BaseResponse<AuthUser>;
export type LogoutResponse = BaseResponse<null>;
