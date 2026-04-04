import { v4 as uuidv4 } from 'uuid';
import BookingRepo from '../../repositories/booking.repo';
import PaymentRepo from '../../repositories/payment.repo';
import PropertyRepo from '../../repositories/property.repo';
import TenantRepo from '../../repositories/tenant.repo';
import AppError from '../../utils/appError';
import { paystack } from '../../utils/paystack';

export async function apply(tenantId: string, propertyId: string, message?: string) {
  const existing = await BookingRepo.getActiveApplication(tenantId, propertyId);
  if (existing) {
    throw new AppError('You already have an active application for this property', 409);
  }

  const property = await PropertyRepo.getById(propertyId);
  if (!property || property.get('status') !== 'ACTIVE') {
    throw new AppError('Property not available', 400);
  }

  const booking = await BookingRepo.create({
    id: uuidv4(),
    propertyId,
    tenantId,
    message,
    status: 'APPLIED',
  });

  return booking;
}

export async function accept(bookingId: string, landlordId: string) {
  const booking = await BookingRepo.getWithProperty(bookingId);
  const property = booking?.get('property') as Record<string, unknown> | undefined;
  if (!booking || property?.landlordId !== landlordId) {
    throw new AppError('Booking not found', 404);
  }

  if (!['APPLIED', 'UNDER_REVIEW'].includes(String(booking.get('status')))) {
    throw new AppError('Cannot accept this booking', 400);
  }

  return BookingRepo.update(bookingId, { status: 'ACCEPTED', acceptedAt: new Date() });
}

export async function decline(bookingId: string, landlordId: string, reason: string) {
  const booking = await BookingRepo.getWithProperty(bookingId);
  const property = booking?.get('property') as Record<string, unknown> | undefined;
  if (!booking || property?.landlordId !== landlordId) {
    throw new AppError('Booking not found', 404);
  }

  return BookingRepo.update(bookingId, { status: 'DECLINED', declineReason: reason });
}

export async function initiatePayment(bookingId: string, tenantUserId: string) {
  const booking = await BookingRepo.getWithPaymentContext(bookingId);
  const tenant = booking?.get('tenant') as Record<string, unknown> | undefined;
  const tenantUser = tenant?.user as Record<string, unknown> | undefined;
  if (!booking || tenantUser?.id !== tenantUserId) {
    throw new AppError('Booking not found', 404);
  }

  if (booking.get('status') !== 'ACCEPTED') {
    throw new AppError('Booking must be accepted before payment', 400);
  }

  const property = booking.get('property') as Record<string, unknown>;
  const totalAmount = Number(property.priceAnnually) + Number(property.cautionDeposit);
  const reference = `HH-${uuidv4().slice(0, 8).toUpperCase()}`;
  const paystackResponse = await paystack.initializeTransaction({
    email: String(tenantUser?.email || ''),
    amount: totalAmount * 100,
    reference,
    metadata: { bookingId, type: 'INITIAL_PAYMENT' },
  });

  if (!paystackResponse.status) {
    throw new AppError('Payment initialization failed', 500);
  }

  await PaymentRepo.create({
    id: uuidv4(),
    bookingId,
    amount: totalAmount,
    type: 'FIRST_RENT',
    paystackRef: reference,
    status: 'PENDING',
  });

  await BookingRepo.update(bookingId, { status: 'AWAITING_PAYMENT' });

  return {
    authorizationUrl: String(paystackResponse.data.authorization_url || ''),
    reference,
  };
}

export async function confirmMoveIn(bookingId: string, tenantUserId: string) {
  const tenant = await TenantRepo.getByUserId(tenantUserId);
  if (!tenant) {
    throw new AppError('Tenant profile not found', 404);
  }

  const booking = await BookingRepo.getWithTenant(bookingId);
  const bookingTenant = booking?.get('tenant') as Record<string, unknown> | undefined;
  if (!booking || bookingTenant?.userId !== tenantUserId) {
    throw new AppError('Booking not found', 404);
  }

  if (booking.get('status') !== 'PAID') {
    throw new AppError('Payment not confirmed', 400);
  }

  return BookingRepo.update(bookingId, { status: 'ACTIVE', moveInConfirmedAt: new Date() });
}
