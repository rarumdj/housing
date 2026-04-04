import { Request, Response } from 'express';
import LandlordRepo from '../../repositories/landlord.repo';
import AppError from '../../utils/appError';
import { sendSuccess } from '../../utils/response';
import * as VideoService from './service';

async function getLandlordId(userId: string) {
  const landlord = await LandlordRepo.getByUserId(userId);
  if (!landlord) {
    throw new AppError('Landlord profile not found', 404);
  }

  return String(landlord.get('id'));
}

export async function createSession(req: Request, res: Response) {
  const landlordId = await getLandlordId(String(req.user?.id));
  const data = await VideoService.createSession(req.params.propertyId, landlordId);
  return sendSuccess(res, { statusCode: 201, data });
}

export async function upload(req: Request, res: Response) {
  if (!req.file) {
    throw new AppError('No video file uploaded', 400);
  }

  const landlordId = await getLandlordId(String(req.user?.id));

  const data = await VideoService.uploadVideo({
    propertyId: req.params.propertyId,
    landlordId,
    buffer: req.file.buffer,
    mimeType: req.file.mimetype,
    nonce: req.body.nonce,
    signature: req.body.signature,
    gpsLat: Number(req.body.gpsLat),
    gpsLng: Number(req.body.gpsLng),
    recordedAt: req.body.recordedAt,
  });

  return sendSuccess(res, { statusCode: 201, data });
}
