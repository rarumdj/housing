import { DataTypes } from 'sequelize';
import sequelize from './db';
import { generateCode } from '../utils/utils';

export const PropertyRoom = sequelize.define('PropertyRoom', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    defaultValue: () => generateCode('prm'),
  },
  propertyId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  roomType: {
    type: DataTypes.STRING(32),
    allowNull: false,
  },
  features: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  areaSqm: DataTypes.FLOAT,
  floorLevel: DataTypes.INTEGER,
  notes: DataTypes.TEXT,
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'property_rooms',
  updatedAt: false,
});
