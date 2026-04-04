import { Op } from 'sequelize';
import { Payment } from '../models';

const PaymentRepo = {
  create: async (data: Record<string, unknown>) => Payment.create(data),

  updateByPaystackRef: async (paystackRef: string, data: Record<string, unknown>) => {
    await Payment.update(data, { where: { paystackRef } });
    return Payment.findOne({ where: { paystackRef } });
  },

  getByBookingIds: async (bookingIds: string[]) =>
    Payment.findAll({
      where: {
        bookingId: {
          [Op.in]: bookingIds,
        },
      },
      order: [['createdAt', 'DESC']],
    }),
};

export default PaymentRepo;
