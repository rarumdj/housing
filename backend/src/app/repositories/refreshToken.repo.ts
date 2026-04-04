import { WhereOptions } from 'sequelize';
import { RefreshToken } from '../models';

const RefreshTokenRepo = {
  create: async (data: Record<string, unknown>) => RefreshToken.create(data),

  getOne: async (filter: WhereOptions) => RefreshToken.findOne({ where: filter }),

  delete: async (filter: WhereOptions) => RefreshToken.destroy({ where: filter }),

  deleteMany: async (filter: WhereOptions) => RefreshToken.destroy({ where: filter }),
};

export default RefreshTokenRepo;
