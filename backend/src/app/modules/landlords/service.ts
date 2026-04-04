import BookingRepo from '../../repositories/booking.repo';
import LandlordRepo from '../../repositories/landlord.repo';
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
