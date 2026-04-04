import { Booking, Lease, Payment, Property, Renewal, Tenant, User } from '../models';

const TenantRepo = {
  create: async (data: Record<string, unknown>) => Tenant.create(data),

  getByUserId: async (userId: string) =>
    Tenant.findOne({
      where: { userId },
      include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'email', 'phone', 'avatarUrl'] }],
    }),

  getBookingsByUserId: async (userId: string) => {
    const tenant = await Tenant.findOne({ where: { userId } });
    if (!tenant) return [];

    return Booking.findAll({
      where: { tenantId: tenant.get('id') },
      include: [
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'title', 'address', 'lga', 'state', 'priceMonthly', 'priceAnnually'],
        },
        {
          model: Lease,
          as: 'lease',
          attributes: ['id', 'status', 'rentStartDate', 'rentEndDate'],
        },
        {
          model: Payment,
          as: 'payments',
          attributes: ['id', 'amount', 'status', 'paidAt'],
        },
      ],
      order: [['appliedAt', 'DESC']],
    });
  },

  getLeasesByUserId: async (userId: string) => {
    const tenant = await Tenant.findOne({ where: { userId } });
    if (!tenant) return [];

    return Lease.findAll({
      where: { tenantId: tenant.get('id') },
      include: [
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'title', 'address'],
        },
        {
          model: Renewal,
          as: 'renewals',
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  },
};

export default TenantRepo;
