import MessageRepo from '../../repositories/message.repo';
import UserRepo from '../../repositories/user.repo';
import PropertyRepo from '../../repositories/property.repo';
import BookingRepo from '../../repositories/booking.repo';
import AppError from '../../utils/appError';

const resolveUserId = async (code: string) => {
  const user = await UserRepo.getByCode(code);
  if (!user) throw new AppError('Recipient not found', 404);
  return user.get('id') as number;
};

const resolvePropertyId = async (code?: string | null) => {
  if (!code) return null;
  const property = await PropertyRepo.getById(code);
  return property ? (property.get('id') as number) : null;
};

const resolveBookingId = async (code?: string | null) => {
  if (!code) return null;
  const booking = await BookingRepo.getWithProperty(code);
  return booking ? (booking.get('id') as number) : null;
};

export const getConversations = async (userId: string) => {
  return MessageRepo.getConversations(userId);
};

export const getThread = async (userId: string, otherUserCode: string, propertyCode?: string) => {
  const otherUserId = await resolveUserId(otherUserCode);
  const propertyId = await resolvePropertyId(propertyCode);
  return MessageRepo.getThread(userId, String(otherUserId), propertyId ? String(propertyId) : undefined);
};

export const send = async (
  senderId: string,
  payload: { recipientId: string; propertyId?: string; bookingId?: string; body: string },
) => {
  const recipientId = await resolveUserId(payload.recipientId);
  if (String(senderId) === String(recipientId)) {
    throw new AppError('Cannot send a message to yourself', 400);
  }

  const message = await MessageRepo.create({
    senderId,
    recipientId,
    propertyId: await resolvePropertyId(payload.propertyId),
    bookingId: await resolveBookingId(payload.bookingId),
    body: payload.body,
  });

  return message;
};

export const markRead = async (messageId: string, userId: string) => {
  await MessageRepo.markRead(messageId, userId);
};

export const getUnreadCount = async (userId: string) => {
  return MessageRepo.getUnreadCount(userId);
};
