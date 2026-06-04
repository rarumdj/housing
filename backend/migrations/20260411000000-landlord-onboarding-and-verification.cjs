'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ── Email verification + phone OTP on users ──
    await queryInterface.addColumn('users', 'emailVerificationToken', {
      type: Sequelize.STRING(128),
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'emailVerificationExpires', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'phoneOtpCode', {
      type: Sequelize.STRING(16),
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'phoneOtpExpires', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // New landlords should start inactive (pending email verification). Existing
    // verified accounts keep isEmailVerified as-is; default for new rows handled in app.

    // ── Landlord onboarding fields ──
    await queryInterface.addColumn('landlords', 'onboardingStatus', {
      type: Sequelize.STRING(32),
      allowNull: false,
      defaultValue: 'PENDING',
    });
    await queryInterface.addColumn('landlords', 'onboardingStep', {
      type: Sequelize.STRING(64),
      allowNull: true,
    });
    await queryInterface.addColumn('landlords', 'onboardingData', {
      type: Sequelize.JSON,
      allowNull: true,
    });
    await queryInterface.addColumn('landlords', 'dateOfBirth', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
    await queryInterface.addColumn('landlords', 'idType', {
      type: Sequelize.STRING(32),
      allowNull: true,
    });
    await queryInterface.addColumn('landlords', 'idNumber', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('landlords', 'residentialAddress', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('landlords', 'city', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('landlords', 'state', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('landlords', 'country', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('landlords', 'ownershipType', {
      type: Sequelize.STRING(32),
      allowNull: true,
    });
    await queryInterface.addColumn('landlords', 'operationType', {
      type: Sequelize.STRING(48),
      allowNull: true,
    });
    await queryInterface.addColumn('landlords', 'tin', {
      type: Sequelize.STRING(64),
      allowNull: true,
    });
    await queryInterface.addColumn('landlords', 'contactMethod', {
      type: Sequelize.STRING(16),
      allowNull: true,
    });
    await queryInterface.addColumn('landlords', 'payoutProvider', {
      type: Sequelize.STRING(32),
      allowNull: true,
    });
    await queryInterface.addColumn('landlords', 'payoutPreference', {
      type: Sequelize.STRING(16),
      allowNull: true,
    });
    await queryInterface.addColumn('landlords', 'payoutSubaccountCode', {
      type: Sequelize.STRING(128),
      allowNull: true,
    });

    // ── Generalise payments beyond Paystack ──
    await queryInterface.addColumn('payments', 'provider', {
      type: Sequelize.STRING(32),
      allowNull: false,
      defaultValue: 'paystack',
    });
    await queryInterface.addColumn('payments', 'providerRef', {
      type: Sequelize.STRING(128),
      allowNull: true,
    });

    // Backfill providerRef from the existing paystackRef column.
    await queryInterface.sequelize.query(
      'UPDATE payments SET providerRef = paystackRef WHERE providerRef IS NULL',
    );

    // Existing landlords with verified KYC are considered onboarded already.
    await queryInterface.sequelize.query(
      "UPDATE landlords SET onboardingStatus = 'COMPLETED' WHERE isOnboarded = true",
    );
  },

  async down(queryInterface) {
    const userCols = [
      'emailVerificationToken',
      'emailVerificationExpires',
      'phoneOtpCode',
      'phoneOtpExpires',
    ];
    for (const col of userCols) {
      await queryInterface.removeColumn('users', col);
    }

    const landlordCols = [
      'onboardingStatus',
      'onboardingStep',
      'onboardingData',
      'dateOfBirth',
      'idType',
      'idNumber',
      'residentialAddress',
      'city',
      'state',
      'country',
      'ownershipType',
      'operationType',
      'tin',
      'contactMethod',
      'payoutProvider',
      'payoutPreference',
      'payoutSubaccountCode',
    ];
    for (const col of landlordCols) {
      await queryInterface.removeColumn('landlords', col);
    }

    await queryInterface.removeColumn('payments', 'provider');
    await queryInterface.removeColumn('payments', 'providerRef');
  },
};
