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
  maritalStatus: DataTypes.STRING(32),
  dateOfBirth: DataTypes.DATEONLY,
  nationality: DataTypes.STRING(64),
  nationalIdType: DataTypes.STRING(32),
  nationalIdNumber: DataTypes.STRING,
  businessName: DataTypes.STRING,
  businessType: DataTypes.STRING(64),
  jobTitle: DataTypes.STRING,
  annualIncome: DataTypes.FLOAT,
  bankName: DataTypes.STRING,
  accountNumber: DataTypes.STRING(20),
  nextOfKinName: DataTypes.STRING,
  nextOfKinPhone: DataTypes.STRING(32),
  nextOfKinRelationship: DataTypes.STRING(32),
  nextOfKinAddress: DataTypes.TEXT,
  currentAddress: DataTypes.TEXT,
  reasonForMoving: DataTypes.TEXT,
  numberOfOccupants: DataTypes.INTEGER,
  hasPets: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  emergencyContactName: DataTypes.STRING,
  emergencyContactPhone: DataTypes.STRING(32),
}, {
  tableName: 'tenants',
  timestamps: true,
});
