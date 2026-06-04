'use strict';

const bcrypt = require('bcryptjs');
const { generateCode } = require('../config/migration-helpers.cjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const passwordHash = bcrypt.hashSync('Password123!', 12);

    await queryInterface.bulkInsert('users', [
      {
        code: generateCode('usr'),
        email: 'admin@househunt.dev',
        phone: '+2348000000099',
        passwordHash,
        role: 'ADMIN',
        firstName: 'Super',
        lastName: 'Admin',
        isPhoneVerified: true,
        isEmailVerified: true,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: ['admin@househunt.dev'] });
  },
};
