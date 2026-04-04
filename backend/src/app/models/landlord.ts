import { DataTypes } from 'sequelize';
import sequelize from './db';

export const Landlord = sequelize.define('Landlord', {
  id: {
    type: DataTypes.STRING(64),
    primaryKey: true,
    allowNull: false,
  },
  userId: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true,
  },
  businessName: DataTypes.STRING,
  cacNumber: DataTypes.STRING,
  verificationStatus: {
    type: DataTypes.STRING(32),
    allowNull: false,
    defaultValue: 'PENDING',
  },
  verificationDocs: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  bankAccount: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  rating: DataTypes.FLOAT,
  totalProperties: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  isOnboarded: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: 'landlords',
  timestamps: true,
});
