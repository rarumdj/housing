export const TenantApiKeys = {
  profile: '/tenants/me/profile',
  onboarding: '/tenants/me/onboarding',
  bookings: '/tenants/me/bookings',
  leases: '/tenants/me/leases',
} as const;

export const TenantQueryKeys = {
  profile: 'tenant-profile',
  bookings: 'tenant-bookings',
  leases: 'tenant-leases',
} as const;
