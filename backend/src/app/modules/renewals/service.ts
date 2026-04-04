import { v4 as uuidv4 } from 'uuid';
import LeaseRepo from '../../repositories/lease.repo';
import RenewalRepo from '../../repositories/renewal.repo';
import AppError from '../../utils/appError';

export async function createRenewal(payload: { leaseId: string; proposedPrice: number }) {
  const lease = await LeaseRepo.getById(payload.leaseId);
  if (!lease) {
    throw new AppError('Lease not found', 404);
  }

  const gracePeriodEnd = new Date(String(lease.get('rentEndDate')));
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 14);

  return RenewalRepo.create({
    id: uuidv4(),
    leaseId: payload.leaseId,
    proposedPrice: payload.proposedPrice,
    currentPrice: lease.get('annualRent'),
    gracePeriodEnd,
  });
}

export async function acceptRenewal(id: string) {
  return RenewalRepo.update(id, {
    status: 'ACCEPTED',
    respondedAt: new Date(),
  });
}

export async function appealRenewal(id: string, reason: string) {
  return RenewalRepo.update(id, {
    status: 'APPEALED',
    appealReason: reason,
    respondedAt: new Date(),
  });
}
