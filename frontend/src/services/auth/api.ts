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
} from './types';

const authApi = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    return Axios.post(AuthApiKeys.login, payload);
  },
  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    return Axios.post(AuthApiKeys.register, payload);
  },
  async me(): Promise<MeResponse> {
    return Axios.get(AuthApiKeys.me);
  },
  async logout(payload: LogoutPayload): Promise<LogoutResponse> {
    return Axios.post(AuthApiKeys.logout, payload);
  },
};

export default authApi;
