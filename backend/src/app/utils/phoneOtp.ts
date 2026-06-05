import UserRepo from '../repositories/user.repo';
import AppError from './appError';
import { sendOtpSms } from './sms';
import { env } from './env';

const OTP_TTL_MS = 10 * 60 * 1000;

export const sendPhoneOtp = async (userId: string) => {
  const user = await UserRepo.getById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.get('isPhoneVerified')) {
    return { alreadyVerified: true };
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  await UserRepo.update(
    { phoneOtpCode: code, phoneOtpExpires: new Date(Date.now() + OTP_TTL_MS) },
    { id: userId },
  );

  const result = await sendOtpSms(String(user.get('phone')), code);

  // When SMS is not configured (dev), surface the code so the flow is testable.
  return {
    sent: true,
    ...(result.delivered ? {} : { devCode: env.nodeEnv === 'production' ? undefined : code }),
  };
};

export const verifyPhoneOtp = async (userId: string, code: string) => {
  const user = await UserRepo.getById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const storedCode = user.get('phoneOtpCode') as string | null;
  const expires = user.get('phoneOtpExpires') as Date | null;

  if (!storedCode || storedCode !== code) {
    throw new AppError('Invalid verification code', 400);
  }

  if (expires && new Date(expires).getTime() < Date.now()) {
    throw new AppError('Verification code has expired', 400);
  }

  await UserRepo.update(
    { isPhoneVerified: true, phoneOtpCode: null, phoneOtpExpires: null },
    { id: userId },
  );

  return { verified: true };
};
