import { Request, Response } from 'express';
import * as AuthService from './service';
import { sendSuccess } from '../../utils/response';

export async function createUser(req: Request, res: Response) {
  const data = await AuthService.createUser(req.body);
  return sendSuccess(res, { statusCode: 201, data });
}

export async function login(req: Request, res: Response) {
  const data = await AuthService.login(req.body);
  return sendSuccess(res, { data });
}

export async function refresh(req: Request, res: Response) {
  const data = await AuthService.refresh(req.body.refreshToken);
  return sendSuccess(res, { data });
}

export async function logout(req: Request, res: Response) {
  if (req.user && req.body.refreshToken) {
    await AuthService.logout(req.user.id, req.body.refreshToken);
  }

  return sendSuccess(res, { message: 'Logged out' });
}

export async function me(req: Request, res: Response) {
  const data = await AuthService.getMe(String(req.user?.id));
  return sendSuccess(res, { data });
}
