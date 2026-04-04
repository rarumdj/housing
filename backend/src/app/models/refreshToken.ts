import { DataTypes } from 'sequelize';
import sequelize from './db';

export const RefreshToken = sequelize.define('RefreshToken', {
  id: {
    type: DataTypes.STRING(64),
    primaryKey: true,
    allowNull: false,
  },
  userId: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  token: {
    type: DataTypes.STRING(128),
    allowNull: false,
    unique: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'refresh_tokens',
  updatedAt: false,
});
