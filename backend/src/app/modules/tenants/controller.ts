import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/response';
import * as TenantService from './service';

export async function me(req: Request, res: Response) {
  const data = await TenantService.getMe(String(req.user?.id));
  return sendSuccess(res, { data });
}

export async function myBookings(req: Request, res: Response) {
  const data = await TenantService.getBookings(String(req.user?.id));
  return sendSuccess(res, { data });
}

export async function myLeases(req: Request, res: Response) {
  const data = await TenantService.getLeases(String(req.user?.id));
  return sendSuccess(res, { data });
}
