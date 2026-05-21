import { v4 as uuidv4 } from 'uuid';
import LandlordRepo from '../../repositories/landlord.repo';
import PropertyMediaRepo from '../../repositories/propertyMedia.repo';
import PropertyRepo from '../../repositories/property.repo';
import PropertyRoomRepo from '../../repositories/propertyRoom.repo';
import BookingRepo from '../../repositories/booking.repo';
import AppError from '../../utils/appError';
import { uploadToStorage, deleteFromStorage } from '../../utils/storage';
import { getMockPropertyById, searchMockProperties } from './mock';

function shouldUseMockPropertyData(error: unknown) {
  if (!(error instanceof Error)) return false;

  return [
    'connect ECONNREFUSED',
    'SequelizeConnectionError',
    'SequelizeHostNotFoundError',
    'SequelizeConnectionRefusedError',
    'Unknown database',
  ].some((snippet) => error.message.includes(snippet));
}

function toPlain<T>(value: T) {
  if (value && typeof value === 'object' && 'get' in (value as Record<string, unknown>)) {
    return (value as unknown as { get: (options: { plain: boolean }) => T }).get({ plain: true });
  }

  return value;
}

function normalizePropertyListItem(property: Record<string, any>) {
  const media = Array.isArray(property.media) ? property.media : [];
  const coverMedia = media.filter((item) => item.isCover);

  return {
    ...property,
    media: coverMedia.length > 0 ? coverMedia : media.slice(0, 1),
    _count: {
      rooms: Array.isArray(property.rooms) ? property.rooms.length : 0,
    },
  };
}

export async function createProperty(landlordId: string, payload: Record<string, unknown>) {
  const property = await PropertyRepo.create({
    id: uuidv4(),
    landlordId,
    ...payload,
    availableFrom: new Date(String(payload.availableFrom)),
  });

  const totalProperties = await PropertyRepo.countByLandlordId(landlordId);
  await LandlordRepo.updateById(landlordId, { totalProperties });

  return toPlain(property);
}

export async function updateProperty(id: string, landlordId: string, payload: Record<string, unknown>) {
  const property = await PropertyRepo.getOwned(id, landlordId);
  if (!property) {
    throw new AppError('Property not found or access denied', 404);
  }

  const updatePayload = {
    ...payload,
    ...(payload.availableFrom ? { availableFrom: new Date(String(payload.availableFrom)) } : {}),
  };

  const updated = await PropertyRepo.updateOwned(id, landlordId, updatePayload);
  return toPlain(updated);
}

export async function publishProperty(id: string, landlordId: string) {
  const property = await PropertyRepo.getOwned(id, landlordId);
  if (!property) {
    throw new AppError('Property not found', 404);
  }

  const mediaCount = await PropertyMediaRepo.countByPropertyId(id);
  if (mediaCount === 0) {
    throw new AppError('Upload at least one photo or video before publishing', 400);
  }

  const updated = await PropertyRepo.updateOwned(id, landlordId, { status: 'PENDING_VERIFICATION' });
  return toPlain(updated);
}

export async function getPropertyById(id: string) {
  try {
    const property = await PropertyRepo.getDetailedById(id);
    if (!property || property.get('status') === 'ARCHIVED') {
      const mockProperty = getMockPropertyById(id);
      if (!mockProperty) {
        throw new AppError('Property not found', 404);
      }

      return mockProperty;
    }

    void PropertyRepo.incrementViews(id).catch(() => undefined);
    return toPlain(property);
  } catch (error) {
    if (shouldUseMockPropertyData(error)) {
      const mockProperty = getMockPropertyById(id);
      if (!mockProperty) {
        throw new AppError('Property not found', 404);
      }

      return mockProperty;
    }

    throw error;
  }
}

export async function searchProperties(filters: Record<string, unknown>) {
  const page = Number(filters.page || 1);
  const limit = Number(filters.limit || 12);
  const sortBy = String(filters.sortBy || 'newest');
  const offset = (page - 1) * limit;

  const order: Array<[string, 'ASC' | 'DESC']> =
    sortBy === 'price_asc'
      ? [['priceAnnually', 'ASC']]
      : sortBy === 'price_desc'
        ? [['priceAnnually', 'DESC']]
        : [['createdAt', 'DESC']];

  try {
    const { count, rows } = await PropertyRepo.search({
      filter: PropertyRepo.buildSearchFilter(filters),
      limit,
      offset,
      order,
    });

    const properties = rows.map((item) => normalizePropertyListItem(toPlain(item) as Record<string, any>));

    return {
      properties,
      meta: {
        total: count,
        page,
        limit,
        pages: Math.max(1, Math.ceil(count / limit)),
      },
    };
  } catch (error) {
    if (shouldUseMockPropertyData(error)) {
      return searchMockProperties(filters);
    }

    throw error;
  }
}

