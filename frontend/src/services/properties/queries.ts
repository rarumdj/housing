import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import propertiesApi from './api';
import { PropertyQueryKeys } from './keys';
import type { AddRoomPayload, CreatePropertyPayload, PropertyFilters, UpdatePropertyPayload } from './types';

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

export const usePropertyActivityQuery = (id: string) => {
  return useQuery({
    queryKey: [PropertyQueryKeys.activity, id],
    queryFn: () => propertiesApi.activity(id),
    enabled: !!id,
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

export const useUpdatePropertyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }: UpdatePropertyPayload & { id: string }) =>
      propertiesApi.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [PropertyQueryKeys.myProperties] });
      queryClient.invalidateQueries({ queryKey: [PropertyQueryKeys.detail, variables.id] });
    },
  });
};

export const useDeletePropertyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => propertiesApi.deleteProperty(id),
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

export const useUploadMediaMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ propertyId, files }: { propertyId: string; files: File[] }) =>
      propertiesApi.uploadMedia(propertyId, files),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [PropertyQueryKeys.detail, variables.propertyId] });
      queryClient.invalidateQueries({ queryKey: [PropertyQueryKeys.activity, variables.propertyId] });
    },
  });
};

export const useDeleteMediaMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ propertyId, mediaId }: { propertyId: string; mediaId: string }) =>
      propertiesApi.deleteMedia(propertyId, mediaId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [PropertyQueryKeys.detail, variables.propertyId] });
    },
  });
};

export const useSetCoverMediaMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ propertyId, mediaId }: { propertyId: string; mediaId: string }) =>
      propertiesApi.setCoverMedia(propertyId, mediaId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [PropertyQueryKeys.detail, variables.propertyId] });
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
