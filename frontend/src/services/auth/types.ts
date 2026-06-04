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

export interface EmailIntentPayload {
  email: string;
}

export interface ConfirmEmailPayload {
  intentCode: string;
  otp: string;
}

export interface RegisterResult {
  requiresEmailVerification: boolean;
  email: string;
  role: 'LANDLORD' | 'TENANT';
  firstName: string;
  intentCode: string;
}

export type LoginResponse = BaseResponse<AuthSession>;
export type RegisterResponse = BaseResponse<RegisterResult>;
export type EmailIntentResponse = BaseResponse<{ intentCode: string | null; alreadyVerified: boolean }>;
export type ConfirmEmailResponse = BaseResponse<AuthSession>;
export type MeResponse = BaseResponse<AuthUser>;
export type LogoutResponse = BaseResponse<null>;
