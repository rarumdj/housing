import { Renewal } from '../models';

const RenewalRepo = {
  create: async (data: Record<string, unknown>) => Renewal.create(data),

  update: async (id: string, data: Record<string, unknown>) => {
    await Renewal.update(data, { where: { id } });
    return Renewal.findByPk(id);
  },
};

export default RenewalRepo;
