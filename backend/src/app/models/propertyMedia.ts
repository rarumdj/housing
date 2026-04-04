import { DataTypes } from 'sequelize';
import sequelize from './db';

export const PropertyMedia = sequelize.define('PropertyMedia', {
  id: {
    type: DataTypes.STRING(64),
    primaryKey: true,
    allowNull: false,
  },
  propertyId: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING(32),
    allowNull: false,
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  thumbnailUrl: DataTypes.TEXT,
  gpsLat: DataTypes.FLOAT,
  gpsLng: DataTypes.FLOAT,
  nonceVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  isCover: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  orderIndex: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  recordedAt: DataTypes.DATE,
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'property_media',
  updatedAt: false,
});
