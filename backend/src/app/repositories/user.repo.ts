import { Op, WhereOptions, fn, col, literal } from 'sequelize';
import { Landlord, Tenant, User, Property, Booking, Payment } from '../models';

const UserRepo = {
  create: async (data: Record<string, unknown>) => User.create(data),

  getById: async (id: string) => User.findByPk(id),

  getOne: async (filter: WhereOptions) => User.findOne({ where: filter }),

  getByEmail: async (email: string) => User.findOne({ where: { email } }),

  getByEmailOrPhone: async (email: string, phone: string) =>
    User.findOne({
      where: {
        [Op.or]: [{ email }, { phone }],
      },
    }),

  update: async (payload: Record<string, unknown>, filter: WhereOptions) => {
    await User.update(payload, { where: filter });
    return User.findOne({ where: filter });
  },

  getProfileById: async (id: string) =>
    User.findByPk(id, {
      attributes: [
        'id',
        'email',
        'phone',
        'role',
        'firstName',
        'lastName',
        'avatarUrl',
        'isPhoneVerified',
        'isEmailVerified',
        'createdAt',
      ],
      include: [
        {
          model: Landlord,
          as: 'landlord',
          attributes: ['verificationStatus', 'isOnboarded'],
        },
        {
          model: Tenant,
          as: 'tenant',
          attributes: ['kycStatus', 'isOnboarded', 'screeningBand'],
        },
      ],
    }),

  listAll: async (filters: { role?: string; search?: string; isActive?: boolean; page?: number; limit?: number }) => {
    const where: Record<string, unknown> = {};
    if (filters.role) where.role = filters.role;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.search) {
      where[Op.or as unknown as string] = [
        { firstName: { [Op.like]: `%${filters.search}%` } },
        { lastName: { [Op.like]: `%${filters.search}%` } },
        { email: { [Op.like]: `%${filters.search}%` } },
      ];
    }

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'email', 'phone', 'role', 'firstName', 'lastName', 'avatarUrl', 'isActive', 'isPhoneVerified', 'isEmailVerified', 'createdAt'],
      include: [
        { model: Landlord, as: 'landlord', attributes: ['id', 'verificationStatus', 'isOnboarded', 'businessName', 'totalProperties'], required: false },
        { model: Tenant, as: 'tenant', attributes: ['id', 'kycStatus', 'isOnboarded', 'screeningBand'], required: false },
      ],
    });

    return { users: rows, meta: { total: count, page, limit, pages: Math.max(1, Math.ceil(count / limit)) } };
  },

  getDetailedById: async (id: string) =>
    User.findByPk(id, {
      attributes: { exclude: ['passwordHash'] },
      include: [
        {
          model: Landlord,
          as: 'landlord',
          include: [{ model: Property, as: 'properties', attributes: ['id', 'title', 'status', 'priceAnnually', 'createdAt'] }],
        },
        {
          model: Tenant,
          as: 'tenant',
          include: [{ model: Booking, as: 'bookings', attributes: ['id', 'status', 'propertyId', 'appliedAt'] }],
        },
      ],
    }),

  countByRole: async () => {
    const results = await User.findAll({
      attributes: ['role', [fn('COUNT', col('id')), 'count']],
      group: ['role'],
      raw: true,
    });
    return results as unknown as Array<{ role: string; count: number }>;
  },
};

export default UserRepo;
