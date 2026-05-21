import { Axios } from '@/lib/axios';
import type { BaseResponse } from '../_types';
import type { Conversation, Message } from '@/types/domain';

const MessageApiKeys = {
  conversations: '/messages/conversations',
  thread: (recipientId: string) => `/messages/conversations/${recipientId}`,
  send: '/messages',
  markRead: (id: string) => `/messages/${id}/read`,
  unreadCount: '/messages/unread-count',
} as const;

export const MessageQueryKeys = {
  conversations: 'message-conversations',
  thread: 'message-thread',
  unreadCount: 'message-unread-count',
} as const;

const messagesApi = {
  async getConversations(): Promise<BaseResponse<Conversation[]>> {
    return Axios.get(MessageApiKeys.conversations);
  },
  async getThread(recipientId: string, propertyId?: string): Promise<BaseResponse<Message[]>> {
    const params = propertyId ? { propertyId } : {};
    return Axios.get(MessageApiKeys.thread(recipientId), { params });
  },
  async send(payload: { recipientId: string; propertyId?: string; bookingId?: string; body: string }): Promise<BaseResponse<Message>> {
    return Axios.post(MessageApiKeys.send, payload);
  },
  async markRead(id: string): Promise<BaseResponse> {
    return Axios.put(MessageApiKeys.markRead(id));
  },
  async getUnreadCount(): Promise<BaseResponse<{ count: number }>> {
    return Axios.get(MessageApiKeys.unreadCount);
  },
};

export default messagesApi;
