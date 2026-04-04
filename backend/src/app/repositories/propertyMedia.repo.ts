import { PropertyMedia } from '../models';

const PropertyMediaRepo = {
  create: async (data: Record<string, unknown>) => PropertyMedia.create(data),

  countByPropertyId: async (propertyId: string) => PropertyMedia.count({ where: { propertyId } }),
};

export default PropertyMediaRepo;
