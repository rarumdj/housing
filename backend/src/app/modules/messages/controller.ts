import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/response';
import * as MessageService from './service';

export async function conversations(req: Request, res: Response) {
  const data = await MessageService.getConversations(String(req.user?.id));
  return sendSuccess(res, { data });
}

export async function thread(req: Request, res: Response) {
  const propertyId = req.query.propertyId as string | undefined;
  const data = await MessageService.getThread(
    String(req.user?.id),
    req.params.recipientId,
    propertyId || undefined,
  );
  return sendSuccess(res, { data });
}

export async function send(req: Request, res: Response) {
  const data = await MessageService.send(String(req.user?.id), req.body);
  return sendSuccess(res, { statusCode: 201, data });
}

export async function markRead(req: Request, res: Response) {
  await MessageService.markRead(req.params.id, String(req.user?.id));
  return sendSuccess(res, { message: 'Marked as read' });
}

export async function unreadCount(req: Request, res: Response) {
  const count = await MessageService.getUnreadCount(String(req.user?.id));
  return sendSuccess(res, { data: { count } });
}
