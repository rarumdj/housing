import { DataTypes } from 'sequelize';
import sequelize from './db';
import { generateCode } from '../utils/utils';

export const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    defaultValue: () => generateCode('pay'),
  },
  bookingId: {
    type: DataTypes.INTEGER.UNSIGNED,
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
  provider: {
    type: DataTypes.STRING(32),
    allowNull: false,
    defaultValue: 'paystack',
  },
  providerRef: {
    type: DataTypes.STRING(128),
    allowNull: true,
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
