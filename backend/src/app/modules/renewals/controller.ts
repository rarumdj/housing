import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/response';
import * as RenewalService from './service';

export async function create(req: Request, res: Response) {
  const data = await RenewalService.createRenewal(req.body);
  return sendSuccess(res, { statusCode: 201, data });
}

export async function accept(req: Request, res: Response) {
  const data = await RenewalService.acceptRenewal(req.params.id);
  return sendSuccess(res, { data });
}

export async function appeal(req: Request, res: Response) {
  const data = await RenewalService.appealRenewal(req.params.id, req.body.reason || '');
  return sendSuccess(res, { data });
}
