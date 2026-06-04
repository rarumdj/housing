import LandlordRepo from '../../repositories/landlord.repo';
import PropertyMediaRepo from '../../repositories/propertyMedia.repo';
import PropertyRepo from '../../repositories/property.repo';
import PropertyRoomRepo from '../../repositories/propertyRoom.repo';
import BookingRepo from '../../repositories/booking.repo';
import AppError from '../../utils/appError';
import { uploadToStorage, deleteFromStorage } from '../../utils/storage';
import { getMockPropertyById, searchMockProperties } from './mock';

const shouldUseMockPropertyData = (error: unknown) => {
  if (!(error instanceof Error)) return false;

  return [
    'connect ECONNREFUSED',
    'SequelizeConnectionError',
    'SequelizeHostNotFoundError',
    'SequelizeConnectionRefusedError',
    'Unknown database',
  ].some((snippet) => error.message.includes(snippet));
};

const toPlain = <T>(value: T) => {
  if (value && typeof value === 'object' && 'get' in (value as Record<string, unknown>)) {
    return (value as unknown as { get: (options: { plain: boolean }) => T }).get({ plain: true });
  }

  return value;
};

const normalizePropertyListItem = (property: Record<string, any>) => {
  const media = Array.isArray(property.media) ? property.media : [];
  const coverMedia = media.filter((item) => item.isCover);

  return {
    ...property,
    media: coverMedia.length > 0 ? coverMedia : media.slice(0, 1),
    _count: {
      rooms: Array.isArray(property.rooms) ? property.rooms.length : 0,
    },
  };
};

const getLandlordOrFail = async (landlordId: string) => {
  const landlord = await LandlordRepo.getById(landlordId);
  if (!landlord) {
    throw new AppError('Landlord profile not found', 404);
  }
  return landlord;
};

export const createProperty = async (landlordId: string, payload: Record<string, unknown>) => {
  const landlord = await getLandlordOrFail(landlordId);
  if (String(landlord.get('onboardingStatus')) !== 'COMPLETED') {
    throw new AppError('Complete your landlord onboarding before adding properties', 403);
  }

  const property = await PropertyRepo.create({
    landlordId,
    ...payload,
    availableFrom: new Date(String(payload.availableFrom)),
  });

  const totalProperties = await PropertyRepo.countByLandlordId(landlordId);
  await LandlordRepo.updateById(landlordId, { totalProperties });

  return toPlain(property);
};

export const updateProperty = async (id: string, landlordId: string, payload: Record<string, unknown>) => {
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
};

export const publishProperty = async (id: string, landlordId: string) => {
  const property = await PropertyRepo.getOwned(id, landlordId);
  if (!property) {
    throw new AppError('Property not found', 404);
  }

  const landlord = await getLandlordOrFail(landlordId);
  if (String(landlord.get('verificationStatus')) !== 'VERIFIED') {
    throw new AppError('Your identity must be verified before publishing a listing', 403);
  }

  const mediaCount = await PropertyMediaRepo.countByPropertyId(id);
  if (mediaCount === 0) {
    throw new AppError('Upload at least one photo or video before publishing', 400);
  }

  const updated = await PropertyRepo.updateOwned(id, landlordId, { status: 'PENDING_VERIFICATION' });
  return toPlain(updated);
};

export const getPropertyById = async (id: string) => {
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
};

export const searchProperties = async (filters: Record<string, unknown>) => {
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
};

export const addRoom = async (propertyId: string, landlordId: string, payload: Record<string, unknown>) => {
  const property = await PropertyRepo.getOwned(propertyId, landlordId);
  if (!property) {
    throw new AppError('Property not found', 404);
  }

  const room = await PropertyRoomRepo.create({
    propertyId,
    ...payload,
  });

  return toPlain(room);
};

export const getLandlordProperties = async (landlordId: string) => {
  const properties = await PropertyRepo.getByLandlordId(landlordId);

  return properties.map((item) => normalizePropertyListItem(toPlain(item) as Record<string, any>));
};

const inferMediaType = (mimeType: string): string => {
  if (mimeType.startsWith('video/')) return 'VIDEO';
  if (mimeType.startsWith('image/')) return 'TOUR_360';
  return 'PHOTO';
};

export const uploadMedia = async (propertyId: string, landlordId: string, files: Array<{ buffer: Buffer; mimetype: string; originalname: string }>) => {
  const property = await PropertyRepo.getOwned(propertyId, landlordId);
  if (!property) {
    throw new AppError('Property not found or access denied', 404);
  }
  const pid = property.get('id') as number;

  const existingCount = await PropertyMediaRepo.countByPropertyId(pid);
  const results = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const folder = file.mimetype.startsWith('video/') ? 'properties/videos' : 'properties/photos';
    const url = await uploadToStorage(file.buffer, file.mimetype, folder);
    const mediaType = inferMediaType(file.mimetype);

    const media = await PropertyMediaRepo.create({
      propertyId: pid,
      type: mediaType,
      url,
      isCover: existingCount === 0 && i === 0,
      orderIndex: existingCount + i,
    });

    results.push(toPlain(media));
  }

  return results;
};

export const deleteMedia = async (propertyId: string, landlordId: string, mediaId: string) => {
  const property = await PropertyRepo.getOwned(propertyId, landlordId);
  if (!property) {
    throw new AppError('Property not found or access denied', 404);
  }
  const pid = property.get('id') as number;

  const media = await PropertyMediaRepo.getById(mediaId);
  if (!media || media.get('propertyId') !== pid) {
    throw new AppError('Media not found', 404);
  }

  await deleteFromStorage(String(media.get('url')));
  await PropertyMediaRepo.deleteById(mediaId, pid);
};

export const setCoverMedia = async (propertyId: string, landlordId: string, mediaId: string) => {
  const property = await PropertyRepo.getOwned(propertyId, landlordId);
  if (!property) {
    throw new AppError('Property not found or access denied', 404);
  }

  await PropertyMediaRepo.setCover(mediaId, property.get('id') as number);
};

export const deleteProperty = async (id: string, landlordId: string) => {
  const property = await PropertyRepo.getOwned(id, landlordId);
  if (!property) {
    throw new AppError('Property not found or access denied', 404);
  }

  const status = String(property.get('status'));
  if (!['DRAFT', 'ARCHIVED'].includes(status)) {
    throw new AppError('Only draft or archived properties can be deleted', 400);
  }

  await PropertyRepo.updateOwned(id, landlordId, { status: 'ARCHIVED' });
};

export const getPropertyActivity = async (propertyId: string, landlordId: string) => {
  const property = await PropertyRepo.getOwned(propertyId, landlordId);
  if (!property) {
    throw new AppError('Property not found or access denied', 404);
  }

  const pid = property.get('id') as number;
  const detailed = await PropertyRepo.getDetailedById(propertyId);
  const bookings = await BookingRepo.getByPropertyIdsAndStatuses(
    [String(pid)],
    ['APPLIED', 'UNDER_REVIEW', 'ACCEPTED', 'AWAITING_PAYMENT', 'PAID', 'ACTIVE', 'DECLINED', 'ENDED', 'CANCELLED'],
  );

  return {
    property: toPlain(detailed),
    bookings: bookings.map((b) => toPlain(b)),
  };
};
