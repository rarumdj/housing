import BookingRepo from '../../repositories/booking.repo';
import LandlordRepo from '../../repositories/landlord.repo';
import LeaseRepo from '../../repositories/lease.repo';
import PropertyRepo from '../../repositories/property.repo';
import UserRepo from '../../repositories/user.repo';
import AppError from '../../utils/appError';
import { uploadToStorage, deleteFromStorage } from '../../utils/storage';
import { sendOtpSms } from '../../utils/sms';
import { env } from '../../utils/env';
import { createPayoutAccount, type PaymentProvider } from '../../utils/paymentProvider';

const ONBOARDING_REQUIRED_FIELDS: string[] = [
  'dateOfBirth',
  'idType',
  'idNumber',
  'residentialAddress',
  'city',
  'state',
  'ownershipType',
  'contactMethod',
];

// Columns promoted out of the free-form onboardingData JSON blob.
const PROMOTED_FIELDS = [
  'dateOfBirth',
  'idType',
  'idNumber',
  'residentialAddress',
  'city',
  'state',
  'country',
  'ownershipType',
  'operationType',
  'businessName',
  'cacNumber',
  'tin',
  'contactMethod',
  'payoutPreference',
] as const;

const OTP_TTL_MS = 10 * 60 * 1000;

export const getMe = async (userId: string) => {
  return LandlordRepo.getByUserId(userId);
};

export const updateMe = async (userId: string, payload: Record<string, unknown>) => {
  return LandlordRepo.updateByUserId(userId, payload);
};

const buildLandlordUpdate = (landlord: { get: (key: string) => unknown }, payload: Record<string, unknown>) => {
  const update: Record<string, unknown> = {};

  for (const field of PROMOTED_FIELDS) {
    if (payload[field] !== undefined) {
      update[field] = payload[field];
    }
  }

  if (payload.bankAccount !== undefined) {
    update.bankAccount = payload.bankAccount;
  }

  if (payload.data !== undefined && payload.data !== null) {
    const existing = (landlord.get('onboardingData') as Record<string, unknown> | null) ?? {};
    update.onboardingData = { ...existing, ...(payload.data as Record<string, unknown>) };
  }

  if (payload.step !== undefined) {
    update.onboardingStep = payload.step;
  }

  return update;
};

export const getOnboarding = async (userId: string) => {
  const landlord = await LandlordRepo.getByUserId(userId);
  if (!landlord) {
    throw new AppError('Landlord profile not found', 404);
  }
  return landlord;
};

export const saveOnboarding = async (userId: string, payload: Record<string, unknown>) => {
  const landlord = await LandlordRepo.getRawByUserId(userId);
  if (!landlord) {
    throw new AppError('Landlord profile not found', 404);
  }

  const update = buildLandlordUpdate(landlord, payload);

  if (String(landlord.get('onboardingStatus')) === 'PENDING') {
    update.onboardingStatus = 'IN_PROGRESS';
  }

  return LandlordRepo.updateByUserId(userId, update);
};

export const completeOnboarding = async (userId: string, payload: Record<string, unknown>) => {
  const landlord = await LandlordRepo.getRawByUserId(userId);
  if (!landlord) {
    throw new AppError('Landlord profile not found', 404);
  }

  const update = buildLandlordUpdate(landlord, payload);
  const merged = { ...landlord.toJSON(), ...update } as Record<string, unknown>;

  const missing = ONBOARDING_REQUIRED_FIELDS.filter((field) => {
    const value = merged[field];
    return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
  });

  if (missing.length > 0) {
    throw new AppError(`Missing required fields: ${missing.join(', ')}`, 400);
  }

  update.onboardingStatus = 'COMPLETED';
  update.isOnboarded = true;

  // Move KYC into review once the wizard is finished/resubmitted. A previously
  // rejected landlord goes back into the review queue and the old note is cleared.
  const currentVerification = String(landlord.get('verificationStatus'));
  if (currentVerification === 'PENDING' || currentVerification === 'REJECTED') {
    update.verificationStatus = 'UNDER_REVIEW';
    update.verificationNote = null;
  }

  return LandlordRepo.updateByUserId(userId, update);
};

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

