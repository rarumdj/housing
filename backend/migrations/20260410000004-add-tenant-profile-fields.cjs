'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tenants', 'maritalStatus', {
      type: Sequelize.STRING(32),
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'dateOfBirth', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'nationality', {
      type: Sequelize.STRING(64),
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'nationalIdType', {
      type: Sequelize.STRING(32),
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'nationalIdNumber', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'businessName', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'businessType', {
      type: Sequelize.STRING(64),
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'jobTitle', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'annualIncome', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'bankName', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'accountNumber', {
      type: Sequelize.STRING(20),
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'nextOfKinName', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'nextOfKinPhone', {
      type: Sequelize.STRING(32),
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'nextOfKinRelationship', {
      type: Sequelize.STRING(32),
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'nextOfKinAddress', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'currentAddress', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'reasonForMoving', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'numberOfOccupants', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'hasPets', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });
    await queryInterface.addColumn('tenants', 'emergencyContactName', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'emergencyContactPhone', {
      type: Sequelize.STRING(32),
      allowNull: true,
    });

    // Add agreementUrl + agreementGeneratedAt to leases table
    await queryInterface.addColumn('leases', 'agreementUrl', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('leases', 'agreementGeneratedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    const tenantCols = [
      'maritalStatus', 'dateOfBirth', 'nationality', 'nationalIdType', 'nationalIdNumber',
      'businessName', 'businessType', 'jobTitle', 'annualIncome',
      'bankName', 'accountNumber',
      'nextOfKinName', 'nextOfKinPhone', 'nextOfKinRelationship', 'nextOfKinAddress',
      'currentAddress', 'reasonForMoving', 'numberOfOccupants', 'hasPets',
      'emergencyContactName', 'emergencyContactPhone',
    ];
    for (const col of tenantCols) {
      await queryInterface.removeColumn('tenants', col);
    }
    await queryInterface.removeColumn('leases', 'agreementUrl');
    await queryInterface.removeColumn('leases', 'agreementGeneratedAt');
  },
};
