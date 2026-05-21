import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/response';
import * as TenantService from './service';

export async function me(req: Request, res: Response) {
  const data = await TenantService.getMe(String(req.user?.id));
  return sendSuccess(res, { data });
}

export async function profile(req: Request, res: Response) {
  const data = await TenantService.getProfile(String(req.user?.id));
  return sendSuccess(res, { data });
}

export async function updateProfile(req: Request, res: Response) {
  const data = await TenantService.updateProfile(String(req.user?.id), req.body);
  return sendSuccess(res, { data });
}

export async function completeOnboarding(req: Request, res: Response) {
  const data = await TenantService.completeOnboarding(String(req.user?.id), req.body);
  return sendSuccess(res, { data, message: 'Onboarding completed' });
}

export async function myBookings(req: Request, res: Response) {
  const data = await TenantService.getBookings(String(req.user?.id));
  return sendSuccess(res, { data });
}

export async function myLeases(req: Request, res: Response) {
  const data = await TenantService.getLeases(String(req.user?.id));
  return sendSuccess(res, { data });
}
