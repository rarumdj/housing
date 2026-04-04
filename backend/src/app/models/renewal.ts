import { DataTypes } from 'sequelize';
import sequelize from './db';

export const Renewal = sequelize.define('Renewal', {
  id: {
    type: DataTypes.STRING(64),
    primaryKey: true,
    allowNull: false,
  },
  leaseId: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  proposedPrice: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  currentPrice: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(32),
    allowNull: false,
    defaultValue: 'PROPOSED',
  },
  appealReason: DataTypes.TEXT,
  mediatorNote: DataTypes.TEXT,
  gracePeriodEnd: DataTypes.DATE,
  proposedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  respondedAt: DataTypes.DATE,
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'renewals',
  createdAt: false,
});
