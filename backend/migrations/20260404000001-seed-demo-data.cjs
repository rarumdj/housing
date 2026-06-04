'use strict';

const bcrypt = require('bcryptjs');
const { generateCode } = require('../config/migration-helpers.cjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const passwordHash = bcrypt.hashSync('Password123!', 12);
    const q = (sql, replacements) =>
      queryInterface.sequelize.query(sql, { replacements, type: queryInterface.sequelize.QueryTypes.SELECT });

    await queryInterface.bulkInsert('users', [
      {
        code: generateCode('usr'),
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
        code: generateCode('usr'),
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

    const users = await q(
      "SELECT id, email FROM users WHERE email IN ('landlord@househunt.dev', 'tenant@househunt.dev')",
    );
    const landlordUserId = users.find((u) => u.email === 'landlord@househunt.dev').id;
    const tenantUserId = users.find((u) => u.email === 'tenant@househunt.dev').id;

    await queryInterface.bulkInsert('landlords', [
      {
        code: generateCode('lld'),
        userId: landlordUserId,
        businessName: 'Lagoon Homes',
        verificationStatus: 'VERIFIED',
        verificationDocs: JSON.stringify([]),
        totalProperties: 3,
        isOnboarded: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);
    const [landlord] = await q('SELECT id FROM landlords WHERE userId = :uid', { uid: landlordUserId });
    const landlordId = landlord.id;

    await queryInterface.bulkInsert('tenants', [
      {
        code: generateCode('tnt'),
        userId: tenantUserId,
        kycStatus: 'VERIFIED',
        kycDocs: JSON.stringify([]),
        bankConnected: false,
        isOnboarded: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    const propertySeeds = [
      {
        marker: 'ikoyi',
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
        hasParking: true,
        hasSecurity: true,
        totalRooms: 5,
      },
      {
        marker: 'lekki',
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
        hasParking: true,
        hasSecurity: true,
        totalRooms: 8,
      },
      {
        marker: 'wuse',
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
        hasParking: false,
        hasSecurity: true,
        totalRooms: 3,
      },
    ];

    await queryInterface.bulkInsert(
      'properties',
      propertySeeds.map((p) => ({
        code: generateCode('prp'),
        landlordId,
        title: p.title,
        description: p.description,
        type: p.type,
        address: p.address,
        lga: p.lga,
        state: p.state,
        lat: p.lat,
        lng: p.lng,
        priceMonthly: p.priceMonthly,
        priceAnnually: p.priceAnnually,
        cautionDeposit: p.cautionDeposit,
        availableFrom: p.availableFrom,
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
        isFurnished: p.isFurnished,
        isSemiFurnished: false,
        hasGenerator: p.hasGenerator,
        hasParking: p.hasParking,
        hasSecurity: p.hasSecurity,
        hasElevator: false,
        hasPool: false,
        totalRooms: p.totalRooms,
        viewCount: 0,
        createdAt: now,
        updatedAt: now,
      })),
    );

    const props = await q('SELECT id, title FROM properties WHERE landlordId = :lid', { lid: landlordId });
    const idByTitle = (title) => props.find((p) => p.title === title).id;
    const ikoyiId = idByTitle(propertySeeds[0].title);
    const lekkiId = idByTitle(propertySeeds[1].title);
    const wuseId = idByTitle(propertySeeds[2].title);

    await queryInterface.bulkInsert('property_media', [
      { code: generateCode('pmd'), propertyId: ikoyiId, type: 'PHOTO', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80', isCover: true, orderIndex: 0, nonceVerified: false, createdAt: now },
      { code: generateCode('pmd'), propertyId: lekkiId, type: 'PHOTO', url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80', isCover: true, orderIndex: 0, nonceVerified: false, createdAt: now },
      { code: generateCode('pmd'), propertyId: lekkiId, type: 'TOUR_360', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80', isCover: false, orderIndex: 1, nonceVerified: false, createdAt: now },
      { code: generateCode('pmd'), propertyId: wuseId, type: 'PHOTO', url: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80', isCover: true, orderIndex: 0, nonceVerified: false, createdAt: now },
      { code: generateCode('pmd'), propertyId: wuseId, type: 'TOUR_360', url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80', isCover: false, orderIndex: 1, nonceVerified: false, createdAt: now },
    ]);

    await queryInterface.bulkInsert('property_rooms', [
      { code: generateCode('prm'), propertyId: ikoyiId, roomType: 'BEDROOM', features: JSON.stringify(['wardrobe', 'window']), createdAt: now },
      { code: generateCode('prm'), propertyId: ikoyiId, roomType: 'LIVING_ROOM', features: JSON.stringify(['balcony', 'tv-console']), createdAt: now },
      { code: generateCode('prm'), propertyId: lekkiId, roomType: 'BEDROOM', features: JSON.stringify(['ensuite', 'wardrobe']), createdAt: now },
      { code: generateCode('prm'), propertyId: lekkiId, roomType: 'LIVING_ROOM', features: JSON.stringify(['double-volume', 'spotlights']), createdAt: now },
      { code: generateCode('prm'), propertyId: wuseId, roomType: 'BEDROOM', features: JSON.stringify(['furnished', 'window']), createdAt: now },
      { code: generateCode('prm'), propertyId: wuseId, roomType: 'BATHROOM', features: JSON.stringify(['water-heater']), createdAt: now },
      { code: generateCode('prm'), propertyId: wuseId, roomType: 'KITCHEN', features: JSON.stringify(['cabinets']), createdAt: now },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', {
      email: ['landlord@househunt.dev', 'tenant@househunt.dev'],
    });
  },
};
