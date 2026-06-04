import BookingRepo from '../../repositories/booking.repo';
import LandlordRepo from '../../repositories/landlord.repo';
import PaymentRepo from '../../repositories/payment.repo';
import PropertyRepo from '../../repositories/property.repo';
import TenantRepo from '../../repositories/tenant.repo';
import AppError from '../../utils/appError';
import { verifyCheckout, type PaymentProvider } from '../../utils/paymentProvider';

const settlePayment = async (reference: string) => {
  const payment = await PaymentRepo.updateByProviderRef(reference, {
    status: 'HELD_IN_ESCROW',
    paidAt: new Date(),
  });

  if (payment) {
    await BookingRepo.update(String(payment.get('bookingId')), {
      status: 'PAID',
      paidAt: new Date(),
    });
  }
};

export const handleWebhook = async (event: { event?: string; data?: { reference?: string; tx_ref?: string; status?: string } }, provider: PaymentProvider = 'paystack') => {
  const reference = event.data?.reference || event.data?.tx_ref;
  const isSuccessEvent =
    event.event === 'charge.success' || event.event === 'charge.completed' || event.data?.status === 'successful';

  if (isSuccessEvent && reference) {
    const verified = await verifyCheckout(provider, reference);
    if (verified) {
      await settlePayment(reference);
    }
  }

  return { received: true };
};

export const getHistory = async (userId: string, role: string) => {
  let bookingIds: string[] = [];

  if (role === 'TENANT') {
    const tenant = await TenantRepo.getByUserId(userId);
    if (tenant) {
      const bookings = await BookingRepo.getByTenantId(String(tenant.get('id')));
      bookingIds = bookings.map((item) => String(item.get('id')));
    }
  }

  if (role === 'LANDLORD') {
    const landlord = await LandlordRepo.getByUserId(userId);
    if (landlord) {
      const properties = await PropertyRepo.getIdsByLandlordId(String(landlord.get('id')));
      const propertyIds = properties.map((item) => String(item.get('id')));
      const bookings = await BookingRepo.getIdsByPropertyIds(propertyIds);
      bookingIds = bookings.map((item) => String(item.get('id')));
    }
  }

  if (bookingIds.length === 0) {
    return [];
  }

  return PaymentRepo.getByBookingIds(bookingIds);
};
