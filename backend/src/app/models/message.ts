import { DataTypes } from 'sequelize';
import sequelize from './db';
import { generateCode } from '../utils/utils';

export const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    defaultValue: () => generateCode('msg'),
  },
  senderId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  recipientId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  propertyId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
  },
  bookingId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'messages',
  timestamps: true,
  updatedAt: false,
});
