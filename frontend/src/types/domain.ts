export type UserRole = 'LANDLORD' | 'TENANT' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  phone: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  landlord?: { verificationStatus: string; isOnboarded: boolean } | null;
  tenant?: { kycStatus: string; isOnboarded: boolean; screeningBand: string | null } | null;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  rememberMe?: boolean;
}

export interface PropertyMedia {
  id?: string;
  url: string;
  isCover?: boolean;
  type?: string;
  thumbnailUrl?: string;
  orderIndex?: number;
}

export interface PropertyCounts {
  rooms: number;
  bookings?: number;
}

export interface PropertySummary {
  id: string;
  title: string;
  address: string;
  lga: string;
  state: string;
  priceAnnually: number;
  priceMonthly?: number;
  type: string;
  verificationStatus: string;
  media: PropertyMedia[];
  _count?: PropertyCounts;
  status?: string;
}

export interface PropertyDetail extends PropertySummary {
  description: string;
  cautionDeposit?: number;
  availableFrom: string;
  isFurnished?: boolean;
  hasGenerator?: boolean;
  hasSecurity?: boolean;
  hasParking?: boolean;
}

export interface PropertyTourLink {
  nodeId: string;
  yaw: number;
  pitch: number;
}

export interface PropertyTourHotspot {
  id: string;
  label: string;
  yaw: number;
  pitch: number;
  note?: string;
}

export interface PropertyTourStop {
  id: string;
  label: string;
  description: string;
  panoramaUrl: string;
  thumbnailUrl: string;
  kind: string;
  captureNote: string;
  highlights: string[];
  dimensions: string;
  roomLabel?: string;
  links: PropertyTourLink[];
  hotspots: PropertyTourHotspot[];
}

export interface PropertyRoomFixture {
  label: string;
  status: string;
  note: string;
}

export interface PropertyRoomScan {
  room: string;
  fixtures: PropertyRoomFixture[];
}

export interface Property extends PropertyDetail {
  tourStops: PropertyTourStop[];
  roomScans: PropertyRoomScan[];
}

// ── Tenant Profile ──

export type EmploymentStatus = 'EMPLOYED' | 'SELF_EMPLOYED' | 'UNEMPLOYED' | 'STUDENT' | 'RETIRED';
export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'SEPARATED';
export type NationalIdType = 'NIN' | 'PASSPORT' | 'DRIVERS_LICENSE' | 'VOTERS_CARD';

export interface TenantProfile {
  id: string;
  userId: string;
  employmentStatus?: EmploymentStatus;
  employerName?: string;
  monthlyIncome?: number;
  maritalStatus?: MaritalStatus;
  dateOfBirth?: string;
  nationality?: string;
  nationalIdType?: NationalIdType;
  nationalIdNumber?: string;
  businessName?: string;
  businessType?: string;
  jobTitle?: string;
  annualIncome?: number;
  bankName?: string;
  accountNumber?: string;
  nextOfKinName?: string;
  nextOfKinPhone?: string;
  nextOfKinRelationship?: string;
  nextOfKinAddress?: string;
  currentAddress?: string;
  reasonForMoving?: string;
  numberOfOccupants?: number;
  hasPets?: boolean;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  screeningBand?: string;
  kycStatus?: string;
  isOnboarded?: boolean;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatarUrl?: string;
  };
}

