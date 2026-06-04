import { DataTypes } from 'sequelize';
import sequelize from './db';
import { generateCode } from '../utils/utils';

export const PropertyMedia = sequelize.define('PropertyMedia', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    defaultValue: () => generateCode('pmd'),
  },
  propertyId: {
    type: DataTypes.INTEGER.UNSIGNED,
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
