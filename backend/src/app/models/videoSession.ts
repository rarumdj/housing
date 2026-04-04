import { DataTypes } from 'sequelize';
import sequelize from './db';

export const VideoSession = sequelize.define('VideoSession', {
  id: {
    type: DataTypes.STRING(64),
    primaryKey: true,
    allowNull: false,
  },
  propertyId: {
    type: DataTypes.STRING(64),
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
