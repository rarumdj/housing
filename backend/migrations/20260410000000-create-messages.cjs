'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('messages', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      senderId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        field: 'senderId',
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      recipientId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        field: 'recipientId',
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      propertyId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        field: 'propertyId',
        references: { model: 'properties', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      bookingId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        field: 'bookingId',
        references: { model: 'bookings', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      readAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('messages', ['senderId']);
    await queryInterface.addIndex('messages', ['recipientId']);
    await queryInterface.addIndex('messages', ['propertyId']);
    await queryInterface.addIndex('messages', ['senderId', 'recipientId', 'propertyId']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('messages');
  },
};
