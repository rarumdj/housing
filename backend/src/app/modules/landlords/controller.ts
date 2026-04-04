import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/response';
import * as LandlordService from './service';

export async function me(req: Request, res: Response) {
  const data = await LandlordService.getMe(String(req.user?.id));
  return sendSuccess(res, { data });
}

export async function updateMe(req: Request, res: Response) {
  const data = await LandlordService.updateMe(String(req.user?.id), req.body);
  return sendSuccess(res, { data });
}

export async function tenants(req: Request, res: Response) {
  const data = await LandlordService.getTenants(String(req.user?.id));
  return sendSuccess(res, { data });
}
