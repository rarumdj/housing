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
}

export interface TenantBooking {
  id: string;
  status: string;
  rentStart: string;
  rentEnd: string;
  property?: TenantBookingProperty;
  lease?: TenantBookingLease;
}
