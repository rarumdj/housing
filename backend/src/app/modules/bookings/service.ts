import { v4 as uuidv4 } from 'uuid';
import BookingRepo from '../../repositories/booking.repo';
import LeaseRepo from '../../repositories/lease.repo';
import PaymentRepo from '../../repositories/payment.repo';
import PlatformFeeRepo from '../../repositories/platformFee.repo';
import PropertyRepo from '../../repositories/property.repo';
import TenantRepo from '../../repositories/tenant.repo';
import LandlordRepo from '../../repositories/landlord.repo';
import AppError from '../../utils/appError';
import { paystack } from '../../utils/paystack';
import { generateAgreementPdf } from '../../utils/agreement';

export async function apply(tenantId: string, propertyId: string, message?: string) {
  const existing = await BookingRepo.getActiveApplication(tenantId, propertyId);
  if (existing) {
    throw new AppError('You already have an active application for this property', 409);
  }

  const property = await PropertyRepo.getById(propertyId);
  if (!property || property.get('status') !== 'ACTIVE') {
    throw new AppError('Property not available', 400);
  }

  const tenant = await TenantRepo.getFullProfileById(tenantId);
  if (!tenant || !tenant.get('isOnboarded')) {
    throw new AppError('Please complete your profile onboarding before applying', 400);
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

  await BookingRepo.update(bookingId, { status: 'ACCEPTED', acceptedAt: new Date() });

  // Generate tenancy agreement
  try {
    const tenantId = String(booking.get('tenantId'));
    const tenantProfile = await TenantRepo.getFullProfileById(tenantId);
    const landlordProfile = await LandlordRepo.getById(landlordId);

    if (tenantProfile && landlordProfile) {
      const tenantUser = tenantProfile.get('user') as Record<string, unknown> | undefined;
      const landlordUser = landlordProfile.get('user') as Record<string, unknown> | undefined;

      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);

      const annualRent = Number(property.priceAnnually ?? 0);
      const monthlyRent = Number(property.priceMonthly ?? 0) || annualRent / 12;
      const cautionDeposit = Number(property.cautionDeposit ?? 0);

      const { url, hash } = await generateAgreementPdf({
        landlord: {
          firstName: String(landlordUser?.firstName ?? ''),
          lastName: String(landlordUser?.lastName ?? ''),
          email: String(landlordUser?.email ?? ''),
          phone: String(landlordUser?.phone ?? ''),
          businessName: String(landlordProfile.get('businessName') ?? ''),
        },
        tenant: {
          firstName: String(tenantUser?.firstName ?? ''),
          lastName: String(tenantUser?.lastName ?? ''),
          email: String(tenantUser?.email ?? ''),
          phone: String(tenantUser?.phone ?? ''),
          nationalIdType: String(tenantProfile.get('nationalIdType') ?? ''),
          nationalIdNumber: String(tenantProfile.get('nationalIdNumber') ?? ''),
          employmentStatus: String(tenantProfile.get('employmentStatus') ?? ''),
          employerName: String(tenantProfile.get('employerName') ?? ''),
          currentAddress: String(tenantProfile.get('currentAddress') ?? ''),
          nextOfKinName: String(tenantProfile.get('nextOfKinName') ?? ''),
          nextOfKinPhone: String(tenantProfile.get('nextOfKinPhone') ?? ''),
          nextOfKinRelationship: String(tenantProfile.get('nextOfKinRelationship') ?? ''),
        },
        property: {
          title: String(property.title ?? ''),
          address: String(property.address ?? ''),
          lga: String(property.lga ?? ''),
          state: String(property.state ?? ''),
          type: String(property.type ?? ''),
        },
        lease: {
          rentStartDate: startDate.toISOString(),
          rentEndDate: endDate.toISOString(),
          monthlyRent,
          annualRent,
          cautionDeposit,
        },
        generatedAt: new Date(),
      });

      const leaseId = uuidv4();
      await LeaseRepo.create({
        id: leaseId,
        bookingId,
        propertyId: String(property.id),
        landlordId,
        tenantId,
        terms: {
          annualRent,
          monthlyRent,
          cautionDeposit,
          duration: '1 year',
        },
        rentStartDate: startDate,
        rentEndDate: endDate,
        monthlyRent,
        annualRent,
        cautionDeposit,
        status: 'PENDING_SIGNATURE',
        pdfUrl: url,
        pdfHash: hash,
        agreementUrl: url,
        agreementGeneratedAt: new Date(),
      });
    }
  } catch (err) {
    console.error('[AgreementGeneration] Failed to generate agreement:', err);
  }

  return BookingRepo.getWithProperty(bookingId);
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
  const annualRent = Number(property.priceAnnually);
  const cautionDeposit = Number(property.cautionDeposit);

  const activeFees = await PlatformFeeRepo.getActive();
  const feeBreakdown = activeFees.map((fee) => {
    const feeType = String(fee.get('type'));
    const feeValue = Number(fee.get('value'));
    const amount = feeType === 'PERCENTAGE' ? Math.round(annualRent * feeValue / 100) : feeValue;
    return { name: String(fee.get('name')), slug: String(fee.get('slug')), type: feeType, value: feeValue, amount };
  });

  const totalFees = feeBreakdown.reduce((sum, f) => sum + f.amount, 0);
  const totalAmount = annualRent + cautionDeposit + totalFees;
  const reference = `HH-${uuidv4().slice(0, 8).toUpperCase()}`;

  const paystackResponse = await paystack.initializeTransaction({
    email: String(tenantUser?.email || ''),
    amount: totalAmount * 100,
    reference,
    metadata: { bookingId, type: 'INITIAL_PAYMENT', feeBreakdown },
  });

  if (!paystackResponse.status) {
    throw new AppError('Payment initialization failed', 500);
  }

  await PaymentRepo.create({
    id: uuidv4(),
    bookingId,
    amount: annualRent + cautionDeposit,
    type: 'FIRST_RENT',
    paystackRef: reference,
    status: 'PENDING',
  });

  if (totalFees > 0) {
    await PaymentRepo.create({
      id: uuidv4(),
      bookingId,
      amount: totalFees,
      type: 'PLATFORM_FEE',
      paystackRef: `${reference}-FEE`,
      status: 'PENDING',
      metadata: { feeBreakdown },
    });
  }

  await BookingRepo.update(bookingId, { status: 'AWAITING_PAYMENT' });

  return {
    authorizationUrl: String(paystackResponse.data.authorization_url || ''),
    reference,
    breakdown: {
      annualRent,
      cautionDeposit,
      fees: feeBreakdown,
      totalFees,
      total: totalAmount,
    },
  };
}

