import Joi from 'joi';

export const updateProfile = Joi.object({
  employmentStatus: Joi.string().valid('EMPLOYED', 'SELF_EMPLOYED', 'UNEMPLOYED', 'STUDENT', 'RETIRED').allow(null),
  employerName: Joi.string().allow('', null),
  monthlyIncome: Joi.number().min(0).allow(null),
  maritalStatus: Joi.string().valid('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED').allow(null),
  dateOfBirth: Joi.date().iso().allow(null),
  nationality: Joi.string().allow('', null),
  nationalIdType: Joi.string().valid('NIN', 'PASSPORT', 'DRIVERS_LICENSE', 'VOTERS_CARD').allow(null),
  nationalIdNumber: Joi.string().allow('', null),
  businessName: Joi.string().allow('', null),
  businessType: Joi.string().allow('', null),
  jobTitle: Joi.string().allow('', null),
  annualIncome: Joi.number().min(0).allow(null),
  bankName: Joi.string().allow('', null),
  accountNumber: Joi.string().max(20).allow('', null),
  nextOfKinName: Joi.string().allow('', null),
  nextOfKinPhone: Joi.string().allow('', null),
  nextOfKinRelationship: Joi.string().allow('', null),
  nextOfKinAddress: Joi.string().allow('', null),
  currentAddress: Joi.string().allow('', null),
  reasonForMoving: Joi.string().allow('', null),
  numberOfOccupants: Joi.number().integer().min(1).allow(null),
  hasPets: Joi.boolean().allow(null),
  emergencyContactName: Joi.string().allow('', null),
  emergencyContactPhone: Joi.string().allow('', null),
});

export const noop = Joi.object({});
