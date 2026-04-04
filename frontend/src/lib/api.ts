import axios from 'axios';

export const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('hh-auth');
  if (raw) {
    const { accessToken } = JSON.parse(raw);
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const raw = localStorage.getItem('hh-auth');
        if (!raw) return Promise.reject(error);
        const { refreshToken } = JSON.parse(raw);
        const { data } = await axios.post('/api/v1/auth/refresh', { refreshToken });
        const tokens = { accessToken: data.data.accessToken, refreshToken: data.data.refreshToken };
        localStorage.setItem('hh-auth', JSON.stringify({ ...JSON.parse(raw), ...tokens }));
        original.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('hh-auth');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
