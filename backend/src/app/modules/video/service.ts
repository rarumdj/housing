import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import PropertyMediaRepo from '../../repositories/propertyMedia.repo';
import PropertyRepo from '../../repositories/property.repo';
import VideoSessionRepo from '../../repositories/videoSession.repo';
import AppError from '../../utils/appError';
import { env } from '../../utils/env';
import { addVideoProcessingJob } from '../../utils/queue';
import { uploadToStorage } from '../../utils/storage';

const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const radius = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;

  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const signPayload = (payload: string, secret: string) => {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
};

export const createSession = async (propertyId: string, landlordId: string) => {
  const property = await PropertyRepo.getOwned(propertyId, landlordId);
  if (!property) {
    throw new AppError('Property not found', 404);
  }

  const nonce = uuidv4();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  const session = await VideoSessionRepo.create({
    propertyId,
    nonce,
    expectedLat: property.get('lat'),
    expectedLng: property.get('lng'),
    expiresAt,
  });

  const signature = signPayload(
    `${nonce}:${property.get('lat')}:${property.get('lng')}`,
    env.video.nonceSecret,
  );

  return {
    sessionId: session.get('id'),
    nonce,
    signature,
    expiresAt,
  };
};

export const uploadVideo = async (params: {
  propertyId: string;
  landlordId: string;
  buffer: Buffer;
  mimeType: string;
  nonce: string;
  signature: string;
  gpsLat: number;
  gpsLng: number;
  recordedAt: string;
}) => {
  const property = await PropertyRepo.getOwned(params.propertyId, params.landlordId);
  if (!property) {
    throw new AppError('Property not found', 404);
  }

  const session = await VideoSessionRepo.getByNonce(params.nonce);
  if (!session) {
    throw new AppError('Invalid recording session', 400);
  }

  if (session.get('usedAt')) {
    throw new AppError('Session already used', 400);
  }

  if (new Date(String(session.get('expiresAt'))) < new Date()) {
    throw new AppError('Recording session expired', 400);
  }

  if (session.get('propertyId') !== params.propertyId) {
    throw new AppError('Session mismatch', 400);
  }

  const expectedSignature = signPayload(
    `${params.nonce}:${session.get('expectedLat')}:${session.get('expectedLng')}`,
    env.video.nonceSecret,
  );

  if (expectedSignature !== params.signature) {
    throw new AppError('Invalid video signature — location could not be verified', 400);
  }

  const distance = haversineDistance(
    params.gpsLat,
    params.gpsLng,
    Number(session.get('expectedLat')),
    Number(session.get('expectedLng')),
  );

  if (distance > env.video.gpsTolerance) {
    throw new AppError(
      `Video recorded ${Math.round(distance)}m from the property address. Must be within ${env.video.gpsTolerance}m.`,
      400,
    );
  }

  await VideoSessionRepo.updateByNonce(params.nonce, { usedAt: new Date() });

  const key = await uploadToStorage(params.buffer, params.mimeType, `videos/${params.propertyId}`);

  const media = await PropertyMediaRepo.create({
    propertyId: params.propertyId,
    type: 'VIDEO',
    url: key,
    gpsLat: params.gpsLat,
    gpsLng: params.gpsLng,
    nonceVerified: true,
    recordedAt: new Date(params.recordedAt),
  });

  await addVideoProcessingJob({
    mediaId: media.get('id'),
    propertyId: params.propertyId,
    videoKey: key,
  });

  return {
    media,
    message: '3D tour generation started',
  };
};
