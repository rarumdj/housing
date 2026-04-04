import { Op } from 'sequelize';
import { Booking, Lease, Payment, Property, Tenant, User } from '../models';

const BookingRepo = {
  create: async (data: Record<string, unknown>) => Booking.create(data),

  getActiveApplication: async (tenantId: string, propertyId: string) =>
    Booking.findOne({
      where: {
        tenantId,
        propertyId,
        status: {
          [Op.in]: ['APPLIED', 'UNDER_REVIEW', 'ACCEPTED', 'AWAITING_PAYMENT', 'PAID', 'ACTIVE'],
        },
      },
    }),

  getWithProperty: async (id: string) =>
    Booking.findByPk(id, {
      include: [{ model: Property, as: 'property' }],
    }),

  getWithPaymentContext: async (id: string) =>
    Booking.findByPk(id, {
      include: [
        {
          model: Property,
          as: 'property',
        },
        {
          model: Tenant,
          as: 'tenant',
          include: [{ model: User, as: 'user', attributes: ['id', 'email'] }],
        },
      ],
    }),

  getWithTenant: async (id: string) =>
    Booking.findByPk(id, {
      include: [
        {
          model: Tenant,
          as: 'tenant',
          include: [{ model: User, as: 'user' }],
        },
      ],
    }),

  update: async (id: string, data: Record<string, unknown>) => {
    await Booking.update(data, { where: { id } });
    return Booking.findByPk(id);
  },

  getByTenantId: async (tenantId: string) => Booking.findAll({ where: { tenantId }, attributes: ['id'] }),

  getByPropertyIdsAndStatuses: async (propertyIds: string[], statuses: string[]) =>
    Booking.findAll({
      where: {
        propertyId: { [Op.in]: propertyIds },
        status: { [Op.in]: statuses },
      },
      include: [
        {
          model: Tenant,
          as: 'tenant',
          include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'email', 'phone'] }],
        },
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'title'],
        },
        {
          model: Lease,
          as: 'lease',
          attributes: ['id', 'rentEndDate', 'status'],
        },
      ],
    }),

  getIdsByPropertyIds: async (propertyIds: string[]) =>
    Booking.findAll({
      where: { propertyId: { [Op.in]: propertyIds } },
      attributes: ['id'],
    }),

  getByIds: async (ids: string[]) =>
    Booking.findAll({
      where: { id: { [Op.in]: ids } },
      include: [
        { model: Property, as: 'property' },
        { model: Lease, as: 'lease' },
        { model: Payment, as: 'payments' },
      ],
    }),
};

export default BookingRepo;
