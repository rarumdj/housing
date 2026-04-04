import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useProperties(filters: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => api.get('/properties', { params: filters }).then((r) => r.data),
    staleTime: 1000 * 60 * 2,
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => api.get(`/properties/${id}`).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useMyProperties() {
  return useQuery({
    queryKey: ['my-properties'],
    queryFn: () => api.get('/properties/my/list').then((r) => r.data.data),
  });
}

export function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post('/properties', data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-properties'] }),
  });
}

export function usePublishProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/properties/${id}/publish`).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-properties'] }),
  });
}

export function useAddRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ propertyId, ...data }: { propertyId: string } & Record<string, unknown>) =>
      api.post(`/properties/${propertyId}/rooms`, data).then((r) => r.data.data),
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['property', v.propertyId] }),
  });
}
