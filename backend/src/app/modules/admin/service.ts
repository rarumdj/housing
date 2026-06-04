import { Op } from 'sequelize';
import UserRepo from '../../repositories/user.repo';
import PropertyRepo from '../../repositories/property.repo';
import PaymentRepo from '../../repositories/payment.repo';
import PlatformFeeRepo from '../../repositories/platformFee.repo';
import LandlordRepo from '../../repositories/landlord.repo';
import AppError from '../../utils/appError';
import { Landlord, Tenant, Lease, Booking, Property } from '../../models';

// Statuses that still need an admin decision (i.e. not yet VERIFIED / REJECTED).
const AWAITING_REVIEW = ['PENDING', 'UNDER_REVIEW', 'SUBMITTED'];

// ── Users ──

export const listUsers = async (filters: { role?: string; search?: string; isActive?: boolean; page?: number; limit?: number }) => {
  return UserRepo.listAll(filters);
};

export const getUserDetail = async (id: string) => {
  const user = await UserRepo.getDetailedById(id);
  if (!user) throw new AppError('User not found', 404);
  return user;
};

export const verifyUser = async (userId: string, status: string, reason?: string) => {
  const user = await UserRepo.getById(userId);
  if (!user) throw new AppError('User not found', 404);

  if (status === 'REJECTED' && !reason?.trim()) {
    throw new AppError('A reason is required when declining', 400);
  }

  // The note is the decline reason; clear it when approving.
  const note = status === 'REJECTED' ? reason!.trim() : null;
  const role = String(user.get('role'));
  // FK is keyed on the user's internal numeric id.
  const internalUserId = user.get('id') as number;

  if (role === 'LANDLORD') {
    const landlord = await Landlord.findOne({ where: { userId: internalUserId } });
    if (!landlord) throw new AppError('Landlord profile not found', 404);
    await Landlord.update(
      { verificationStatus: status, verificationNote: note, ...(status === 'VERIFIED' ? { isOnboarded: true } : {}) },
      { where: { userId: internalUserId } },
    );
  } else if (role === 'TENANT') {
    const tenant = await Tenant.findOne({ where: { userId: internalUserId } });
    if (!tenant) throw new AppError('Tenant profile not found', 404);
    await Tenant.update(
      { kycStatus: status, kycNote: note, ...(status === 'VERIFIED' ? { isOnboarded: true } : {}) },
      { where: { userId: internalUserId } },
    );
  } else {
    throw new AppError('Only landlords and tenants can be verified', 400);
  }

  return UserRepo.getProfileById(String(internalUserId));
};

export const toggleUserActive = async (userId: string) => {
  const user = await UserRepo.getById(userId);
  if (!user) throw new AppError('User not found', 404);

  const current = Boolean(user.get('isActive'));
  await UserRepo.update({ isActive: !current }, { id: userId });
  return UserRepo.getProfileById(userId);
};

// ── Properties ──

export const listProperties = async (filters: { status?: string; verificationStatus?: string; page?: number; limit?: number }) => {
  return PropertyRepo.listAll(filters);
};

export const verifyProperty = async (propertyId: string, verificationStatus: string, reason?: string) => {
  const property = await PropertyRepo.getById(propertyId);
  if (!property) throw new AppError('Property not found', 404);

  if (verificationStatus === 'REJECTED' && !reason?.trim()) {
    throw new AppError('A reason is required when declining', 400);
  }

  const updates: Record<string, unknown> = {
    verificationStatus,
    verificationNote: verificationStatus === 'REJECTED' ? reason!.trim() : null,
  };
  if (verificationStatus === 'VERIFIED') {
    updates.status = 'ACTIVE';
  }

  return PropertyRepo.updateById(propertyId, updates);
};

export const deleteProperty = async (propertyId: string) => {
  const property = await PropertyRepo.getById(propertyId);
  if (!property) throw new AppError('Property not found', 404);
  return PropertyRepo.updateById(propertyId, { status: 'ARCHIVED' });
};

// ── Fees ──

export const listFees = async () => {
  return PlatformFeeRepo.getAll();
};

