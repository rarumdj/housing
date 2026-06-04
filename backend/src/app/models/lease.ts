import { DataTypes } from 'sequelize';
import sequelize from './db';
import { generateCode } from '../utils/utils';

export const Lease = sequelize.define('Lease', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    defaultValue: () => generateCode('lse'),
  },
  bookingId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    unique: true,
  },
  propertyId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  landlordId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  tenantId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  terms: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  pdfUrl: DataTypes.TEXT,
  pdfHash: DataTypes.STRING,
  signedLandlordAt: DataTypes.DATE,
  signedTenantAt: DataTypes.DATE,
  status: {
    type: DataTypes.STRING(32),
    allowNull: false,
    defaultValue: 'DRAFT',
  },
  rentStartDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  rentEndDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  monthlyRent: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  annualRent: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  cautionDeposit: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  agreementUrl: DataTypes.TEXT,
  agreementGeneratedAt: DataTypes.DATE,
}, {
  tableName: 'leases',
  timestamps: true,
});
