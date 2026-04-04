import TenantRepo from '../../repositories/tenant.repo';

export async function getMe(userId: string) {
  return TenantRepo.getByUserId(userId);
}

export async function getBookings(userId: string) {
  return TenantRepo.getBookingsByUserId(userId);
}

export async function getLeases(userId: string) {
  return TenantRepo.getLeasesByUserId(userId);
}
