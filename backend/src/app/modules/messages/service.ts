import { v4 as uuidv4 } from 'uuid';
import MessageRepo from '../../repositories/message.repo';
import AppError from '../../utils/appError';

export async function getConversations(userId: string) {
  return MessageRepo.getConversations(userId);
}

export async function getThread(userId: string, otherUserId: string, propertyId?: string) {
  return MessageRepo.getThread(userId, otherUserId, propertyId);
}

export async function send(
  senderId: string,
  payload: { recipientId: string; propertyId?: string; bookingId?: string; body: string },
) {
  if (senderId === payload.recipientId) {
    throw new AppError('Cannot send a message to yourself', 400);
  }

  const message = await MessageRepo.create({
    id: uuidv4(),
    senderId,
    recipientId: payload.recipientId,
    propertyId: payload.propertyId || null,
    bookingId: payload.bookingId || null,
    body: payload.body,
  });

  return message;
}

export async function markRead(messageId: string, userId: string) {
  await MessageRepo.markRead(messageId, userId);
}

export async function getUnreadCount(userId: string) {
  return MessageRepo.getUnreadCount(userId);
}
