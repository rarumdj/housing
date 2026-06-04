import { User, Landlord } from '../models';

const LandlordRepo = {
  create: async (data: Record<string, unknown>) => Landlord.create(data),

  getById: async (id: string) =>
    Landlord.findByPk(id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'avatarUrl'] }],
    }),

  getByUserId: async (userId: string) =>
    Landlord.findOne({
      where: { userId },
      include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'email', 'phone', 'avatarUrl'] }],
    }),

  updateByUserId: async (userId: string, data: Record<string, unknown>) => {
    await Landlord.update(data, { where: { userId } });
    return LandlordRepo.getByUserId(userId);
  },

  updateById: async (id: string, data: Record<string, unknown>) => {
    await Landlord.update(data, { where: { id } });
    return Landlord.findByPk(id);
  },

  getRawByUserId: async (userId: string) => Landlord.findOne({ where: { userId } }),
};

export default LandlordRepo;
