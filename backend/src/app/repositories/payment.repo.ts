import { Op, fn, col, literal, type GroupOption } from 'sequelize';
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

  getTotalRevenue: async () => {
    const result = await Payment.findOne({
      attributes: [[fn('SUM', col('amount')), 'total']],
      where: { status: { [Op.in]: ['SUCCESS', 'HELD_IN_ESCROW', 'RELEASED'] } },
      raw: true,
    });
    return Number((result as unknown as { total: number })?.total ?? 0);
  },

  getPlatformFeeTotal: async () => {
    const result = await Payment.findOne({
      attributes: [[fn('SUM', col('amount')), 'total']],
      where: { type: 'PLATFORM_FEE', status: { [Op.in]: ['SUCCESS', 'HELD_IN_ESCROW', 'RELEASED'] } },
      raw: true,
    });
    return Number((result as unknown as { total: number })?.total ?? 0);
  },

  getMonthlyRevenue: async () => {
    const results = await Payment.findAll({
      attributes: [
        [fn('DATE_FORMAT', col('paidAt'), '%Y-%m'), 'month'],
        [fn('SUM', col('amount')), 'total'],
        [fn('COUNT', col('id')), 'count'],
        'type',
      ],
      where: {
        status: { [Op.in]: ['SUCCESS', 'HELD_IN_ESCROW', 'RELEASED'] },
        paidAt: { [Op.ne]: null },
      },
      group: [literal("DATE_FORMAT(paidAt, '%Y-%m')"), 'type'] as unknown as GroupOption,
      order: [[literal("DATE_FORMAT(paidAt, '%Y-%m')"), 'ASC']],
      raw: true,
    });
    return results as unknown as Array<{ month: string; total: number; count: number; type: string }>;
  },

  getRecentPayments: async (limit = 10) =>
    Payment.findAll({
      where: { status: { [Op.in]: ['SUCCESS', 'HELD_IN_ESCROW', 'RELEASED'] } },
      order: [['paidAt', 'DESC']],
      limit,
    }),
};

export default PaymentRepo;
