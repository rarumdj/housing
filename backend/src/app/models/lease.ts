import { DataTypes } from 'sequelize';
import sequelize from './db';

export const Lease = sequelize.define('Lease', {
  id: {
    type: DataTypes.STRING(64),
    primaryKey: true,
    allowNull: false,
  },
  bookingId: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true,
  },
  propertyId: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  landlordId: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  tenantId: {
    type: DataTypes.STRING(64),
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
}, {
  tableName: 'leases',
  timestamps: true,
});
