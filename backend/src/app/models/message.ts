import { DataTypes } from 'sequelize';
import sequelize from './db';

export const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.STRING(64),
    primaryKey: true,
    allowNull: false,
  },
  senderId: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  recipientId: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  propertyId: {
    type: DataTypes.STRING(64),
    allowNull: true,
  },
  bookingId: {
    type: DataTypes.STRING(64),
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
