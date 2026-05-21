import { PropertyMedia } from '../models';

const PropertyMediaRepo = {
  create: async (data: Record<string, unknown>) => PropertyMedia.create(data),

  countByPropertyId: async (propertyId: string) => PropertyMedia.count({ where: { propertyId } }),

  getByPropertyId: async (propertyId: string) =>
    PropertyMedia.findAll({ where: { propertyId }, order: [['isCover', 'DESC'], ['orderIndex', 'ASC']] }),

  getById: async (id: string) => PropertyMedia.findByPk(id),

  deleteById: async (id: string, propertyId: string) =>
    PropertyMedia.destroy({ where: { id, propertyId } }),

  setCover: async (id: string, propertyId: string) => {
    await PropertyMedia.update({ isCover: false }, { where: { propertyId } });
    await PropertyMedia.update({ isCover: true }, { where: { id, propertyId } });
  },
};

export default PropertyMediaRepo;
