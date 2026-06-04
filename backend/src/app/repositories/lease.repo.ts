import { Lease, Property, Tenant, User } from '../models';
import { identifierWhere } from '../utils/utils';

const LeaseRepo = {
  create: async (data: Record<string, unknown>) => Lease.create(data),

  getById: async (id: string) => Lease.findOne({ where: identifierWhere(id) }),

  getByIdWithDetails: async (id: string) =>
    Lease.findOne({
      where: identifierWhere(id),
      include: [
        { model: Property, as: 'property', attributes: ['id', 'title', 'landlordId'] },
        {
          model: Tenant,
          as: 'tenant',
          include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] }],
        },
      ],
    }),

  update: async (id: string, data: Record<string, unknown>) => {
    const where = identifierWhere(id);
    await Lease.update(data, { where });
    return Lease.findOne({ where });
  },
};

export default LeaseRepo;
