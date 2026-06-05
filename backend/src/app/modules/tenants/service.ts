import TenantRepo from '../../repositories/tenant.repo';
import AppError from '../../utils/appError';
import { uploadToStorage, deleteFromStorage } from '../../utils/storage';

export { sendPhoneOtp, verifyPhoneOtp } from '../../utils/phoneOtp';

const ONBOARDING_REQUIRED_FIELDS = [
  'employmentStatus',
  'nationalIdType',
  'nationalIdNumber',
  'maritalStatus',
  'currentAddress',
  'nextOfKinName',
  'nextOfKinPhone',
  'nextOfKinRelationship',
];

export const getMe = async (userId: string) => {
  return TenantRepo.getByUserId(userId);
};

export const getProfile = async (userId: string) => {
  const profile = await TenantRepo.getFullProfileByUserId(userId);
  if (!profile) {
    throw new AppError('Tenant profile not found', 404);
  }
  return profile;
};

export const updateProfile = async (userId: string, payload: Record<string, unknown>) => {
  const tenant = await TenantRepo.getByUserId(userId);
  if (!tenant) {
    throw new AppError('Tenant profile not found', 404);
  }

  const updated = await TenantRepo.updateByUserId(userId, payload);
  return updated;
};

export const completeOnboarding = async (userId: string, payload: Record<string, unknown>) => {
  const tenant = await TenantRepo.getByUserId(userId);
  if (!tenant) {
    throw new AppError('Tenant profile not found', 404);
  }

  const merged = { ...tenant.toJSON(), ...payload };
  const missing = ONBOARDING_REQUIRED_FIELDS.filter(
    (f) => !merged[f] || (typeof merged[f] === 'string' && (merged[f] as string).trim() === ''),
  );

  if (missing.length > 0) {
    throw new AppError(`Missing required fields: ${missing.join(', ')}`, 400);
  }

  const updated = await TenantRepo.updateByUserId(userId, {
    ...payload,
    isOnboarded: true,
    kycStatus: 'SUBMITTED',
  });

  return updated;
};

export const uploadDocuments = async (userId: string, files: Express.Multer.File[], labels: string[]) => {
  const tenant = await TenantRepo.getByUserId(userId);
  if (!tenant) {
    throw new AppError('Tenant profile not found', 404);
  }

  const existing = (tenant.get('kycDocs') as Array<Record<string, unknown>> | null) ?? [];

  const uploaded = await Promise.all(
    files.map(async (file, index) => {
      const url = await uploadToStorage(file.buffer, file.mimetype, 'tenant-documents');
      return {
        label: labels[index] || file.fieldname || `document-${index + 1}`,
        url,
        uploadedAt: new Date().toISOString(),
      };
    }),
  );

  return TenantRepo.updateByUserId(userId, { kycDocs: [...existing, ...uploaded] });
};

export const deleteDocument = async (userId: string, url: string) => {
  const tenant = await TenantRepo.getByUserId(userId);
  if (!tenant) {
    throw new AppError('Tenant profile not found', 404);
  }

  const existing = (tenant.get('kycDocs') as Array<Record<string, unknown>> | null) ?? [];
  const remaining = existing.filter((doc) => String(doc.url) !== url);

  if (remaining.length === existing.length) {
    throw new AppError('Document not found', 404);
  }

  await deleteFromStorage(url).catch(() => undefined);

  return TenantRepo.updateByUserId(userId, { kycDocs: remaining });
};

export const getBookings = async (userId: string) => {
  return TenantRepo.getBookingsByUserId(userId);
};

export const getLeases = async (userId: string) => {
  return TenantRepo.getLeasesByUserId(userId);
};
