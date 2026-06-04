import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/response';
import AppError from '../../utils/appError';
import * as LandlordService from './service';

export const me = async (req: Request, res: Response) => {
  const data = await LandlordService.getMe(String(req.user?.id));
  return sendSuccess(res, { data });
};

export const updateMe = async (req: Request, res: Response) => {
  const data = await LandlordService.updateMe(String(req.user?.id), req.body);
  return sendSuccess(res, { data });
};

export const tenants = async (req: Request, res: Response) => {
  const data = await LandlordService.getTenants(String(req.user?.id));
  return sendSuccess(res, { data });
};

export const bookings = async (req: Request, res: Response) => {
  const statusParam = req.query.status as string | undefined;
  const statuses = statusParam ? statusParam.split(',').map((s) => s.trim()) : undefined;
  const data = await LandlordService.getBookings(String(req.user?.id), statuses);
  return sendSuccess(res, { data });
};

export const terminateLease = async (req: Request, res: Response) => {
  const data = await LandlordService.terminateLease(String(req.user?.id), req.params.id);
  return sendSuccess(res, { data });
};

export const getOnboarding = async (req: Request, res: Response) => {
  const data = await LandlordService.getOnboarding(String(req.user?.id));
  return sendSuccess(res, { data });
};

export const saveOnboarding = async (req: Request, res: Response) => {
  const data = await LandlordService.saveOnboarding(String(req.user?.id), req.body);
  return sendSuccess(res, { data });
};

export const completeOnboarding = async (req: Request, res: Response) => {
  const data = await LandlordService.completeOnboarding(String(req.user?.id), req.body);
  return sendSuccess(res, { message: 'Onboarding completed', data });
};

export const sendPhoneOtp = async (req: Request, res: Response) => {
  const data = await LandlordService.sendPhoneOtp(String(req.user?.id));
  return sendSuccess(res, { message: 'Verification code sent', data });
};

export const verifyPhoneOtp = async (req: Request, res: Response) => {
  const data = await LandlordService.verifyPhoneOtp(String(req.user?.id), req.body.code);
  return sendSuccess(res, { message: 'Phone verified', data });
};

export const connectPayout = async (req: Request, res: Response) => {
  const data = await LandlordService.connectPayout(String(req.user?.id), req.body);
  return sendSuccess(res, { message: 'Payout account connected', data });
};

export const uploadDocuments = async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length === 0) {
    throw new AppError('No files provided', 400);
  }
  const labels = ([] as string[]).concat(req.body.labels ?? []);
  await LandlordService.uploadDocuments(String(req.user?.id), files, labels);
  return sendSuccess(res, { statusCode: 201, message: 'Documents uploaded' });
};

export const deleteDocument = async (req: Request, res: Response) => {
  await LandlordService.deleteDocument(String(req.user?.id), req.body.url);
  return sendSuccess(res, { message: 'Document deleted' });
};
