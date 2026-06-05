import axios, {
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';

type AuthAdapter = {
  getAccessToken: () => string | null;
  getRefreshToken?: () => string | null;
  setTokens?: (accessToken: string, refreshToken: string) => void;
  logout?: () => void;
};

let authAdapter: AuthAdapter | null = null;

export const configureAxiosAuth = (adapter: AuthAdapter) => {
  authAdapter = adapter;
};

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

// ── Refresh-token handling ──
// A single in-flight refresh is shared by all requests that 401 concurrently.
let refreshPromise: Promise<string | null> | null = null;

const performRefresh = async (): Promise<string | null> => {
  const refreshToken = authAdapter?.getRefreshToken?.();
  if (!refreshToken) return null;

  try {
    // Bare axios call (no interceptors) to avoid a refresh loop.
    const { data } = await axios.post(`${apiBaseUrl}/auth/refresh`, { refreshToken });
    const tokens = data?.data ?? data;
    const accessToken: string | undefined = tokens?.accessToken;
    const newRefreshToken: string | undefined = tokens?.refreshToken;

    if (!accessToken || !newRefreshToken) return null;

    authAdapter?.setTokens?.(accessToken, newRefreshToken);
    return accessToken;
  } catch {
    return null;
  }
};

const isAuthEndpoint = (url?: string) =>
  !!url && (url.includes('/auth/refresh') || url.includes('/auth/login') || url.includes('/auth/register'));

Axios.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const original = error?.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error?.response?.status;
    const hasRefreshToken = !!authAdapter?.getRefreshToken?.();

    if (status === 401 && original && !original._retry && hasRefreshToken && !isAuthEndpoint(original.url)) {
      original._retry = true;

      if (!refreshPromise) {
        refreshPromise = performRefresh().finally(() => {
          refreshPromise = null;
        });
      }

      const newToken = await refreshPromise;
      if (newToken) {
        original.headers.set('Authorization', `Bearer ${newToken}`);
        return Axios(original);
      }

      // Refresh failed — session is no longer valid.
      authAdapter?.logout?.();
    }

    return Promise.reject(error);
  }
);

export const request = <T>(config: AxiosRequestConfig): Promise<T> => {
  return Axios.request(config);
};

export { Axios };
export default Axios;
