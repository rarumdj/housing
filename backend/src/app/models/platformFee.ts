import { DataTypes } from 'sequelize';
import sequelize from './db';

export const PlatformFee = sequelize.define('PlatformFee', {
  id: {
    type: DataTypes.STRING(64),
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true,
  },
  type: {
    type: DataTypes.STRING(16),
    allowNull: false,
  },
  value: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'platform_fees',
  timestamps: true,
});
