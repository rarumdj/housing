import { Lease } from '../models';

const LeaseRepo = {
  create: async (data: Record<string, unknown>) => Lease.create(data),

  getById: async (id: string) => Lease.findByPk(id),
};

export default LeaseRepo;
