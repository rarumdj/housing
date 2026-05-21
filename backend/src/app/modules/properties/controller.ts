import { Request, Response } from 'express';
import LandlordRepo from '../../repositories/landlord.repo';
import AppError from '../../utils/appError';
import { sendSuccess } from '../../utils/response';
import * as PropertyService from './service';
import * as BookingService from '../bookings/service';

async function getLandlordId(userId: string) {
  const landlord = await LandlordRepo.getByUserId(userId);
  if (!landlord) {
    throw new AppError('Landlord profile not found', 404);
  }

  return String(landlord.get('id'));
}

export async function create(req: Request, res: Response) {
  const landlordId = await getLandlordId(String(req.user?.id));
  const data = await PropertyService.createProperty(landlordId, req.body);
  return sendSuccess(res, { statusCode: 201, data });
}

export async function update(req: Request, res: Response) {
  const landlordId = await getLandlordId(String(req.user?.id));
  const data = await PropertyService.updateProperty(req.params.id, landlordId, req.body);
  return sendSuccess(res, { data });
}

export async function publish(req: Request, res: Response) {
  const landlordId = await getLandlordId(String(req.user?.id));
  const data = await PropertyService.publishProperty(req.params.id, landlordId);
  return sendSuccess(res, { data });
}

export async function getById(req: Request, res: Response) {
  const data = await PropertyService.getPropertyById(req.params.id);
  return sendSuccess(res, { data });
}

export async function search(req: Request, res: Response) {
  const result = await PropertyService.searchProperties(req.query as Record<string, unknown>);
  return res.status(200).json({ success: true, error: false, ...result });
}

export async function addRoom(req: Request, res: Response) {
  const landlordId = await getLandlordId(String(req.user?.id));
  const data = await PropertyService.addRoom(req.params.id, landlordId, req.body);
  return sendSuccess(res, { statusCode: 201, data });
}

export async function myProperties(req: Request, res: Response) {
  const landlordId = await getLandlordId(String(req.user?.id));
  const data = await PropertyService.getLandlordProperties(landlordId);
  return sendSuccess(res, { data });
}

export async function uploadMedia(req: Request, res: Response) {
  const landlordId = await getLandlordId(String(req.user?.id));
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0) {
    throw new AppError('No files provided', 400);
  }

  const data = await PropertyService.uploadMedia(req.params.id, landlordId, files);
  return sendSuccess(res, { statusCode: 201, data });
}

export async function deleteMedia(req: Request, res: Response) {
  const landlordId = await getLandlordId(String(req.user?.id));
  await PropertyService.deleteMedia(req.params.id, landlordId, req.params.mediaId);
  return sendSuccess(res, { message: 'Media deleted' });
}

export async function setCoverMedia(req: Request, res: Response) {
  const landlordId = await getLandlordId(String(req.user?.id));
  await PropertyService.setCoverMedia(req.params.id, landlordId, req.params.mediaId);
  return sendSuccess(res, { message: 'Cover updated' });
}

export async function deleteProperty(req: Request, res: Response) {
  const landlordId = await getLandlordId(String(req.user?.id));
  await PropertyService.deleteProperty(req.params.id, landlordId);
  return sendSuccess(res, { message: 'Property deleted' });
}

export async function getActivity(req: Request, res: Response) {
  const landlordId = await getLandlordId(String(req.user?.id));
  const data = await PropertyService.getPropertyActivity(req.params.id, landlordId);
  return sendSuccess(res, { data });
}

export async function getFees(req: Request, res: Response) {
  const data = await BookingService.getPropertyFees(req.params.id);
  return sendSuccess(res, { data });
}
