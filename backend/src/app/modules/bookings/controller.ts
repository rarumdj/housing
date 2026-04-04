import { Request, Response } from 'express';
import LandlordRepo from '../../repositories/landlord.repo';
import TenantRepo from '../../repositories/tenant.repo';
import AppError from '../../utils/appError';
import { sendSuccess } from '../../utils/response';
import * as BookingService from './service';

async function getTenantId(userId: string) {
  const tenant = await TenantRepo.getByUserId(userId);
  if (!tenant) {
    throw new AppError('Tenant profile not found', 404);
  }

  return String(tenant.get('id'));
}

async function getLandlordId(userId: string) {
  const landlord = await LandlordRepo.getByUserId(userId);
  if (!landlord) {
    throw new AppError('Landlord profile not found', 404);
  }

  return String(landlord.get('id'));
}

export async function apply(req: Request, res: Response) {
  const tenantId = await getTenantId(String(req.user?.id));
  const data = await BookingService.apply(tenantId, req.body.propertyId, req.body.message);
  return sendSuccess(res, { statusCode: 201, data });
}

export async function accept(req: Request, res: Response) {
  const landlordId = await getLandlordId(String(req.user?.id));
  const data = await BookingService.accept(req.params.id, landlordId);
  return sendSuccess(res, { data });
}

export async function decline(req: Request, res: Response) {
  const landlordId = await getLandlordId(String(req.user?.id));
  const data = await BookingService.decline(req.params.id, landlordId, req.body.reason || '');
  return sendSuccess(res, { data });
}

export async function initiatePayment(req: Request, res: Response) {
  const data = await BookingService.initiatePayment(req.params.id, String(req.user?.id));
  return sendSuccess(res, { data });
}

export async function confirmMoveIn(req: Request, res: Response) {
  const data = await BookingService.confirmMoveIn(req.params.id, String(req.user?.id));
  return sendSuccess(res, { data });
}
