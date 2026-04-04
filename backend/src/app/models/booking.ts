import { DataTypes } from 'sequelize';
import sequelize from './db';

export const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.STRING(64),
    primaryKey: true,
    allowNull: false,
  },
  propertyId: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  tenantId: {
    type: DataTypes.STRING(64),
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
