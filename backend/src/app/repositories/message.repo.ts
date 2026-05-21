import { Op, fn, col, literal, type GroupOption } from 'sequelize';
import { Message, User, Property } from '../models';

const MessageRepo = {
  create: async (data: Record<string, unknown>) => Message.create(data),

  getById: async (id: string) => Message.findByPk(id),

  getConversations: async (userId: string) => {
    const caseExpr = `CASE WHEN senderId = '${userId.replace(/'/g, "''")}' THEN recipientId ELSE senderId END`;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [{ senderId: userId }, { recipientId: userId }],
      },
      attributes: [
        [fn('MAX', col('Message.id')), 'lastMessageId'],
        'propertyId',
        [literal(caseExpr) as unknown as string, 'otherUserId'],
      ],
      group: [literal(caseExpr), 'propertyId'] as unknown as GroupOption,
      order: [[fn('MAX', col('Message.createdAt')), 'DESC']],
      raw: true,
    }) as unknown as Array<{ lastMessageId: string; propertyId: string | null; otherUserId: string }>;

    if (messages.length === 0) return [];

    const messageIds = messages.map((m) => m.lastMessageId);
    const lastMessages = await Message.findAll({
      where: { id: { [Op.in]: messageIds } },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'firstName', 'lastName', 'avatarUrl'] },
        { model: User, as: 'recipient', attributes: ['id', 'firstName', 'lastName', 'avatarUrl'] },
        { model: Property, as: 'property', attributes: ['id', 'title'], required: false },
      ],
      order: [['createdAt', 'DESC']],
    });

    return lastMessages;
  },

  getThread: async (userId: string, otherUserId: string, propertyId?: string) => {
    const where: Record<string, unknown> = {
      [Op.or]: [
        { senderId: userId, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: userId },
      ],
    };

    if (propertyId) {
      where.propertyId = propertyId;
    }

    return Message.findAll({
      where,
      include: [
        { model: User, as: 'sender', attributes: ['id', 'firstName', 'lastName', 'avatarUrl'] },
      ],
      order: [['createdAt', 'ASC']],
    });
  },

  markRead: async (id: string, userId: string) => {
    await Message.update(
      { readAt: new Date() },
      { where: { id, recipientId: userId, readAt: null } },
    );
  },

  getUnreadCount: async (userId: string) =>
    Message.count({ where: { recipientId: userId, readAt: null } }),
};

export default MessageRepo;
