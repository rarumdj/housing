import jwt, { SignOptions } from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import { env } from './env';
import AppError from './appError';
import UserRepo from '../repositories/user.repo';
import RefreshTokenRepo from '../repositories/refreshToken.repo';

// `sub` carries the public user code; userId (numeric) is used internally for FKs.
export const generateTokens = async (
  userId: number | string,
  userCode: string,
  role: string,
  email: string,
) => {
  const accessOptions: SignOptions = { expiresIn: env.jwt.accessExpires as SignOptions['expiresIn'] };
  const accessToken = jwt.sign({ sub: userCode, role, email }, env.jwt.accessSecret, accessOptions);

  const refreshToken = uuidv4();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await RefreshTokenRepo.create({
    userId,
    token: refreshToken,
    expiresAt,
  });

  return { accessToken, refreshToken };
};

export const verifyRefreshToken = async (token: string) => {
  const stored = await RefreshTokenRepo.getOne({
    token,
    expiresAt: {
      [Op.gt]: new Date(),
    },
  });

  if (!stored) return null;

  const user = await UserRepo.getById(stored.get('userId') as number);
  if (!user || !user.get('isActive')) return null;

  await RefreshTokenRepo.delete({ token });

  return {
    id: user.get('id') as number,
    code: String(user.get('code')),
    role: String(user.get('role')),
    email: String(user.get('email')),
  };
};

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, env.jwt.accessSecret) as {
      sub: string;
      role: string;
      email: string;
    };

    const user = await UserRepo.getByCode(payload.sub);
    if (!user || !user.get('isActive')) {
      throw new AppError('User not found or deactivated', 401);
    }

    req.user = {
      id: String(user.get('id')),
      code: String(user.get('code')),
      role: String(user.get('role')),
      email: String(user.get('email')),
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: true,
      message: error instanceof Error ? error.message : 'Invalid or expired token',
    });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: true,
        message: 'Insufficient permissions',
      });
    }

    return next();
  };
};