export const createFee = async (payload: { name: string; slug: string; type: string; value: number; description?: string; isActive?: boolean }) => {
  const existing = await PlatformFeeRepo.getBySlug(payload.slug);
  if (existing) throw new AppError('A fee with this slug already exists', 409);

  return PlatformFeeRepo.create({ ...payload });
}

export const updateFee = async (id: string, payload: Record<string, unknown>) => {
  const fee = await PlatformFeeRepo.getById(id);
  if (!fee) throw new AppError('Fee not found', 404);
  return PlatformFeeRepo.update(id, payload);
};

export const deleteFee = async (id: string) => {
  const fee = await PlatformFeeRepo.getById(id);
  if (!fee) throw new AppError('Fee not found', 404);
  await PlatformFeeRepo.delete(id);
};

// ── Analytics ──

export const getOverview = async () => {
  const [usersByRole, propertiesByStatus, totalRevenue, platformFeeTotal, activeLeases] = await Promise.all([
    UserRepo.countByRole(),
    PropertyRepo.countByStatus(),
    PaymentRepo.getTotalRevenue(),
    PaymentRepo.getPlatformFeeTotal(),
    Lease.count({ where: { status: 'ACTIVE' } }),
  ]);

  const pendingLandlords = await Landlord.count({ where: { verificationStatus: { [Op.in]: AWAITING_REVIEW } } });
  const pendingTenants = await Tenant.count({ where: { kycStatus: { [Op.in]: AWAITING_REVIEW } } });
  const pendingProperties = await Property.count({ where: { verificationStatus: { [Op.in]: AWAITING_REVIEW } } });

  return {
    usersByRole,
    propertiesByStatus,
    totalRevenue,
    platformFeeTotal,
    activeLeases,
    pendingLandlords,
    pendingTenants,
    pendingProperties,
  };
};

export const getRevenueAnalytics = async () => {
  return PaymentRepo.getMonthlyRevenue();
};

export const getLandlordAnalytics = async () => {
  const landlords = await Landlord.findAll({
    include: [
      { model: Property.sequelize!.models.User, as: 'user', attributes: ['firstName', 'lastName', 'email'] },
      { model: Property, as: 'properties', attributes: ['id', 'title', 'status', 'priceAnnually'] },
      { model: Lease, as: 'leases', attributes: ['id', 'status', 'annualRent'] },
    ],
  });

  return landlords.map((l) => {
    const plain = l.get({ plain: true }) as Record<string, unknown>;
    const properties = (plain.properties ?? []) as Array<Record<string, unknown>>;
    const leases = (plain.leases ?? []) as Array<Record<string, unknown>>;
    const activeLeases = leases.filter((lease) => lease.status === 'ACTIVE');
    const totalEarnings = activeLeases.reduce((sum, lease) => sum + Number(lease.annualRent || 0), 0);

    return {
      ...plain,
      totalProperties: properties.length,
      activeLeases: activeLeases.length,
      totalEarnings,
    };
  });
};

export const getTenantAnalytics = async () => {
  const tenants = await Tenant.findAll({
    include: [
      { model: Booking.sequelize!.models.User, as: 'user', attributes: ['firstName', 'lastName', 'email'] },
      {
        model: Booking,
        as: 'bookings',
        attributes: ['id', 'status', 'propertyId'],
        include: [{ model: Booking.sequelize!.models.Payment, as: 'payments', attributes: ['id', 'amount', 'status', 'type'] }],
      },
    ],
  });

  return tenants.map((t) => {
    const plain = t.get({ plain: true }) as Record<string, unknown>;
    const bookings = (plain.bookings ?? []) as Array<Record<string, unknown>>;
    const payments = bookings.flatMap((b) => (b.payments ?? []) as Array<Record<string, unknown>>);
    const paidPayments = payments.filter((p) => ['SUCCESS', 'HELD_IN_ESCROW', 'RELEASED'].includes(String(p.status)));
    const totalSpent = paidPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const activeBookings = bookings.filter((b) => b.status === 'ACTIVE');

    return {
      ...plain,
      totalSpent,
      activeBookings: activeBookings.length,
      totalPayments: paidPayments.length,
    };
  });
};
