import { v4 as uuidv4 } from 'uuid';
import UserRepo from '../../repositories/user.repo';
import PropertyRepo from '../../repositories/property.repo';
import PaymentRepo from '../../repositories/payment.repo';
import PlatformFeeRepo from '../../repositories/platformFee.repo';
import LandlordRepo from '../../repositories/landlord.repo';
import AppError from '../../utils/appError';
import { Landlord, Tenant, Lease, Booking, Property } from '../../models';

// ── Users ──

export async function listUsers(filters: { role?: string; search?: string; isActive?: boolean; page?: number; limit?: number }) {
  return UserRepo.listAll(filters);
}

export async function getUserDetail(id: string) {
  const user = await UserRepo.getDetailedById(id);
  if (!user) throw new AppError('User not found', 404);
  return user;
}

export async function verifyUser(userId: string, status: string, _reason?: string) {
  const user = await UserRepo.getById(userId);
  if (!user) throw new AppError('User not found', 404);

  const role = String(user.get('role'));

  if (role === 'LANDLORD') {
    const landlord = await Landlord.findOne({ where: { userId } });
    if (!landlord) throw new AppError('Landlord profile not found', 404);
    await Landlord.update({ verificationStatus: status }, { where: { userId } });
    if (status === 'VERIFIED') {
      await Landlord.update({ isOnboarded: true }, { where: { userId } });
    }
  } else if (role === 'TENANT') {
    const tenant = await Tenant.findOne({ where: { userId } });
    if (!tenant) throw new AppError('Tenant profile not found', 404);
    await Tenant.update({ kycStatus: status }, { where: { userId } });
    if (status === 'VERIFIED') {
      await Tenant.update({ isOnboarded: true }, { where: { userId } });
    }
  } else {
    throw new AppError('Only landlords and tenants can be verified', 400);
  }

  return UserRepo.getProfileById(userId);
}

export async function toggleUserActive(userId: string) {
  const user = await UserRepo.getById(userId);
  if (!user) throw new AppError('User not found', 404);

  const current = Boolean(user.get('isActive'));
  await UserRepo.update({ isActive: !current }, { id: userId });
  return UserRepo.getProfileById(userId);
}

// ── Properties ──

export async function listProperties(filters: { status?: string; verificationStatus?: string; page?: number; limit?: number }) {
  return PropertyRepo.listAll(filters);
}

export async function verifyProperty(propertyId: string, verificationStatus: string, _reason?: string) {
  const property = await PropertyRepo.getById(propertyId);
  if (!property) throw new AppError('Property not found', 404);

  const updates: Record<string, unknown> = { verificationStatus };
  if (verificationStatus === 'VERIFIED') {
    updates.status = 'ACTIVE';
  }

  return PropertyRepo.updateById(propertyId, updates);
}

export async function deleteProperty(propertyId: string) {
  const property = await PropertyRepo.getById(propertyId);
  if (!property) throw new AppError('Property not found', 404);
  return PropertyRepo.updateById(propertyId, { status: 'ARCHIVED' });
}

// ── Fees ──

export async function listFees() {
  return PlatformFeeRepo.getAll();
}

export async function createFee(payload: { name: string; slug: string; type: string; value: number; description?: string; isActive?: boolean }) {
  const existing = await PlatformFeeRepo.getBySlug(payload.slug);
  if (existing) throw new AppError('A fee with this slug already exists', 409);

  return PlatformFeeRepo.create({ id: uuidv4(), ...payload });
}

export async function updateFee(id: string, payload: Record<string, unknown>) {
  const fee = await PlatformFeeRepo.getById(id);
  if (!fee) throw new AppError('Fee not found', 404);
  return PlatformFeeRepo.update(id, payload);
}

export async function deleteFee(id: string) {
  const fee = await PlatformFeeRepo.getById(id);
  if (!fee) throw new AppError('Fee not found', 404);
  await PlatformFeeRepo.delete(id);
}

// ── Analytics ──

export async function getOverview() {
  const [usersByRole, propertiesByStatus, totalRevenue, platformFeeTotal, activeLeases] = await Promise.all([
    UserRepo.countByRole(),
    PropertyRepo.countByStatus(),
    PaymentRepo.getTotalRevenue(),
    PaymentRepo.getPlatformFeeTotal(),
    Lease.count({ where: { status: 'ACTIVE' } }),
  ]);

  const pendingLandlords = await Landlord.count({ where: { verificationStatus: 'PENDING' } });
  const pendingTenants = await Tenant.count({ where: { kycStatus: 'PENDING' } });
  const pendingProperties = await Property.count({ where: { verificationStatus: 'PENDING' } });

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
}

export async function getRevenueAnalytics() {
  return PaymentRepo.getMonthlyRevenue();
}

export async function getLandlordAnalytics() {
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
}

export async function getTenantAnalytics() {
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
}
