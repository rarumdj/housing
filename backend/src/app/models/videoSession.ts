import { DataTypes } from 'sequelize';
import sequelize from './db';
import { generateCode } from '../utils/utils';

export const VideoSession = sequelize.define('VideoSession', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    defaultValue: () => generateCode('vds'),
  },
  propertyId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  nonce: {
    type: DataTypes.STRING(128),
    allowNull: false,
    unique: true,
  },
  expectedLat: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  expectedLng: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  usedAt: DataTypes.DATE,
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
  tableName: 'video_sessions',
  updatedAt: false,
});
