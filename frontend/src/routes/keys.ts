export const authKeys = {
  login: { path: '/login' },
  register: { path: '/register' },
} as const;

export const publicKeys = {
  home: { path: '/' },
  search: { path: '/search' },
  property: {
    paramPath: '/property/:id',
    build: (id: string) => `/property/${id}`,
  },
  notFound: { path: '*' },
} as const;

export const dashboardKeys = {
  tenant: {
    home: { path: '/dashboard' },
    onboarding: { path: '/dashboard/onboarding' },
    applications: { path: '/applications' },
  },
  landlord: {
    home: { path: '/landlord/dashboard' },
    properties: { path: '/landlord/properties' },
    create: { path: '/landlord/properties/new' },
    detail: {
      paramPath: '/landlord/properties/:id',
      build: (id: string) => `/landlord/properties/${id}`,
    },
    edit: {
      paramPath: '/landlord/properties/:id/edit',
      build: (id: string) => `/landlord/properties/${id}/edit`,
    },
    messages: { path: '/landlord/messages' },
    applicationReview: {
      paramPath: '/landlord/applications/:id',
      build: (id: string) => `/landlord/applications/${id}`,
    },
  },
  admin: {
    home: { path: '/admin/dashboard' },
    users: { path: '/admin/users' },
    userDetail: {
      paramPath: '/admin/users/:id',
      build: (id: string) => `/admin/users/${id}`,
    },
    properties: { path: '/admin/properties' },
    propertyDetail: {
      paramPath: '/admin/properties/:id/details',
      build: (id: string) => `/admin/properties/${id}/details`,
    },
    fees: { path: '/admin/fees' },
  },
} as const;

/** Seeded by migration `20260410000002-seed-admin-user.cjs` after `yarn db:migrate`. */
export const ADMIN_DEMO = {
  email: 'admin@househunt.dev',
  password: 'Password123!',
} as const;

export function getPostLoginPath(role: string): string {
  if (role === 'LANDLORD') return dashboardKeys.landlord.home.path;
  if (role === 'ADMIN') return dashboardKeys.admin.home.path;
  return dashboardKeys.tenant.home.path;
}
