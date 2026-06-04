import { Request, Response } from 'express';
import * as AuthService from './service';
import { sendSuccess } from '../../utils/response';

export const createUser = async (req: Request, res: Response) => {
  const data = await AuthService.createUser(req.body);
  return sendSuccess(res, {
    statusCode: 201,
    message: 'Account created. Check your email to verify your account.',
    data,
  });
};

export const createEmailIntent = async (req: Request, res: Response) => {
  const data = await AuthService.createEmailVerificationIntent(req.body.email);
  return sendSuccess(res, { message: 'Verification code sent', data });
};

export const confirmEmail = async (req: Request, res: Response) => {
  const data = await AuthService.confirmEmailVerification(req.body.intentCode, req.body.otp);
  return sendSuccess(res, { message: 'Email verified', data });
};

export const login = async (req: Request, res: Response) => {
  const data = await AuthService.login(req.body);
  return sendSuccess(res, { data });
};

export const refresh = async (req: Request, res: Response) => {
  const data = await AuthService.refresh(req.body.refreshToken);
  return sendSuccess(res, { data });
};

export const logout = async (req: Request, res: Response) => {
  if (req.user && req.body.refreshToken) {
    await AuthService.logout(req.user.id, req.body.refreshToken);
  }

  return sendSuccess(res, { message: 'Logged out' });
};

export const me = async (req: Request, res: Response) => {
  const data = await AuthService.getMe(String(req.user?.id));
  return sendSuccess(res, { data });
};
