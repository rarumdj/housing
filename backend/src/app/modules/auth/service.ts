import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import LandlordRepo from '../../repositories/landlord.repo';
import RefreshTokenRepo from '../../repositories/refreshToken.repo';
import TenantRepo from '../../repositories/tenant.repo';
import UserRepo from '../../repositories/user.repo';
import AppError from '../../utils/appError';
import { generateTokens, verifyRefreshToken } from '../../utils/auth';
import { env } from '../../utils/env';
import { sendVerificationEmail } from '../../utils/mailer';

const EMAIL_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

// Until transactional email is integrated, the OTP is a fixed value.
const STATIC_EMAIL_OTP = '000000';

const issueEmailVerification = async (userId: string | number, email: string, firstName: string) => {
  const intentCode = randomBytes(16).toString('hex');
  const otp = STATIC_EMAIL_OTP;
  const expiresAt = new Date(Date.now() + EMAIL_TOKEN_TTL_MS);

  await UserRepo.update(
    { emailVerificationToken: intentCode, emailOtpCode: otp, emailVerificationExpires: expiresAt },
    { id: userId },
  );

  const verifyUrl = `${env.clientUrl}/email-verify/${intentCode}`;
  await sendVerificationEmail(email, firstName, `${verifyUrl} (code: ${otp})`);

  return { intentCode, otp };
};

const buildSession = async (user: {
  get: (key: string) => unknown;
}) => {
  const tokens = await generateTokens(
    user.get('id') as number,
    String(user.get('code')),
    String(user.get('role')),
    String(user.get('email')),
  );

  return {
    user: {
      id: String(user.get('id')),
      code: String(user.get('code')),
      email: String(user.get('email')),
      role: String(user.get('role')),
      firstName: String(user.get('firstName')),
      lastName: String(user.get('lastName')),
      isEmailVerified: Boolean(user.get('isEmailVerified')),
      isPhoneVerified: Boolean(user.get('isPhoneVerified')),
    },
    ...tokens,
  };
};

export const createUser = async (payload: {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}) => {
  if (payload.role === 'ADMIN') {
    throw new AppError('Admin accounts cannot be created via registration', 403);
  }

  const email = payload.email.trim().toLowerCase();
  const existing = await UserRepo.getByEmailOrPhone(email, payload.phone);
  if (existing) {
    const field = existing.get('email') === email ? 'email' : 'phone';
    throw new AppError(`An account with this ${field} already exists`, 409);
  }

  const passwordHash = await bcrypt.hash(payload.password, 12);

  const createdUser = await UserRepo.create({
    email,
    phone: payload.phone,
    passwordHash,
    firstName: payload.firstName,
    lastName: payload.lastName,
    role: payload.role,
    isEmailVerified: false,
  });
  const userId = createdUser.get('id') as number;

  if (payload.role === 'LANDLORD') {
    await LandlordRepo.create({ userId });
  }

  if (payload.role === 'TENANT') {
    await TenantRepo.create({ userId });
  }

  const { intentCode } = await issueEmailVerification(userId, email, payload.firstName);

  // Account stays pending until the email is verified — no tokens issued here.
  return {
    requiresEmailVerification: true,
    email,
    role: payload.role,
    firstName: payload.firstName,
    intentCode,
  };
}

export const createEmailVerificationIntent = async (rawEmail: string) => {
  const email = rawEmail.trim().toLowerCase();
  const user = await UserRepo.getByEmail(email);

  if (!user || user.get('isEmailVerified')) {
    // Avoid leaking which emails exist / are already verified.
    return { intentCode: null, alreadyVerified: Boolean(user?.get('isEmailVerified')) };
  }

  const { intentCode } = await issueEmailVerification(
    String(user.get('id')),
    email,
    String(user.get('firstName')),
  );

  return { intentCode, alreadyVerified: false };
};

export const confirmEmailVerification = async (intentCode: string, otp: string) => {
  const user = await UserRepo.getOne({ emailVerificationToken: intentCode });
  if (!user) {
    throw new AppError('Invalid or expired verification request', 400);
  }

  const expires = user.get('emailVerificationExpires') as Date | null;
  if (expires && new Date(expires).getTime() < Date.now()) {
    throw new AppError('Verification code has expired. Please request a new one.', 400);
  }

  if (String(user.get('emailOtpCode')) !== String(otp)) {
    throw new AppError('Invalid verification code', 400);
  }

  await UserRepo.update(
    {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailOtpCode: null,
      emailVerificationExpires: null,
      lastLoginAt: new Date(),
    },
    { id: user.get('id') },
  );

  // Reflect the verified state in the returned session (the loaded instance
  // still holds the pre-update value).
  (user as { set: (key: string, value: unknown) => void }).set('isEmailVerified', true);

  // Auto sign-in after verification.
  return buildSession(user);
};

export const login = async (payload: { email: string; password: string }) => {
  const email = payload.email.trim().toLowerCase();
  const user = await UserRepo.getByEmail(email);
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(payload.password, String(user.get('passwordHash') ?? ''));
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.get('isActive')) {
    throw new AppError('Account has been deactivated', 403);
  }

  if (!user.get('isEmailVerified')) {
    throw new AppError('Please verify your email before signing in', 403);
  }

  await UserRepo.update({ lastLoginAt: new Date() }, { id: user.get('id') });

  return buildSession(user);
};

export const refresh = async (refreshToken: string) => {
  const user = await verifyRefreshToken(refreshToken);
  if (!user) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  return generateTokens(user.id, user.code, user.role, user.email);
};

export const logout = async (userId: string, refreshToken: string) => {
  await RefreshTokenRepo.deleteMany({ userId, token: refreshToken });
};

export const getMe = async (userId: string) => {
  return UserRepo.getProfileById(userId);
};
