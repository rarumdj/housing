'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('landlords', 'verificationNote', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'kycNote', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('properties', 'verificationNote', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('landlords', 'verificationNote');
    await queryInterface.removeColumn('tenants', 'kycNote');
    await queryInterface.removeColumn('properties', 'verificationNote');
  },
};
