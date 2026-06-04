import { Request, Response } from 'express';
import LandlordRepo from '../../repositories/landlord.repo';
import TenantRepo from '../../repositories/tenant.repo';
import AppError from '../../utils/appError';
import { sendSuccess } from '../../utils/response';
import * as BookingService from './service';

const getTenantId = async (userId: string) => {
  const tenant = await TenantRepo.getByUserId(userId);
  if (!tenant) {
    throw new AppError('Tenant profile not found', 404);
  }

  return String(tenant.get('id'));
};

const getLandlordId = async (userId: string) => {
  const landlord = await LandlordRepo.getByUserId(userId);
  if (!landlord) {
    throw new AppError('Landlord profile not found', 404);
  }

  return String(landlord.get('id'));
};

export const apply = async (req: Request, res: Response) => {
  const tenantId = await getTenantId(String(req.user?.id));
  const data = await BookingService.apply(tenantId, req.body.propertyId, req.body.message);
  return sendSuccess(res, { statusCode: 201, data });
};

export const accept = async (req: Request, res: Response) => {
  const landlordId = await getLandlordId(String(req.user?.id));
  const data = await BookingService.accept(req.params.id, landlordId);
  return sendSuccess(res, { data });
};

export const decline = async (req: Request, res: Response) => {
  const landlordId = await getLandlordId(String(req.user?.id));
  const data = await BookingService.decline(req.params.id, landlordId, req.body.reason || '');
  return sendSuccess(res, { data });
};

export const initiatePayment = async (req: Request, res: Response) => {
  const data = await BookingService.initiatePayment(req.params.id, String(req.user?.id));
  return sendSuccess(res, { data });
};

export const confirmMoveIn = async (req: Request, res: Response) => {
  const data = await BookingService.confirmMoveIn(req.params.id, String(req.user?.id));
  return sendSuccess(res, { data });
};

export const cancel = async (req: Request, res: Response) => {
  const landlordId = await getLandlordId(String(req.user?.id));
  const data = await BookingService.cancel(req.params.id, landlordId);
  return sendSuccess(res, { data });
};

export const applicationDetail = async (req: Request, res: Response) => {
  const landlordId = await getLandlordId(String(req.user?.id));
  const data = await BookingService.getApplicationDetail(req.params.id, landlordId);
  return sendSuccess(res, { data });
};
