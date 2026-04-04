import { Op, WhereOptions } from 'sequelize';
import { Booking, Landlord, Property, PropertyMedia, PropertyRoom, User } from '../models';

const PropertyRepo = {
  create: async (data: Record<string, unknown>) => Property.create(data),

  getById: async (id: string) => Property.findByPk(id),

  getOwned: async (id: string, landlordId: string) => Property.findOne({ where: { id, landlordId } }),

  updateOwned: async (id: string, landlordId: string, data: Record<string, unknown>) => {
    await Property.update(data, { where: { id, landlordId } });
    return Property.findOne({ where: { id, landlordId } });
  },

  getDetailedById: async (id: string) =>
    Property.findByPk(id, {
      include: [
        {
          model: Landlord,
          as: 'owner',
          include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'avatarUrl', 'phone'] }],
        },
        {
          model: PropertyRoom,
          as: 'rooms',
        },
        {
          model: PropertyMedia,
          as: 'media',
          separate: true,
          order: [['isCover', 'DESC'], ['orderIndex', 'ASC']],
        },
      ],
    }),

  search: async ({
    filter,
    limit,
    offset,
    order,
  }: {
    filter: WhereOptions;
    limit: number;
    offset: number;
    order: Array<[string, 'ASC' | 'DESC']>;
  }) => {
    return Property.findAndCountAll({
      where: filter,
      limit,
      offset,
      order,
      distinct: true,
      include: [
        {
          model: Landlord,
          as: 'owner',
          include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'avatarUrl'] }],
        },
        {
          model: PropertyMedia,
          as: 'media',
          required: false,
        },
        {
          model: PropertyRoom,
          as: 'rooms',
          required: false,
        },
      ],
    });
  },

  getByLandlordId: async (landlordId: string) =>
    Property.findAll({
      where: { landlordId },
      include: [
        {
          model: PropertyMedia,
          as: 'media',
          required: false,
        },
        {
          model: Booking,
          as: 'bookings',
          required: false,
          attributes: ['id'],
        },
        {
          model: PropertyRoom,
          as: 'rooms',
          required: false,
          attributes: ['id'],
        },
      ],
      order: [['createdAt', 'DESC']],
    }),

  incrementViews: async (id: string) =>
    Property.increment({ viewCount: 1 }, { where: { id } }),

  countByLandlordId: async (landlordId: string) => Property.count({ where: { landlordId } }),

  getIdsByLandlordId: async (landlordId: string) => Property.findAll({ where: { landlordId }, attributes: ['id'] }),

  buildSearchFilter: (filters: Record<string, unknown>) => {
    const filter: Record<string, unknown> = {
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
    };

    if (filters.state) filter.state = filters.state;
    if (filters.lga) filter.lga = filters.lga;
    if (filters.type) filter.type = filters.type;
    if (filters.isFurnished !== undefined) filter.isFurnished = filters.isFurnished;
    if (filters.hasGenerator !== undefined) filter.hasGenerator = filters.hasGenerator;
    if (filters.hasSecurity !== undefined) filter.hasSecurity = filters.hasSecurity;
    if (filters.hasParking !== undefined) filter.hasParking = filters.hasParking;

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      filter.priceAnnually = {
        ...(filters.minPrice !== undefined ? { [Op.gte]: filters.minPrice } : {}),
        ...(filters.maxPrice !== undefined ? { [Op.lte]: filters.maxPrice } : {}),
      };
    }

    if (filters.has3DTour) {
      filter['$media.type$'] = {
        [Op.in]: ['MODEL_3D', 'TOUR_360'],
      };
    }

    return filter;
  },
};

export default PropertyRepo;
