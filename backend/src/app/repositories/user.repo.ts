import { Op, WhereOptions } from 'sequelize';
import { Landlord, Tenant, User } from '../models';

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
};

export default UserRepo;
