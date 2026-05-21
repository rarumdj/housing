import { Lease, Property, Tenant, User } from '../models';

const LeaseRepo = {
  create: async (data: Record<string, unknown>) => Lease.create(data),

  getById: async (id: string) => Lease.findByPk(id),

  getByIdWithDetails: async (id: string) =>
    Lease.findByPk(id, {
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
    await Lease.update(data, { where: { id } });
    return Lease.findByPk(id);
  },
};

export default LeaseRepo;