export async function getPropertyFees(propertyId: string) {
  const property = await PropertyRepo.getById(propertyId);
  if (!property) throw new AppError('Property not found', 404);

  const annualRent = Number(property.get('priceAnnually'));
  const cautionDeposit = Number(property.get('cautionDeposit'));

  const activeFees = await PlatformFeeRepo.getActive();
  const fees = activeFees.map((fee) => {
    const feeType = String(fee.get('type'));
    const feeValue = Number(fee.get('value'));
    const amount = feeType === 'PERCENTAGE' ? Math.round(annualRent * feeValue / 100) : feeValue;
    return { name: String(fee.get('name')), slug: String(fee.get('slug')), type: feeType, value: feeValue, amount };
  });

  const totalFees = fees.reduce((sum, f) => sum + f.amount, 0);

  return {
    annualRent,
    cautionDeposit,
    fees,
    totalFees,
    total: annualRent + cautionDeposit + totalFees,
  };
}

export async function cancel(bookingId: string, landlordId: string) {
  const booking = await BookingRepo.getWithProperty(bookingId);
  const property = booking?.get('property') as Record<string, unknown> | undefined;
  if (!booking || property?.landlordId !== landlordId) {
    throw new AppError('Booking not found', 404);
  }

  const cancellable = ['APPLIED', 'UNDER_REVIEW', 'ACCEPTED', 'AWAITING_PAYMENT'];
  if (!cancellable.includes(String(booking.get('status')))) {
    throw new AppError('This booking cannot be cancelled', 400);
  }

  return BookingRepo.update(bookingId, { status: 'CANCELLED' });
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

export async function getApplicationDetail(bookingId: string, landlordId: string) {
  const booking = await BookingRepo.getApplicationWithTenantProfile(bookingId);
  if (!booking) {
    throw new AppError('Application not found', 404);
  }

  const property = booking.get('property') as Record<string, unknown> | undefined;
  if (property?.landlordId !== landlordId) {
    throw new AppError('Application not found', 404);
  }

  return booking;
}
