import { Op, WhereOptions } from 'sequelize';
import { Booking, Landlord, Property, PropertyMedia, PropertyRoom, User } from '../models';
import { identifierWhere } from '../utils/utils';

const PropertyRepo = {
  create: async (data: Record<string, unknown>) => Property.create(data),

  getById: async (id: string) => Property.findOne({ where: identifierWhere(id) }),

  getOwned: async (id: string, landlordId: string) =>
    Property.findOne({ where: { ...identifierWhere(id), landlordId } }),

  updateOwned: async (id: string, landlordId: string, data: Record<string, unknown>) => {
    const where = { ...identifierWhere(id), landlordId };
    await Property.update(data, { where });
    return Property.findOne({ where });
  },

  getDetailedById: async (id: string) =>
    Property.findOne({
      where: identifierWhere(id),
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
    Property.increment({ viewCount: 1 }, { where: identifierWhere(id) }),

  countByLandlordId: async (landlordId: string) => Property.count({ where: { landlordId } }),

  getIdsByLandlordId: async (landlordId: string) => Property.findAll({ where: { landlordId }, attributes: ['id'] }),

  listAll: async (filters: { status?: string; verificationStatus?: string; page?: number; limit?: number }) => {
    const where: Record<string, unknown> = {};
    if (filters.status) where.status = filters.status;
    if (filters.verificationStatus) where.verificationStatus = filters.verificationStatus;

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await Property.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true,
      include: [
        {
          model: Landlord,
          as: 'owner',
          include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] }],
        },
        {
          model: PropertyMedia,
          as: 'media',
          required: false,
          separate: true,
          order: [
            ['isCover', 'DESC'],
            ['orderIndex', 'ASC'],
          ],
        },
      ],
    });

    return { properties: rows, meta: { total: count, page, limit, pages: Math.max(1, Math.ceil(count / limit)) } };
  },

  updateById: async (id: string, data: Record<string, unknown>) => {
    const where = identifierWhere(id);
    await Property.update(data, { where });
    return Property.findOne({ where });
  },

  countByStatus: async () => {
    const { fn: seqFn, col: seqCol } = require('sequelize');
    const results = await Property.findAll({
      attributes: ['status', [seqFn('COUNT', seqCol('id')), 'count']],
      group: ['status'],
      raw: true,
    });
    return results as unknown as Array<{ status: string; count: number }>;
  },

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
