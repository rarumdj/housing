import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/response';
import * as RenewalService from './service';

export const create = async (req: Request, res: Response) => {
  const data = await RenewalService.createRenewal(req.body);
  return sendSuccess(res, { statusCode: 201, data });
};

export const accept = async (req: Request, res: Response) => {
  const data = await RenewalService.acceptRenewal(req.params.id);
  return sendSuccess(res, { data });
};

export const appeal = async (req: Request, res: Response) => {
  const data = await RenewalService.appealRenewal(req.params.id, req.body.reason || '');
  return sendSuccess(res, { data });
};
