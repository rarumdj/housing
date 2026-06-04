type MockProperty = {
  id: string;
  title: string;
  description: string;
  type: string;
  address: string;
  lga: string;
  state: string;
  lat: number;
  lng: number;
  priceMonthly: number;
  priceAnnually: number;
  cautionDeposit: number;
  availableFrom: Date;
  isFurnished: boolean;
  hasGenerator: boolean;
  hasSecurity: boolean;
  hasParking: boolean;
  status: 'ACTIVE';
  verificationStatus: 'VERIFIED';
  media: Array<{ id: string; url: string; isCover: boolean; type: 'PHOTO' | 'TOUR_360' | 'MODEL_3D' }>;
  rooms: Array<{ id: string; roomType: string; features: string[] }>;
  owner: {
    id: string;
    businessName: string;
    user: {
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
      phone: string;
    };
  };
  createdAt: Date;
};

const day = 24 * 60 * 60 * 1000;

export const mockProperties: MockProperty[] = [
  {
    id: 'mock-ikoyi-1',
    title: 'Bright 2-bedroom flat with waterfront view',
    description: 'A calm, well-finished two-bedroom apartment in Ikoyi with secure access, parking, and a bright living area.',
    type: 'TWO_BEDROOM',
    address: 'Bourdillon Road, Ikoyi',
    lga: 'Eti-Osa',
    state: 'Lagos',
    lat: 6.4541,
    lng: 3.4306,
    priceMonthly: 650000,
    priceAnnually: 7800000,
    cautionDeposit: 500000,
    availableFrom: new Date('2026-04-15T00:00:00.000Z'),
    isFurnished: false,
    hasGenerator: true,
    hasSecurity: true,
    hasParking: true,
    status: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    media: [
      { id: 'media-ikoyi-cover', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80', isCover: true, type: 'PHOTO' },
    ],
    rooms: [
      { id: 'room-ikoyi-1', roomType: 'BEDROOM', features: ['wardrobe', 'window'] },
      { id: 'room-ikoyi-2', roomType: 'LIVING_ROOM', features: ['balcony', 'tv-console'] },
    ],
    owner: {
      id: 'demo-landlord-1',
      businessName: 'Lagoon Homes',
      user: {
        firstName: 'Ada',
        lastName: 'Okafor',
        avatarUrl: null,
        phone: '+2348000000001',
      },
    },
    createdAt: new Date(Date.now() - 1 * day),
  },
  {
    id: 'mock-lekki-2',
    title: 'Modern duplex in Lekki with 360 tour',
    description: 'A spacious duplex with contemporary finishing, private parking, and a guided 360 tour for remote inspection.',
    type: 'DUPLEX',
    address: 'Admiralty Way, Lekki Phase 1',
    lga: 'Eti-Osa',
    state: 'Lagos',
    lat: 6.4474,
    lng: 3.4722,
    priceMonthly: 1100000,
    priceAnnually: 13200000,
    cautionDeposit: 1000000,
    availableFrom: new Date('2026-04-20T00:00:00.000Z'),
    isFurnished: true,
    hasGenerator: true,
    hasSecurity: true,
    hasParking: true,
    status: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    media: [
      { id: 'media-lekki-cover', url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80', isCover: true, type: 'PHOTO' },
      { id: 'media-lekki-tour', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80', isCover: false, type: 'TOUR_360' },
    ],
    rooms: [
      { id: 'room-lekki-1', roomType: 'BEDROOM', features: ['ensuite', 'wardrobe'] },
      { id: 'room-lekki-2', roomType: 'LIVING_ROOM', features: ['double-volume', 'spotlights'] },
    ],
    owner: {
      id: 'demo-landlord-1',
      businessName: 'Lagoon Homes',
      user: {
        firstName: 'Ada',
        lastName: 'Okafor',
        avatarUrl: null,
        phone: '+2348000000001',
      },
    },
    createdAt: new Date(Date.now() - 2 * day),
  },
  {
    id: 'mock-wuse-3',
    title: 'Furnished 1-bedroom apartment near Wuse market',
    description: 'A tidy one-bedroom apartment in Abuja, fully furnished and ideal for a professional looking for a central location.',
    type: 'ONE_BEDROOM',
    address: 'Wuse Zone 4, Abuja',
    lga: 'Municipal Area Council',
    state: 'FCT',
    lat: 9.0765,
    lng: 7.3986,
    priceMonthly: 420000,
    priceAnnually: 5040000,
    cautionDeposit: 300000,
    availableFrom: new Date('2026-04-10T00:00:00.000Z'),
    isFurnished: true,
    hasGenerator: true,
    hasSecurity: true,
    hasParking: false,
    status: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    media: [
      { id: 'media-wuse-cover', url: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80', isCover: true, type: 'PHOTO' },
      { id: 'media-wuse-tour', url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80', isCover: false, type: 'TOUR_360' },
    ],
    rooms: [
      { id: 'room-wuse-1', roomType: 'BEDROOM', features: ['furnished', 'window'] },
      { id: 'room-wuse-2', roomType: 'BATHROOM', features: ['water-heater'] },
      { id: 'room-wuse-3', roomType: 'KITCHEN', features: ['cabinets'] },
    ],
    owner: {
      id: 'demo-landlord-1',
      businessName: 'Lagoon Homes',
      user: {
        firstName: 'Ada',
        lastName: 'Okafor',
        avatarUrl: null,
        phone: '+2348000000001',
      },
    },
    createdAt: new Date(Date.now() - 3 * day),
  },
];

export const searchMockProperties = (filters: Record<string, unknown>) => {
  const page = Number(filters.page || 1);
  const limit = Number(filters.limit || 12);
  const sortBy = String(filters.sortBy || 'newest');

  let filtered = mockProperties.filter((property) => {
    if (filters.state && property.state !== filters.state) return false;
    if (filters.lga && property.lga !== filters.lga) return false;
    if (filters.type && property.type !== filters.type) return false;
    if (filters.isFurnished !== undefined && property.isFurnished !== filters.isFurnished) return false;
    if (filters.hasGenerator !== undefined && property.hasGenerator !== filters.hasGenerator) return false;
    if (filters.hasSecurity !== undefined && property.hasSecurity !== filters.hasSecurity) return false;
    if (filters.hasParking !== undefined && property.hasParking !== filters.hasParking) return false;
    if (filters.minPrice !== undefined && property.priceAnnually < Number(filters.minPrice)) return false;
    if (filters.maxPrice !== undefined && property.priceAnnually > Number(filters.maxPrice)) return false;
    if (filters.has3DTour && !property.media.some((media) => media.type === 'MODEL_3D' || media.type === 'TOUR_360')) return false;
    return true;
  });

  filtered = filtered.sort((a, b) => {
    if (sortBy === 'price_asc') return a.priceAnnually - b.priceAnnually;
    if (sortBy === 'price_desc') return b.priceAnnually - a.priceAnnually;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const total = filtered.length;
  const start = (page - 1) * limit;
  const properties = filtered.slice(start, start + limit).map((property) => ({
    ...property,
    _count: { rooms: property.rooms.length },
  }));

  return {
    properties,
    meta: {
      total,
      page,
      limit,
      pages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

export const getMockPropertyById = (id: string) => {
  const property = mockProperties.find((item) => item.id === id);
  if (!property) return null;

  return {
    ...property,
    _count: { rooms: property.rooms.length },
  };
};
