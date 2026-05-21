import { Booking, Lease, Payment, Property, Renewal, Tenant, User } from '../models';

const PROFILE_ATTRIBUTES = [
  'id', 'userId', 'employmentStatus', 'employerName', 'monthlyIncome',
  'screeningScore', 'screeningBand', 'kycStatus', 'kycDocs', 'bankConnected',
  'monoAccountId', 'isOnboarded',
  'maritalStatus', 'dateOfBirth', 'nationality',
  'nationalIdType', 'nationalIdNumber',
  'businessName', 'businessType', 'jobTitle', 'annualIncome',
  'bankName', 'accountNumber',
  'nextOfKinName', 'nextOfKinPhone', 'nextOfKinRelationship', 'nextOfKinAddress',
  'currentAddress', 'reasonForMoving', 'numberOfOccupants', 'hasPets',
  'emergencyContactName', 'emergencyContactPhone',
  'createdAt', 'updatedAt',
];

const TenantRepo = {
  create: async (data: Record<string, unknown>) => Tenant.create(data),

  getByUserId: async (userId: string) =>
    Tenant.findOne({
      where: { userId },
      include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'email', 'phone', 'avatarUrl'] }],
    }),

  getFullProfileByUserId: async (userId: string) =>
    Tenant.findOne({
      where: { userId },
      attributes: PROFILE_ATTRIBUTES,
      include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'email', 'phone', 'avatarUrl'] }],
    }),

  getFullProfileById: async (id: string) =>
    Tenant.findByPk(id, {
      attributes: PROFILE_ATTRIBUTES,
      include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'avatarUrl'] }],
    }),

  updateByUserId: async (userId: string, data: Record<string, unknown>) => {
    await Tenant.update(data, { where: { userId } });
    return TenantRepo.getFullProfileByUserId(userId);
  },

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
          attributes: ['id', 'status', 'rentStartDate', 'rentEndDate', 'pdfUrl', 'agreementUrl'],
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
