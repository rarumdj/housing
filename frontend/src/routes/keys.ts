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
  },
} as const;
