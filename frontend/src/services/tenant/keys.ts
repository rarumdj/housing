export const TenantApiKeys = {
  profile: '/tenants/me/profile',
  onboarding: '/tenants/me/onboarding',
  documents: '/tenants/me/documents',
  bookings: '/tenants/me/bookings',
  leases: '/tenants/me/leases',
  sendPhoneOtp: '/tenants/me/phone/send-otp',
  verifyPhoneOtp: '/tenants/me/phone/verify-otp',
} as const;

export const TenantQueryKeys = {
  profile: 'tenant-profile',
  bookings: 'tenant-bookings',
  leases: 'tenant-leases',
} as const;
