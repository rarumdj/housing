import { Renewal } from '../models';
import { identifierWhere } from '../utils/utils';

const RenewalRepo = {
  create: async (data: Record<string, unknown>) => Renewal.create(data),

  update: async (id: string, data: Record<string, unknown>) => {
    const where = identifierWhere(id);
    await Renewal.update(data, { where });
    return Renewal.findOne({ where });
  },
};

export default RenewalRepo;
