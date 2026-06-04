import { PlatformFee } from '../models';
import { identifierWhere } from '../utils/utils';

const PlatformFeeRepo = {
  create: async (data: Record<string, unknown>) => PlatformFee.create(data),

  getAll: async () => PlatformFee.findAll({ order: [['createdAt', 'ASC']] }),

  getActive: async () => PlatformFee.findAll({ where: { isActive: true }, order: [['createdAt', 'ASC']] }),

  getById: async (id: string) => PlatformFee.findOne({ where: identifierWhere(id) }),

  getBySlug: async (slug: string) => PlatformFee.findOne({ where: { slug } }),

  update: async (id: string, data: Record<string, unknown>) => {
    const where = identifierWhere(id);
    await PlatformFee.update(data, { where });
    return PlatformFee.findOne({ where });
  },

  delete: async (id: string) => PlatformFee.destroy({ where: identifierWhere(id) }),
};

export default PlatformFeeRepo;
