import { Op, WhereOptions, fn, col, literal } from 'sequelize';
import { Landlord, Tenant, User, Property, Booking, Payment } from '../models';
import { identifierWhere } from '../utils/utils';

const UserRepo = {
  create: async (data: Record<string, unknown>) => User.create(data),

  getById: async (id: string | number) => User.findOne({ where: identifierWhere(id) }),

  getByCode: async (code: string) => User.findOne({ where: { code } }),

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
    User.findOne({
      where: identifierWhere(id),
      attributes: [
        'id',
        'code',
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
          attributes: [
            'id',
            'code',
            'verificationStatus',
            'verificationNote',
            'isOnboarded',
            'onboardingStatus',
            'onboardingStep',
            'payoutProvider',
            'payoutPreference',
          ],
        },
        {
          model: Tenant,
          as: 'tenant',
          attributes: ['id', 'code', 'kycStatus', 'kycNote', 'isOnboarded', 'screeningBand'],
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
      attributes: ['id', 'code', 'email', 'phone', 'role', 'firstName', 'lastName', 'avatarUrl', 'isActive', 'isPhoneVerified', 'isEmailVerified', 'createdAt'],
      include: [
        { model: Landlord, as: 'landlord', attributes: ['id', 'code', 'verificationStatus', 'isOnboarded', 'businessName', 'totalProperties'], required: false },
        { model: Tenant, as: 'tenant', attributes: ['id', 'code', 'kycStatus', 'isOnboarded', 'screeningBand'], required: false },
      ],
    });

    return { users: rows, meta: { total: count, page, limit, pages: Math.max(1, Math.ceil(count / limit)) } };
  },

  getDetailedById: async (id: string) =>
    User.findOne({
      where: identifierWhere(id),
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