export const connectPayout = async (userId: string, payload: { provider: PaymentProvider; bankCode: string; accountNumber: string; accountName: string; bankName?: string; payoutPreference?: string }) => {
  const landlord = await LandlordRepo.getRawByUserId(userId);
  if (!landlord) {
    throw new AppError('Landlord profile not found', 404);
  }

  const businessName =
    String(landlord.get('businessName') || '') || payload.accountName;

  const account = await createPayoutAccount(payload.provider, {
    businessName,
    bankCode: payload.bankCode,
    accountNumber: payload.accountNumber,
  });

  return LandlordRepo.updateByUserId(userId, {
    payoutProvider: account.provider,
    payoutSubaccountCode: account.subaccountCode,
    ...(payload.payoutPreference ? { payoutPreference: payload.payoutPreference } : {}),
    bankAccount: {
      accountName: payload.accountName,
      accountNumber: payload.accountNumber,
      bankCode: payload.bankCode,
      bankName: payload.bankName ?? '',
    },
  });
};

export const uploadDocuments = async (userId: string, files: Express.Multer.File[], labels: string[]) => {
  const landlord = await LandlordRepo.getRawByUserId(userId);
  if (!landlord) {
    throw new AppError('Landlord profile not found', 404);
  }

  const uploaded = await Promise.all(
    files.map(async (file, index) => {
      const url = await uploadToStorage(file.buffer, file.mimetype, 'landlord-documents');
      return {
        label: labels[index] || file.fieldname || `document-${index + 1}`,
        url,
        uploadedAt: new Date().toISOString(),
      };
    }),
  );

  // A re-upload replaces the previous documents — only the latest set is kept.
  return LandlordRepo.updateByUserId(userId, {
    verificationDocs: uploaded,
  });
};

export const deleteDocument = async (userId: string, url: string) => {
  const landlord = await LandlordRepo.getRawByUserId(userId);
  if (!landlord) {
    throw new AppError('Landlord profile not found', 404);
  }

  const existing = (landlord.get('verificationDocs') as Array<Record<string, unknown>> | null) ?? [];
  const remaining = existing.filter((doc) => String(doc.url) !== url);

  if (remaining.length === existing.length) {
    throw new AppError('Document not found', 404);
  }

  // Best-effort removal from storage (no-op for remote/Cloudinary URLs).
  await deleteFromStorage(url).catch(() => undefined);

  return LandlordRepo.updateByUserId(userId, {
    verificationDocs: remaining,
  });
};

export const getTenants = async (userId: string) => {
  const landlord = await LandlordRepo.getByUserId(userId);
  if (!landlord) {
    throw new AppError('Landlord not found', 404);
  }

  const properties = await PropertyRepo.getIdsByLandlordId(String(landlord.get('id')));
  const propertyIds = properties.map((item) => String(item.get('id')));

  if (propertyIds.length === 0) {
    return [];
  }

  return BookingRepo.getByPropertyIdsAndStatuses(propertyIds, ['ACTIVE', 'PAID']);
};

export const getBookings = async (userId: string, statuses?: string[]) => {
  const landlord = await LandlordRepo.getByUserId(userId);
  if (!landlord) {
    throw new AppError('Landlord not found', 404);
  }

  const properties = await PropertyRepo.getIdsByLandlordId(String(landlord.get('id')));
  const propertyIds = properties.map((item) => String(item.get('id')));

  if (propertyIds.length === 0) {
    return [];
  }

  return BookingRepo.getByPropertyIdsWithDetails(propertyIds, statuses);
};

export const terminateLease = async (userId: string, leaseId: string) => {
  const landlord = await LandlordRepo.getByUserId(userId);
  if (!landlord) {
    throw new AppError('Landlord not found', 404);
  }

  const lease = await LeaseRepo.getByIdWithDetails(leaseId);
  if (!lease) {
    throw new AppError('Lease not found', 404);
  }

  const property = lease.get('property') as Record<string, unknown> | undefined;
  if (property?.landlordId !== landlord.get('id')) {
    throw new AppError('Lease not found', 404);
  }

  const status = String(lease.get('status'));
  if (!['ACTIVE', 'PENDING_SIGNATURE'].includes(status)) {
    throw new AppError('Only active leases can be terminated', 400);
  }

  return LeaseRepo.update(leaseId, { status: 'TERMINATED' });
};
