import { DataTypes } from 'sequelize';
import sequelize from './db';

export const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.STRING(64),
    primaryKey: true,
    allowNull: false,
  },
  userId: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  metadata: DataTypes.JSON,
  readAt: DataTypes.DATE,
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'notifications',
  updatedAt: false,
});
