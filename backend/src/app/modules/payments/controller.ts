import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/response';
import * as PaymentService from './service';

export const webhook = async (req: Request, res: Response) => {
  const data = await PaymentService.handleWebhook(req.body, 'paystack');
  return res.status(200).json(data);
};

export const flutterwaveWebhook = async (req: Request, res: Response) => {
  const data = await PaymentService.handleWebhook(req.body, 'flutterwave');
  return res.status(200).json(data);
};

export const history = async (req: Request, res: Response) => {
  const data = await PaymentService.getHistory(String(req.user?.id), String(req.user?.role));
  return sendSuccess(res, { data });
};
