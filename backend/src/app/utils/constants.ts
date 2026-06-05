export const ROLES = ['TENANT', 'LANDLORD', 'ADMIN'] as const;

export const VERIFICATION_STATUSES = ['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED'] as const;
export const PROPERTY_STATUSES = ['DRAFT', 'PENDING_VERIFICATION', 'ACTIVE', 'RENTED', 'ARCHIVED'] as const;
export const PROPERTY_TYPES = [
  'STUDIO_APARTMENT',
  'FLAT_APARTMENT',
  'DETACHED',
  'SEMI_DETACHED',
  'TERRACE',
  'BUNGALOW',
  'MAISONETTE',
  'PENTHOUSE',
  'WHOLE_BUILDING',
  'SELF_CONTAINED',
  // Legacy values retained for backward compatibility with existing listings
  'ONE_BEDROOM',
  'TWO_BEDROOM',
  'THREE_BEDROOM',
  'FOUR_BEDROOM_PLUS',
  'DUPLEX',
  'FLAT',
  'MINI_FLAT',
] as const;

export const PROPERTY_AMENITIES = [
  '24hrs Electricity', '24hrs Security', 'Automated Gate', 'Basketball Court', 'Boardroom',
  'Borehole', 'Call to Access/ID pass', 'Car Park', 'CCTV', 'Central water system',
  "Children's playground / Park area", 'Cinema', 'Communal Generator', 'Communal Swimming pool',
  'Concierge Services', 'Coworking space', 'Dedicated Transformer', 'Drainage system',
  'Electric charging station', 'Elevator', 'Estate clubhouse or Event hall', 'Estate intercom',
  'Estate management office', 'Estate Patrol', 'Estate shuttle service', 'Facility manager office',
  'Fitness Room', 'Fitted Kitchen', 'Football pitch', 'Garage', 'Gas Meter', 'Gated Community',
  'Gatehouse', 'Golf Court', 'Good road network', 'Green area / Garden', 'Internet/WiFi', 'Inverter',
  'Laundromat', 'Maintenance Room', 'Mini-mart', 'Prepaid Meter', 'Private swimming pool',
  'Restaurant', 'Rooftop Garden', 'Rooftop Terrace', 'Salon', 'Sauna', 'Security House',
  'Tennis Court', 'Waste disposal & management system', 'Water Meter', 'Water Treatment Plant',
] as const;
export const MEDIA_TYPES = ['PHOTO', 'VIDEO', 'MODEL_3D', 'TOUR_360'] as const;
export const ROOM_TYPES = [
  'KITCHEN',
  'BATHROOM',
  'BEDROOM',
  'LIVING_ROOM',
  'DINING_ROOM',
  'STUDY',
  'BALCONY',
  'STORE',
  'OTHER',
] as const;
export const BOOKING_STATUSES = [
  'APPLIED',
  'UNDER_REVIEW',
  'ACCEPTED',
  'DECLINED',
  'AWAITING_PAYMENT',
  'PAID',
  'ACTIVE',
  'ENDED',
  'CANCELLED',
] as const;
export const LEASE_STATUSES = ['DRAFT', 'PENDING_SIGNATURE', 'ACTIVE', 'EXPIRED', 'DISPUTED', 'TERMINATED'] as const;
export const PAYMENT_TYPES = ['CAUTION_DEPOSIT', 'FIRST_RENT', 'RENEWAL_RENT', 'PLATFORM_FEE', 'REFUND'] as const;
export const PAYMENT_STATUSES = ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'HELD_IN_ESCROW', 'RELEASED'] as const;
export const RENEWAL_STATUSES = ['PROPOSED', 'ACCEPTED', 'APPEALED', 'DECLINED', 'EXPIRED'] as const;
export const SCREENING_BANDS = ['EXCELLENT', 'GOOD', 'FAIR', 'REVIEW'] as const;
export const EMPLOYMENT_STATUSES = ['EMPLOYED', 'SELF_EMPLOYED', 'UNEMPLOYED', 'STUDENT', 'RETIRED'] as const;

export const ONBOARDING_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED'] as const;
export const LANDLORD_OWNERSHIP_TYPES = ['OWNER', 'PROPERTY_MANAGER', 'AGENCY', 'REPRESENTATIVE'] as const;
export const LANDLORD_OPERATION_TYPES = ['INDIVIDUAL', 'PROPERTY_MANAGEMENT_COMPANY', 'REAL_ESTATE_AGENCY'] as const;
export const CONTACT_METHODS = ['IN_APP', 'EMAIL', 'PHONE', 'SMS'] as const;
export const PAYOUT_PREFERENCES = ['INSTANT', 'DAILY', 'WEEKLY', 'MONTHLY'] as const;
export const PAYMENT_PROVIDERS = ['paystack', 'flutterwave'] as const;
export const LANDLORD_ID_TYPES = ['DRIVERS_LICENSE', 'PASSPORT', 'NATIONAL_ID'] as const;
export const PORTFOLIO_SIZES = ['1', '2-5', '6-20', '20+'] as const;
