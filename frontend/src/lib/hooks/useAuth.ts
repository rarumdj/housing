import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { getPostLoginPath } from '@/routes/keys';
import { useAuthStore } from '@/store/authStore';

export const useLogin = () => {
  const { setUser, setTokens } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post('/auth/login', data).then((r) => r.data.data),
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      navigate(getPostLoginPath(data.user.role));
    },
  });
};

export const useRegister = () => {
  const { setUser, setTokens } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: {
      email: string; password: string; phone: string;
      firstName: string; lastName: string; role: 'LANDLORD' | 'TENANT';
    }) => api.post('/auth/register', data).then((r) => r.data.data),
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      navigate(data.user.role === 'LANDLORD' ? '/landlord/onboard' : '/onboard');
    },
  });
};

export const useLogout = () => {
  const { logout, refreshToken } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => api.post('/auth/logout', { refreshToken }),
    onSettled: () => {
      logout();
      qc.clear();
      navigate('/');
    },
  });
};

export const useMe = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me').then((r) => r.data.data),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 10,
  });
};
