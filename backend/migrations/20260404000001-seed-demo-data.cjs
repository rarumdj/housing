'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const passwordHash = bcrypt.hashSync('Password123!', 12);

    await queryInterface.bulkInsert('users', [
      {
        id: 'demo-user-landlord-1',
        email: 'landlord@househunt.dev',
        phone: '+2348000000001',
        passwordHash,
        role: 'LANDLORD',
        firstName: 'Ada',
        lastName: 'Okafor',
        isPhoneVerified: true,
        isEmailVerified: true,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'demo-user-tenant-1',
        email: 'tenant@househunt.dev',
        phone: '+2348000000002',
        passwordHash,
        role: 'TENANT',
        firstName: 'Tobi',
        lastName: 'Bello',
        isPhoneVerified: true,
        isEmailVerified: true,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    await queryInterface.bulkInsert('landlords', [
      {
        id: 'demo-landlord-1',
        userId: 'demo-user-landlord-1',
        businessName: 'Lagoon Homes',
        verificationStatus: 'VERIFIED',
        verificationDocs: JSON.stringify([]),
        totalProperties: 3,
        isOnboarded: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    await queryInterface.bulkInsert('tenants', [
      {
        id: 'demo-tenant-1',
        userId: 'demo-user-tenant-1',
        kycStatus: 'VERIFIED',
        kycDocs: JSON.stringify([]),
        bankConnected: false,
        isOnboarded: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    await queryInterface.bulkInsert('properties', [
      {
        id: 'mock-ikoyi-1',
        landlordId: 'demo-landlord-1',
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
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
        isFurnished: false,
        isSemiFurnished: false,
        hasGenerator: true,
        hasParking: true,
        hasSecurity: true,
        hasElevator: false,
        hasPool: false,
        totalRooms: 5,
        viewCount: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'mock-lekki-2',
        landlordId: 'demo-landlord-1',
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
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
        isFurnished: true,
        isSemiFurnished: false,
        hasGenerator: true,
        hasParking: true,
        hasSecurity: true,
        hasElevator: false,
        hasPool: false,
        totalRooms: 8,
        viewCount: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'mock-wuse-3',
        landlordId: 'demo-landlord-1',
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
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
        isFurnished: true,
        isSemiFurnished: false,
        hasGenerator: true,
        hasParking: false,
        hasSecurity: true,
        hasElevator: false,
        hasPool: false,
        totalRooms: 3,
        viewCount: 0,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    await queryInterface.bulkInsert('property_media', [
      {
        id: 'media-ikoyi-cover',
        propertyId: 'mock-ikoyi-1',
        type: 'PHOTO',
        url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
        isCover: true,
        orderIndex: 0,
        nonceVerified: false,
        createdAt: now,
      },
      {
        id: 'media-lekki-cover',
        propertyId: 'mock-lekki-2',
        type: 'PHOTO',
        url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
        isCover: true,
        orderIndex: 0,
        nonceVerified: false,
        createdAt: now,
      },
      {
        id: 'media-lekki-tour',
        propertyId: 'mock-lekki-2',
        type: 'TOUR_360',
        url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
        isCover: false,
        orderIndex: 1,
        nonceVerified: false,
        createdAt: now,
      },
      {
        id: 'media-wuse-cover',
        propertyId: 'mock-wuse-3',
        type: 'PHOTO',
        url: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
        isCover: true,
        orderIndex: 0,
        nonceVerified: false,
        createdAt: now,
      },
      {
        id: 'media-wuse-tour',
        propertyId: 'mock-wuse-3',
        type: 'TOUR_360',
        url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80',
        isCover: false,
        orderIndex: 1,
        nonceVerified: false,
        createdAt: now,
      },
    ]);

    await queryInterface.bulkInsert('property_rooms', [
      {
        id: 'room-ikoyi-1',
        propertyId: 'mock-ikoyi-1',
        roomType: 'BEDROOM',
        features: JSON.stringify(['wardrobe', 'window']),
        createdAt: now,
      },
      {
        id: 'room-ikoyi-2',
        propertyId: 'mock-ikoyi-1',
        roomType: 'LIVING_ROOM',
        features: JSON.stringify(['balcony', 'tv-console']),
        createdAt: now,
      },
      {
        id: 'room-lekki-1',
        propertyId: 'mock-lekki-2',
        roomType: 'BEDROOM',
        features: JSON.stringify(['ensuite', 'wardrobe']),
        createdAt: now,
      },
      {
        id: 'room-lekki-2',
        propertyId: 'mock-lekki-2',
        roomType: 'LIVING_ROOM',
        features: JSON.stringify(['double-volume', 'spotlights']),
        createdAt: now,
      },
      {
        id: 'room-wuse-1',
        propertyId: 'mock-wuse-3',
        roomType: 'BEDROOM',
        features: JSON.stringify(['furnished', 'window']),
        createdAt: now,
      },
      {
        id: 'room-wuse-2',
        propertyId: 'mock-wuse-3',
        roomType: 'BATHROOM',
        features: JSON.stringify(['water-heater']),
        createdAt: now,
      },
      {
        id: 'room-wuse-3',
        propertyId: 'mock-wuse-3',
        roomType: 'KITCHEN',
        features: JSON.stringify(['cabinets']),
        createdAt: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('property_rooms', {
      id: ['room-ikoyi-1', 'room-ikoyi-2', 'room-lekki-1', 'room-lekki-2', 'room-wuse-1', 'room-wuse-2', 'room-wuse-3'],
    });
    await queryInterface.bulkDelete('property_media', {
      id: ['media-ikoyi-cover', 'media-lekki-cover', 'media-lekki-tour', 'media-wuse-cover', 'media-wuse-tour'],
    });
    await queryInterface.bulkDelete('properties', {
      id: ['mock-ikoyi-1', 'mock-lekki-2', 'mock-wuse-3'],
    });
    await queryInterface.bulkDelete('tenants', { id: ['demo-tenant-1'] });
    await queryInterface.bulkDelete('landlords', { id: ['demo-landlord-1'] });
    await queryInterface.bulkDelete('users', { id: ['demo-user-landlord-1', 'demo-user-tenant-1'] });
  },
};