export interface TenantProfilePayload {
  employmentStatus?: EmploymentStatus;
  employerName?: string;
  monthlyIncome?: number;
  maritalStatus?: MaritalStatus;
  dateOfBirth?: string;
  nationality?: string;
  nationalIdType?: NationalIdType;
  nationalIdNumber?: string;
  businessName?: string;
  businessType?: string;
  jobTitle?: string;
  annualIncome?: number;
  bankName?: string;
  accountNumber?: string;
  nextOfKinName?: string;
  nextOfKinPhone?: string;
  nextOfKinRelationship?: string;
  nextOfKinAddress?: string;
  currentAddress?: string;
  reasonForMoving?: string;
  numberOfOccupants?: number;
  hasPets?: boolean;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

// ── Application Detail (Landlord View) ──

export interface ApplicationDetail {
  id: string;
  propertyId: string;
  tenantId: string;
  status: string;
  message?: string;
  declineReason?: string;
  appliedAt: string;
  acceptedAt?: string;
  tenant?: TenantProfile;
  property?: BookingProperty & { priceMonthly?: number; cautionDeposit?: number; type?: string };
  lease?: BookingLease & { pdfUrl?: string; agreementUrl?: string; agreementGeneratedAt?: string };
}

export interface PropertySearchMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PropertySearchFilters {
  state?: string;
  lga?: string;
  type?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  isFurnished?: boolean;
  hasGenerator?: boolean;
  hasSecurity?: boolean;
  hasParking?: boolean;
  has3DTour?: boolean;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'rating';
  page?: number;
  limit?: number;
}

export interface TenantBookingProperty {
  id?: string;
  title?: string;
  address?: string;
  priceMonthly?: number;
}

export interface TenantBookingLease {
  id?: string;
  status?: string;
  rentStartDate?: string;
  rentEndDate?: string;
  pdfUrl?: string;
  agreementUrl?: string;
}

export interface TenantBooking {
  id: string;
  status: string;
  rentStart: string;
  rentEnd: string;
  property?: TenantBookingProperty;
  lease?: TenantBookingLease;
}

export interface BookingTenantUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
}

export interface BookingTenant {
  id: string;
  user: BookingTenantUser;
}

export interface BookingProperty {
  id: string;
  title: string;
  address?: string;
  lga?: string;
  state?: string;
  priceAnnually?: number;
}

export interface BookingLease {
  id: string;
  rentStartDate: string;
  rentEndDate: string;
  status: string;
  monthlyRent?: number;
  annualRent?: number;
}

export interface LandlordBooking {
  id: string;
  propertyId: string;
  tenantId: string;
  status: string;
  message?: string;
  declineReason?: string;
  appliedAt: string;
  acceptedAt?: string;
  paidAt?: string;
  moveInConfirmedAt?: string;
  tenant?: BookingTenant;
  property?: BookingProperty;
  lease?: BookingLease;
}

export interface PropertyActivity {
  property: PropertyDetail & { rooms?: unknown[]; media?: PropertyMedia[]; owner?: unknown };
  bookings: LandlordBooking[];
}

export interface MessageUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export interface Conversation {
  id: string;
  body: string;
  createdAt: string;
  readAt?: string;
  senderId: string;
  recipientId: string;
  propertyId?: string;
  sender: MessageUser;
  recipient: MessageUser;
  property?: { id: string; title: string };
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  propertyId?: string;
  bookingId?: string;
  body: string;
  readAt?: string;
  createdAt: string;
  sender: MessageUser;
}

// ── Admin Types ──

export interface AdminLandlordProfile {
  id: string;
  verificationStatus: string;
  isOnboarded: boolean;
  businessName?: string;
  totalProperties?: number;
}

export interface AdminTenantProfile {
  id: string;
  kycStatus: string;
  isOnboarded: boolean;
  screeningBand?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  phone: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  isActive: boolean;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  landlord?: AdminLandlordProfile | null;
  tenant?: AdminTenantProfile | null;
}

export interface AdminUserListMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PlatformFee {
  id: string;
  name: string;
  slug: string;
  type: 'PERCENTAGE' | 'FLAT';
  value: number;
  isActive: boolean;
  description?: string;
}

export interface AdminOverview {
  usersByRole: Array<{ role: string; count: number }>;
  propertiesByStatus: Array<{ status: string; count: number }>;
  totalRevenue: number;
  platformFeeTotal: number;
  activeLeases: number;
  pendingLandlords: number;
  pendingTenants: number;
  pendingProperties: number;
}

export interface MonthlyRevenue {
  month: string;
  total: number;
  count: number;
  type: string;
}

export interface FeeBreakdownItem {
  name: string;
  slug: string;
  type: string;
  value: number;
  amount: number;
}

export interface PropertyFeeBreakdown {
  annualRent: number;
  cautionDeposit: number;
  fees: FeeBreakdownItem[];
  totalFees: number;
  total: number;
}
