import BookingRepo from '../../repositories/booking.repo';
import LandlordRepo from '../../repositories/landlord.repo';
import PaymentRepo from '../../repositories/payment.repo';
import PropertyRepo from '../../repositories/property.repo';
import TenantRepo from '../../repositories/tenant.repo';
import AppError from '../../utils/appError';
import { paystack } from '../../utils/paystack';

export async function handleWebhook(event: { event: string; data?: { reference?: string } }) {
  if (event.event === 'charge.success' && event.data?.reference) {
    const verification = await paystack.verifyTransaction(event.data.reference);

    if (verification.status && verification.data.status === 'success') {
      const payment = await PaymentRepo.updateByPaystackRef(event.data.reference, {
        status: 'HELD_IN_ESCROW',
        paidAt: new Date(),
      });

      if (payment) {
        await BookingRepo.update(String(payment.get('bookingId')), {
          status: 'PAID',
          paidAt: new Date(),
        });
      }
    }
  }

  return { received: true };
}

export async function getHistory(userId: string, role: string) {
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
}
