import { DataTypes } from 'sequelize';
import sequelize from './db';

export const Tenant = sequelize.define('Tenant', {
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
  employmentStatus: DataTypes.STRING(32),
  employerName: DataTypes.STRING,
  monthlyIncome: DataTypes.FLOAT,
  screeningScore: DataTypes.INTEGER,
  screeningBand: DataTypes.STRING(32),
  kycStatus: {
    type: DataTypes.STRING(32),
    allowNull: false,
    defaultValue: 'PENDING',
  },
  kycDocs: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  bankConnected: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  monoAccountId: DataTypes.STRING,
  isOnboarded: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: 'tenants',
  timestamps: true,
});
