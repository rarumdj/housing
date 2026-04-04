export const PropertyApiKeys = {
  list: '/properties',
  detail: (id: string) => `/properties/${id}`,
  myProperties: '/properties/my/list',
  create: '/properties',
  publish: (id: string) => `/properties/${id}/publish`,
  addRoom: (id: string) => `/properties/${id}/rooms`,
} as const;

export const PropertyQueryKeys = {
  list: 'properties-list',
  detail: 'properties-detail',
  myProperties: 'properties-my-list',
} as const;
