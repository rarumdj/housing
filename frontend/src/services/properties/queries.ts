import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import propertiesApi from './api';
import { PropertyQueryKeys } from './keys';
import type { AddRoomPayload, CreatePropertyPayload, PropertyFilters } from './types';

export const usePropertiesQuery = (filters: PropertyFilters = {}) => {
  return useQuery({
    queryKey: [PropertyQueryKeys.list, filters],
    queryFn: () => propertiesApi.list(filters),
    staleTime: 1000 * 60 * 2,
  });
};

export const usePropertyQuery = (id: string) => {
  return useQuery({
    queryKey: [PropertyQueryKeys.detail, id],
    queryFn: () => propertiesApi.detail(id),
    enabled: !!id,
  });
};

export const useMyPropertiesQuery = () => {
  return useQuery({
    queryKey: [PropertyQueryKeys.myProperties],
    queryFn: () => propertiesApi.myProperties(),
  });
};

export const useCreatePropertyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePropertyPayload) => propertiesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PropertyQueryKeys.myProperties] });
    },
  });
};

export const usePublishPropertyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => propertiesApi.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PropertyQueryKeys.myProperties] });
    },
  });
};

export const useAddRoomMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ propertyId, ...payload }: AddRoomPayload & { propertyId: string }) =>
      propertiesApi.addRoom(propertyId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [PropertyQueryKeys.detail, variables.propertyId] });
    },
  });
};
