'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const passwordHash = bcrypt.hashSync('Password123!', 12);

    await queryInterface.sequelize.query(
      `INSERT INTO users (id, email, phone, passwordHash, role, firstName, lastName, isPhoneVerified, isEmailVerified, isActive, createdAt, updatedAt)
       VALUES (:id, :email, :phone, :passwordHash, :role, :firstName, :lastName, :isPhoneVerified, :isEmailVerified, :isActive, :createdAt, :updatedAt)
       ON DUPLICATE KEY UPDATE
         passwordHash = VALUES(passwordHash),
         role = VALUES(role),
         isPhoneVerified = VALUES(isPhoneVerified),
         isEmailVerified = VALUES(isEmailVerified),
         isActive = VALUES(isActive),
         updatedAt = VALUES(updatedAt)`,
      {
        replacements: {
          id: 'demo-user-admin-1',
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
      },
    );
  },

  async down() {
    // Intentionally no-op: do not delete admin on undo; prior migration owns removal if needed.
  },
};
