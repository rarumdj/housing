import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import messagesApi, { MessageQueryKeys } from './api';

export const useConversationsQuery = () => {
  return useQuery({
    queryKey: [MessageQueryKeys.conversations],
    queryFn: () => messagesApi.getConversations(),
    refetchInterval: 15000,
  });
};

export const useThreadQuery = (recipientId: string, propertyId?: string) => {
  return useQuery({
    queryKey: [MessageQueryKeys.thread, recipientId, propertyId],
    queryFn: () => messagesApi.getThread(recipientId, propertyId),
    enabled: !!recipientId,
    refetchInterval: 5000,
  });
};

export const useSendMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { recipientId: string; propertyId?: string; bookingId?: string; body: string }) =>
      messagesApi.send(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [MessageQueryKeys.thread, variables.recipientId, variables.propertyId] });
      queryClient.invalidateQueries({ queryKey: [MessageQueryKeys.conversations] });
    },
  });
};

export const useMarkReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => messagesApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MessageQueryKeys.conversations] });
      queryClient.invalidateQueries({ queryKey: [MessageQueryKeys.unreadCount] });
    },
  });
};

export const useUnreadCountQuery = () => {
  return useQuery({
    queryKey: [MessageQueryKeys.unreadCount],
    queryFn: () => messagesApi.getUnreadCount(),
    refetchInterval: 30000,
  });
};
