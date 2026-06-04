import { DataTypes } from 'sequelize';
import sequelize from './db';
import { generateCode } from '../utils/utils';

export const Landlord = sequelize.define('Landlord', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    defaultValue: () => generateCode('lld'),
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
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
  verificationNote: DataTypes.TEXT,
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
  onboardingStatus: {
    type: DataTypes.STRING(32),
    allowNull: false,
    defaultValue: 'PENDING',
  },
  onboardingStep: DataTypes.STRING(64),
  onboardingData: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  dateOfBirth: DataTypes.DATEONLY,
  idType: DataTypes.STRING(32),
  idNumber: DataTypes.STRING,
  residentialAddress: DataTypes.TEXT,
  city: DataTypes.STRING,
  state: DataTypes.STRING,
  country: DataTypes.STRING,
  ownershipType: DataTypes.STRING(32),
  operationType: DataTypes.STRING(48),
  tin: DataTypes.STRING(64),
  contactMethod: DataTypes.STRING(16),
  payoutProvider: DataTypes.STRING(32),
  payoutPreference: DataTypes.STRING(16),
  payoutSubaccountCode: DataTypes.STRING(128),
}, {
  tableName: 'landlords',
  timestamps: true,
});
