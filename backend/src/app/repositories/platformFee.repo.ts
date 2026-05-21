import { PlatformFee } from '../models';

const PlatformFeeRepo = {
  create: async (data: Record<string, unknown>) => PlatformFee.create(data),

  getAll: async () => PlatformFee.findAll({ order: [['createdAt', 'ASC']] }),

  getActive: async () => PlatformFee.findAll({ where: { isActive: true }, order: [['createdAt', 'ASC']] }),

  getById: async (id: string) => PlatformFee.findByPk(id),

  getBySlug: async (slug: string) => PlatformFee.findOne({ where: { slug } }),

  update: async (id: string, data: Record<string, unknown>) => {
    await PlatformFee.update(data, { where: { id } });
    return PlatformFee.findByPk(id);
  },

  delete: async (id: string) => PlatformFee.destroy({ where: { id } }),
};

export default PlatformFeeRepo;
