'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('platform_fees', {
      id: {
        type: Sequelize.STRING(64),
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(64),
        allowNull: false,
        unique: true,
      },
      type: {
        type: Sequelize.STRING(16),
        allowNull: false,
      },
      value: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    const now = new Date();
    await queryInterface.bulkInsert('platform_fees', [
      {
        id: uuidv4(),
        name: 'Agency Fee',
        slug: 'agency_fee',
        type: 'PERCENTAGE',
        value: 10,
        isActive: true,
        description: 'Platform agency fee charged as a percentage of annual rent',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        name: 'Maintenance Fee',
        slug: 'maintenance_fee',
        type: 'FLAT',
        value: 25000,
        isActive: true,
        description: 'Fixed maintenance and service charge',
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('platform_fees');
  },
};