export async function addRoom(propertyId: string, landlordId: string, payload: Record<string, unknown>) {
  const property = await PropertyRepo.getOwned(propertyId, landlordId);
  if (!property) {
    throw new AppError('Property not found', 404);
  }

  const room = await PropertyRoomRepo.create({
    id: uuidv4(),
    propertyId,
    ...payload,
  });

  return toPlain(room);
}

export async function getLandlordProperties(landlordId: string) {
  const properties = await PropertyRepo.getByLandlordId(landlordId);

  return properties.map((item) => normalizePropertyListItem(toPlain(item) as Record<string, any>));
}

function inferMediaType(mimeType: string): string {
  if (mimeType.startsWith('video/')) return 'VIDEO';
  if (mimeType.startsWith('image/')) return 'TOUR_360';
  return 'PHOTO';
}

export async function uploadMedia(
  propertyId: string,
  landlordId: string,
  files: Array<{ buffer: Buffer; mimetype: string; originalname: string }>,
) {
  const property = await PropertyRepo.getOwned(propertyId, landlordId);
  if (!property) {
    throw new AppError('Property not found or access denied', 404);
  }

  const existingCount = await PropertyMediaRepo.countByPropertyId(propertyId);
  const results = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const folder = file.mimetype.startsWith('video/') ? 'properties/videos' : 'properties/photos';
    const url = await uploadToStorage(file.buffer, file.mimetype, folder);
    const mediaType = inferMediaType(file.mimetype);

    const media = await PropertyMediaRepo.create({
      id: uuidv4(),
      propertyId,
      type: mediaType,
      url,
      isCover: existingCount === 0 && i === 0,
      orderIndex: existingCount + i,
    });

    results.push(toPlain(media));
  }

  return results;
}

export async function deleteMedia(propertyId: string, landlordId: string, mediaId: string) {
  const property = await PropertyRepo.getOwned(propertyId, landlordId);
  if (!property) {
    throw new AppError('Property not found or access denied', 404);
  }

  const media = await PropertyMediaRepo.getById(mediaId);
  if (!media || media.get('propertyId') !== propertyId) {
    throw new AppError('Media not found', 404);
  }

  await deleteFromStorage(String(media.get('url')));
  await PropertyMediaRepo.deleteById(mediaId, propertyId);
}

export async function setCoverMedia(propertyId: string, landlordId: string, mediaId: string) {
  const property = await PropertyRepo.getOwned(propertyId, landlordId);
  if (!property) {
    throw new AppError('Property not found or access denied', 404);
  }

  await PropertyMediaRepo.setCover(mediaId, propertyId);
}

export async function deleteProperty(id: string, landlordId: string) {
  const property = await PropertyRepo.getOwned(id, landlordId);
  if (!property) {
    throw new AppError('Property not found or access denied', 404);
  }

  const status = String(property.get('status'));
  if (!['DRAFT', 'ARCHIVED'].includes(status)) {
    throw new AppError('Only draft or archived properties can be deleted', 400);
  }

  await PropertyRepo.updateOwned(id, landlordId, { status: 'ARCHIVED' });
}

export async function getPropertyActivity(propertyId: string, landlordId: string) {
  const property = await PropertyRepo.getOwned(propertyId, landlordId);
  if (!property) {
    throw new AppError('Property not found or access denied', 404);
  }

  const detailed = await PropertyRepo.getDetailedById(propertyId);
  const bookings = await BookingRepo.getByPropertyIdsAndStatuses(
    [propertyId],
    ['APPLIED', 'UNDER_REVIEW', 'ACCEPTED', 'AWAITING_PAYMENT', 'PAID', 'ACTIVE', 'DECLINED', 'ENDED', 'CANCELLED'],
  );

  return {
    property: toPlain(detailed),
    bookings: bookings.map((b) => toPlain(b)),
  };
}
