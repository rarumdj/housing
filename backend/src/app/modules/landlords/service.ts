import BookingRepo from '../../repositories/booking.repo';
import LandlordRepo from '../../repositories/landlord.repo';
import LeaseRepo from '../../repositories/lease.repo';
import PropertyRepo from '../../repositories/property.repo';
import AppError from '../../utils/appError';

export async function getMe(userId: string) {
  return LandlordRepo.getByUserId(userId);
}

export async function updateMe(userId: string, payload: Record<string, unknown>) {
  return LandlordRepo.updateByUserId(userId, payload);
}

export async function getTenants(userId: string) {
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
}

export async function getBookings(userId: string, statuses?: string[]) {
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
}

export async function terminateLease(userId: string, leaseId: string) {
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
}
