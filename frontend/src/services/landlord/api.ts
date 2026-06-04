import { Axios } from '@/lib/axios';
import { LandlordApiKeys } from './keys';
import type { BaseResponse } from '../_types';
import type {
  LandlordOnboardingPayload,
  LandlordOnboardingProfile,
  PayoutPreference,
  PaymentProvider,
} from '@/types/domain';

export interface ConnectPayoutPayload {
  provider: PaymentProvider;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  bankName?: string;
  payoutPreference?: PayoutPreference;
}

type OnboardingResponse = BaseResponse<LandlordOnboardingProfile>;

const landlordApi = {
  async getOnboarding(): Promise<OnboardingResponse> {
    return Axios.get(LandlordApiKeys.onboarding);
  },
  async saveOnboarding(payload: LandlordOnboardingPayload): Promise<OnboardingResponse> {
    return Axios.put(LandlordApiKeys.onboarding, payload);
  },
  async completeOnboarding(payload: LandlordOnboardingPayload): Promise<OnboardingResponse> {
    return Axios.post(LandlordApiKeys.completeOnboarding, payload);
  },
  async sendPhoneOtp(): Promise<BaseResponse<{ sent?: boolean; alreadyVerified?: boolean; devCode?: string }>> {
    return Axios.post(LandlordApiKeys.sendPhoneOtp, {});
  },
  async verifyPhoneOtp(code: string): Promise<BaseResponse<{ verified: boolean }>> {
    return Axios.post(LandlordApiKeys.verifyPhoneOtp, { code });
  },
  async connectPayout(payload: ConnectPayoutPayload): Promise<OnboardingResponse> {
    return Axios.post(LandlordApiKeys.connectPayout, payload);
  },
  async uploadDocuments(files: File[], labels: string[]): Promise<OnboardingResponse> {
    const form = new FormData();
    files.forEach((file) => form.append('files', file));
    labels.forEach((label) => form.append('labels', label));
    return Axios.post(LandlordApiKeys.documents, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  async deleteDocument(url: string): Promise<OnboardingResponse> {
    return Axios.delete(LandlordApiKeys.documents, { data: { url } });
  },
};

export default landlordApi;
