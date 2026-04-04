import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import LandlordRepo from '../../repositories/landlord.repo';
import RefreshTokenRepo from '../../repositories/refreshToken.repo';
import TenantRepo from '../../repositories/tenant.repo';
import UserRepo from '../../repositories/user.repo';
import AppError from '../../utils/appError';
import { generateTokens, verifyRefreshToken } from '../../utils/auth';

export async function createUser(payload: {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}) {
  const existing = await UserRepo.getByEmailOrPhone(payload.email, payload.phone);
  if (existing) {
    const field = existing.get('email') === payload.email ? 'email' : 'phone';
    throw new AppError(`An account with this ${field} already exists`, 409);
  }

  const passwordHash = await bcrypt.hash(payload.password, 12);
  const userId = uuidv4();

  await UserRepo.create({
    id: userId,
    email: payload.email,
    phone: payload.phone,
    passwordHash,
    firstName: payload.firstName,
    lastName: payload.lastName,
    role: payload.role,
  });

  if (payload.role === 'LANDLORD') {
    await LandlordRepo.create({
      id: uuidv4(),
      userId,
    });
  }

  if (payload.role === 'TENANT') {
    await TenantRepo.create({
      id: uuidv4(),
      userId,
    });
  }

  const tokens = await generateTokens(userId, payload.role, payload.email);

  return {
    user: {
      id: userId,
      email: payload.email,
      role: payload.role,
      firstName: payload.firstName,
      lastName: payload.lastName,
    },
    ...tokens,
  };
}

export async function login(payload: { email: string; password: string }) {
  const user = await UserRepo.getByEmail(payload.email);
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(payload.password, String(user.get('passwordHash')));
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.get('isActive')) {
    throw new AppError('Account has been deactivated', 403);
  }

  await UserRepo.update({ lastLoginAt: new Date() }, { id: user.get('id') });

  const tokens = await generateTokens(
    String(user.get('id')),
    String(user.get('role')),
    String(user.get('email')),
  );

  return {
    user: {
      id: String(user.get('id')),
      email: String(user.get('email')),
      role: String(user.get('role')),
      firstName: String(user.get('firstName')),
      lastName: String(user.get('lastName')),
    },
    ...tokens,
  };
}

export async function refresh(refreshToken: string) {
  const user = await verifyRefreshToken(refreshToken);
  if (!user) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  return generateTokens(user.id, user.role, user.email);
}

export async function logout(userId: string, refreshToken: string) {
  await RefreshTokenRepo.deleteMany({ userId, token: refreshToken });
}

export async function getMe(userId: string) {
  return UserRepo.getProfileById(userId);
}
