export const PropertyApiKeys = {
  list: '/properties',
  detail: (id: string) => `/properties/${id}`,
  myProperties: '/properties/my/list',
  create: '/properties',
  update: (id: string) => `/properties/${id}`,
  delete: (id: string) => `/properties/${id}`,
  publish: (id: string) => `/properties/${id}/publish`,
  addRoom: (id: string) => `/properties/${id}/rooms`,
  uploadMedia: (id: string) => `/properties/${id}/media`,
  deleteMedia: (id: string, mediaId: string) => `/properties/${id}/media/${mediaId}`,
  setCoverMedia: (id: string, mediaId: string) => `/properties/${id}/media/${mediaId}/cover`,
  activity: (id: string) => `/properties/${id}/activity`,
} as const;

export const PropertyQueryKeys = {
  list: 'properties-list',
  detail: 'properties-detail',
  myProperties: 'properties-my-list',
  activity: 'properties-activity',
} as const;
