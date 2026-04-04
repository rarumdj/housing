import { DataTypes } from 'sequelize';
import sequelize from './db';

export const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.STRING(64),
    primaryKey: true,
    allowNull: false,
  },
  bookingId: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING(8),
    allowNull: false,
    defaultValue: 'NGN',
  },
  type: {
    type: DataTypes.STRING(32),
    allowNull: false,
  },
  paystackRef: {
    type: DataTypes.STRING(128),
    unique: true,
  },
  status: {
    type: DataTypes.STRING(32),
    allowNull: false,
    defaultValue: 'PENDING',
  },
  metadata: DataTypes.JSON,
  paidAt: DataTypes.DATE,
  releasedAt: DataTypes.DATE,
}, {
  tableName: 'payments',
  timestamps: true,
});
