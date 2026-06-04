'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const pk = () => ({ type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true });
    const code = () => ({ type: Sequelize.STRING, allowNull: false, unique: true });
    const fk = (model, opts = {}) => ({
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: opts.allowNull ?? false,
      ...(opts.unique ? { unique: true } : {}),
      references: { model, key: 'id' },
      ...(opts.onDelete ? { onDelete: opts.onDelete } : {}),
    });
    const ts = () => ({
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('users', {
      id: pk(),
      code: code(),
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      phone: { type: Sequelize.STRING, allowNull: false, unique: true },
      passwordHash: { type: Sequelize.STRING, allowNull: false },
      role: { type: Sequelize.STRING(32), allowNull: false },
      firstName: { type: Sequelize.STRING, allowNull: false },
      lastName: { type: Sequelize.STRING, allowNull: false },
      avatarUrl: { type: Sequelize.TEXT, allowNull: true },
      ninHash: { type: Sequelize.STRING, allowNull: true },
      bvnHash: { type: Sequelize.STRING, allowNull: true },
      isPhoneVerified: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      isEmailVerified: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      lastLoginAt: { type: Sequelize.DATE, allowNull: true },
      ...ts(),
    });

    await queryInterface.createTable('refresh_tokens', {
      id: pk(),
      code: code(),
      userId: fk('users', { onDelete: 'CASCADE' }),
      token: { type: Sequelize.STRING(128), allowNull: false, unique: true },
      expiresAt: { type: Sequelize.DATE, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('landlords', {
      id: pk(),
      code: code(),
      userId: fk('users', { unique: true, onDelete: 'CASCADE' }),
      businessName: { type: Sequelize.STRING, allowNull: true },
      cacNumber: { type: Sequelize.STRING, allowNull: true },
      verificationStatus: { type: Sequelize.STRING(32), allowNull: false, defaultValue: 'PENDING' },
      verificationDocs: { type: Sequelize.JSON, allowNull: true },
      bankAccount: { type: Sequelize.JSON, allowNull: true },
      rating: { type: Sequelize.FLOAT, allowNull: true },
      totalProperties: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      isOnboarded: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      ...ts(),
    });

    await queryInterface.createTable('tenants', {
      id: pk(),
      code: code(),
      userId: fk('users', { unique: true, onDelete: 'CASCADE' }),
      employmentStatus: { type: Sequelize.STRING(32), allowNull: true },
      employerName: { type: Sequelize.STRING, allowNull: true },
      monthlyIncome: { type: Sequelize.FLOAT, allowNull: true },
      screeningScore: { type: Sequelize.INTEGER, allowNull: true },
      screeningBand: { type: Sequelize.STRING(32), allowNull: true },
      kycStatus: { type: Sequelize.STRING(32), allowNull: false, defaultValue: 'PENDING' },
      kycDocs: { type: Sequelize.JSON, allowNull: true },
      bankConnected: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      monoAccountId: { type: Sequelize.STRING, allowNull: true },
      isOnboarded: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      ...ts(),
    });

    await queryInterface.createTable('properties', {
      id: pk(),
      code: code(),
      landlordId: fk('landlords'),
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT('long'), allowNull: false },
      type: { type: Sequelize.STRING(32), allowNull: false },
      address: { type: Sequelize.STRING, allowNull: false },
      lga: { type: Sequelize.STRING, allowNull: false },
      state: { type: Sequelize.STRING, allowNull: false },
      lat: { type: Sequelize.FLOAT, allowNull: false },
      lng: { type: Sequelize.FLOAT, allowNull: false },
      priceMonthly: { type: Sequelize.FLOAT, allowNull: false },
      priceAnnually: { type: Sequelize.FLOAT, allowNull: false },
      cautionDeposit: { type: Sequelize.FLOAT, allowNull: false },
      availableFrom: { type: Sequelize.DATE, allowNull: false },
      status: { type: Sequelize.STRING(32), allowNull: false, defaultValue: 'DRAFT' },
      verificationStatus: { type: Sequelize.STRING(32), allowNull: false, defaultValue: 'PENDING' },
      isFurnished: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      isSemiFurnished: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      hasGenerator: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      hasParking: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      hasSecurity: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      hasElevator: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      hasPool: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      totalRooms: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      floorLevel: { type: Sequelize.INTEGER, allowNull: true },
      buildingFloors: { type: Sequelize.INTEGER, allowNull: true },
      viewCount: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      ...ts(),
    });

    await queryInterface.createTable('property_media', {
      id: pk(),
      code: code(),
      propertyId: fk('properties', { onDelete: 'CASCADE' }),
      type: { type: Sequelize.STRING(32), allowNull: false },
      url: { type: Sequelize.TEXT, allowNull: false },
      thumbnailUrl: { type: Sequelize.TEXT, allowNull: true },
      gpsLat: { type: Sequelize.FLOAT, allowNull: true },
      gpsLng: { type: Sequelize.FLOAT, allowNull: true },
      nonceVerified: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      isCover: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      orderIndex: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      recordedAt: { type: Sequelize.DATE, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('property_rooms', {
      id: pk(),
      code: code(),
      propertyId: fk('properties', { onDelete: 'CASCADE' }),
      roomType: { type: Sequelize.STRING(32), allowNull: false },
      features: { type: Sequelize.JSON, allowNull: true },
      areaSqm: { type: Sequelize.FLOAT, allowNull: true },
      floorLevel: { type: Sequelize.INTEGER, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('bookings', {
      id: pk(),
      code: code(),
      propertyId: fk('properties'),
      tenantId: fk('tenants'),
      status: { type: Sequelize.STRING(32), allowNull: false, defaultValue: 'APPLIED' },
      rentStart: { type: Sequelize.DATE, allowNull: true },
      rentEnd: { type: Sequelize.DATE, allowNull: true },
      message: { type: Sequelize.TEXT, allowNull: true },
      declineReason: { type: Sequelize.TEXT, allowNull: true },
      appliedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      acceptedAt: { type: Sequelize.DATE, allowNull: true },
      paidAt: { type: Sequelize.DATE, allowNull: true },
      moveInConfirmedAt: { type: Sequelize.DATE, allowNull: true },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('leases', {
      id: pk(),
      code: code(),
      bookingId: fk('bookings', { unique: true }),
      propertyId: fk('properties'),
      landlordId: fk('landlords'),
      tenantId: fk('tenants'),
      terms: { type: Sequelize.JSON, allowNull: false },
      pdfUrl: { type: Sequelize.TEXT, allowNull: true },
      pdfHash: { type: Sequelize.STRING, allowNull: true },
      signedLandlordAt: { type: Sequelize.DATE, allowNull: true },
      signedTenantAt: { type: Sequelize.DATE, allowNull: true },
      status: { type: Sequelize.STRING(32), allowNull: false, defaultValue: 'DRAFT' },
      rentStartDate: { type: Sequelize.DATE, allowNull: false },
      rentEndDate: { type: Sequelize.DATE, allowNull: false },
      monthlyRent: { type: Sequelize.FLOAT, allowNull: false },
      annualRent: { type: Sequelize.FLOAT, allowNull: false },
      cautionDeposit: { type: Sequelize.FLOAT, allowNull: false },
      ...ts(),
    });

    await queryInterface.createTable('payments', {
      id: pk(),
      code: code(),
      bookingId: fk('bookings'),
      amount: { type: Sequelize.FLOAT, allowNull: false },
      currency: { type: Sequelize.STRING(8), allowNull: false, defaultValue: 'NGN' },
      type: { type: Sequelize.STRING(32), allowNull: false },
      paystackRef: { type: Sequelize.STRING(128), allowNull: true, unique: true },
      status: { type: Sequelize.STRING(32), allowNull: false, defaultValue: 'PENDING' },
      metadata: { type: Sequelize.JSON, allowNull: true },
      paidAt: { type: Sequelize.DATE, allowNull: true },
      releasedAt: { type: Sequelize.DATE, allowNull: true },
      ...ts(),
    });

    await queryInterface.createTable('renewals', {
      id: pk(),
      code: code(),
      leaseId: fk('leases'),
      proposedPrice: { type: Sequelize.FLOAT, allowNull: false },
      currentPrice: { type: Sequelize.FLOAT, allowNull: false },
      status: { type: Sequelize.STRING(32), allowNull: false, defaultValue: 'PROPOSED' },
      appealReason: { type: Sequelize.TEXT, allowNull: true },
      mediatorNote: { type: Sequelize.TEXT, allowNull: true },
      gracePeriodEnd: { type: Sequelize.DATE, allowNull: true },
      proposedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      respondedAt: { type: Sequelize.DATE, allowNull: true },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('notifications', {
      id: pk(),
      code: code(),
      userId: fk('users', { onDelete: 'CASCADE' }),
      type: { type: Sequelize.STRING(64), allowNull: false },
      title: { type: Sequelize.STRING, allowNull: false },
      body: { type: Sequelize.TEXT, allowNull: false },
      metadata: { type: Sequelize.JSON, allowNull: true },
      readAt: { type: Sequelize.DATE, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('video_sessions', {
      id: pk(),
      code: code(),
      propertyId: fk('properties'),
      nonce: { type: Sequelize.STRING(128), allowNull: false, unique: true },
      expectedLat: { type: Sequelize.FLOAT, allowNull: false },
      expectedLng: { type: Sequelize.FLOAT, allowNull: false },
      usedAt: { type: Sequelize.DATE, allowNull: true },
      expiresAt: { type: Sequelize.DATE, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['phone']);
    await queryInterface.addIndex('landlords', ['verificationStatus']);
    await queryInterface.addIndex('tenants', ['screeningBand']);
    await queryInterface.addIndex('properties', ['state', 'lga']);
    await queryInterface.addIndex('properties', ['status', 'verificationStatus']);
    await queryInterface.addIndex('properties', ['priceAnnually']);
    await queryInterface.addIndex('properties', ['lat', 'lng']);
    await queryInterface.addIndex('bookings', ['status']);
    await queryInterface.addIndex('leases', ['status']);
    await queryInterface.addIndex('payments', ['status']);
    await queryInterface.addIndex('renewals', ['status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('video_sessions');
    await queryInterface.dropTable('notifications');
    await queryInterface.dropTable('renewals');
    await queryInterface.dropTable('payments');
    await queryInterface.dropTable('leases');
    await queryInterface.dropTable('bookings');
    await queryInterface.dropTable('property_rooms');
    await queryInterface.dropTable('property_media');
    await queryInterface.dropTable('properties');
    await queryInterface.dropTable('tenants');
    await queryInterface.dropTable('landlords');
    await queryInterface.dropTable('refresh_tokens');
    await queryInterface.dropTable('users');
  },
};
