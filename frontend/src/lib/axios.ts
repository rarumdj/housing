import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';

type AuthAdapter = {
  getAccessToken: () => string | null;
  logout?: () => void;
};

let authAdapter: AuthAdapter | null = null;

export function configureAxiosAuth(adapter: AuthAdapter) {
  authAdapter = adapter;
}

const apiBaseUrl =
  (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_API_BASE_URL ??
  '/api/v1';

const Axios = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

Axios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authAdapter?.getAccessToken();

    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

Axios.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error?.response?.status === 401) {
      authAdapter?.logout?.();
    }

    return Promise.reject(error);
  }
);

export function request<T>(config: AxiosRequestConfig): Promise<T> {
  return Axios.request(config);
}

export { Axios };
export default Axios;
