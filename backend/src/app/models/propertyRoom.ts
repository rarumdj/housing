import { DataTypes } from 'sequelize';
import sequelize from './db';

export const PropertyRoom = sequelize.define('PropertyRoom', {
  id: {
    type: DataTypes.STRING(64),
    primaryKey: true,
    allowNull: false,
  },
  propertyId: {
    type: DataTypes.STRING(64),
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
