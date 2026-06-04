import { Axios } from '@/lib/axios';
import { AuthApiKeys } from './keys';
import type {
  LoginPayload,
  LoginResponse,
  LogoutPayload,
  LogoutResponse,
  MeResponse,
  RegisterPayload,
  RegisterResponse,
  EmailIntentPayload,
  EmailIntentResponse,
  ConfirmEmailPayload,
  ConfirmEmailResponse,
} from './types';

const authApi = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    return Axios.post(AuthApiKeys.login, payload);
  },
  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    return Axios.post(AuthApiKeys.register, payload);
  },
  async createEmailIntent(payload: EmailIntentPayload): Promise<EmailIntentResponse> {
    return Axios.post(AuthApiKeys.emailIntent, payload);
  },
  async confirmEmail(payload: ConfirmEmailPayload): Promise<ConfirmEmailResponse> {
    return Axios.post(AuthApiKeys.confirmEmail, payload);
  },
  async me(): Promise<MeResponse> {
    return Axios.get(AuthApiKeys.me);
  },
  async logout(payload: LogoutPayload): Promise<LogoutResponse> {
    return Axios.post(AuthApiKeys.logout, payload);
  },
};

export default authApi;
