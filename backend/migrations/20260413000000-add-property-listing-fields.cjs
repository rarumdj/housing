'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('properties', 'legalFee', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('properties', 'serviceCharge', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('properties', 'tenantPaysAgencyFee', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('properties', 'willingToWorkWithAgents', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('properties', 'amenities', {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: [],
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('properties', 'legalFee');
    await queryInterface.removeColumn('properties', 'serviceCharge');
    await queryInterface.removeColumn('properties', 'tenantPaysAgencyFee');
    await queryInterface.removeColumn('properties', 'willingToWorkWithAgents');
    await queryInterface.removeColumn('properties', 'amenities');
  },
};
