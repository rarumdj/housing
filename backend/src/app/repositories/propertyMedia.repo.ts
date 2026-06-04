import { PropertyMedia } from '../models';
import { identifierWhere } from '../utils/utils';

const PropertyMediaRepo = {
  create: async (data: Record<string, unknown>) => PropertyMedia.create(data),

  countByPropertyId: async (propertyId: number | string) => PropertyMedia.count({ where: { propertyId } }),

  getByPropertyId: async (propertyId: number | string) =>
    PropertyMedia.findAll({ where: { propertyId }, order: [['isCover', 'DESC'], ['orderIndex', 'ASC']] }),

  getById: async (id: string) => PropertyMedia.findOne({ where: identifierWhere(id) }),

  deleteById: async (id: string, propertyId: number | string) =>
    PropertyMedia.destroy({ where: { ...identifierWhere(id), propertyId } }),

  setCover: async (id: string, propertyId: number | string) => {
    await PropertyMedia.update({ isCover: false }, { where: { propertyId } });
    await PropertyMedia.update({ isCover: true }, { where: { ...identifierWhere(id), propertyId } });
  },
};

export default PropertyMediaRepo;
