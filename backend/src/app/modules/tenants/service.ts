import TenantRepo from '../../repositories/tenant.repo';
import AppError from '../../utils/appError';

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

export async function getMe(userId: string) {
  return TenantRepo.getByUserId(userId);
}

export async function getProfile(userId: string) {
  const profile = await TenantRepo.getFullProfileByUserId(userId);
  if (!profile) {
    throw new AppError('Tenant profile not found', 404);
  }
  return profile;
}

export async function updateProfile(userId: string, payload: Record<string, unknown>) {
  const tenant = await TenantRepo.getByUserId(userId);
  if (!tenant) {
    throw new AppError('Tenant profile not found', 404);
  }

  const updated = await TenantRepo.updateByUserId(userId, payload);
  return updated;
}

export async function completeOnboarding(userId: string, payload: Record<string, unknown>) {
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
}

export async function getBookings(userId: string) {
  return TenantRepo.getBookingsByUserId(userId);
}

export async function getLeases(userId: string) {
  return TenantRepo.getLeasesByUserId(userId);
}
