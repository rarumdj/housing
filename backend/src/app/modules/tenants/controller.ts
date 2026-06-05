import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/response';
import AppError from '../../utils/appError';
import * as TenantService from './service';

export const me = async (req: Request, res: Response) => {
  const data = await TenantService.getMe(String(req.user?.id));
  return sendSuccess(res, { data });
};

export const profile = async (req: Request, res: Response) => {
  const data = await TenantService.getProfile(String(req.user?.id));
  return sendSuccess(res, { data });
};

export const updateProfile = async (req: Request, res: Response) => {
  const data = await TenantService.updateProfile(String(req.user?.id), req.body);
  return sendSuccess(res, { data });
};

export const completeOnboarding = async (req: Request, res: Response) => {
  const data = await TenantService.completeOnboarding(String(req.user?.id), req.body);
  return sendSuccess(res, { data, message: 'Onboarding completed' });
};

export const uploadDocuments = async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length === 0) {
    throw new AppError('No files provided', 400);
  }
  const labels = ([] as string[]).concat(req.body.labels ?? []);
  await TenantService.uploadDocuments(String(req.user?.id), files, labels);
  return sendSuccess(res, { statusCode: 201, message: 'Documents uploaded' });
};

export const deleteDocument = async (req: Request, res: Response) => {
  await TenantService.deleteDocument(String(req.user?.id), req.body.url);
  return sendSuccess(res, { message: 'Document deleted' });
};

export const sendPhoneOtp = async (req: Request, res: Response) => {
  const data = await TenantService.sendPhoneOtp(String(req.user?.id));
  return sendSuccess(res, { message: 'Verification code sent', data });
};

export const verifyPhoneOtp = async (req: Request, res: Response) => {
  const data = await TenantService.verifyPhoneOtp(String(req.user?.id), req.body.code);
  return sendSuccess(res, { message: 'Phone verified', data });
};

export const myBookings = async (req: Request, res: Response) => {
  const data = await TenantService.getBookings(String(req.user?.id));
  return sendSuccess(res, { data });
};

export const myLeases = async (req: Request, res: Response) => {
  const data = await TenantService.getLeases(String(req.user?.id));
  return sendSuccess(res, { data });
};
