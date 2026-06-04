import { DataTypes } from 'sequelize';
import sequelize from './db';
import { generateCode } from '../utils/utils';

export const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    defaultValue: () => generateCode('bkg'),
  },
  propertyId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  tenantId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(32),
    allowNull: false,
    defaultValue: 'APPLIED',
  },
  rentStart: DataTypes.DATE,
  rentEnd: DataTypes.DATE,
  message: DataTypes.TEXT,
  declineReason: DataTypes.TEXT,
  appliedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  acceptedAt: DataTypes.DATE,
  paidAt: DataTypes.DATE,
  moveInConfirmedAt: DataTypes.DATE,
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'bookings',
  createdAt: false,
});
