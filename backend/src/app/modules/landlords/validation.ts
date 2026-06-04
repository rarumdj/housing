import Joi from 'joi';
import {
  CONTACT_METHODS,
  LANDLORD_ID_TYPES,
  LANDLORD_OPERATION_TYPES,
  LANDLORD_OWNERSHIP_TYPES,
  PAYMENT_PROVIDERS,
  PAYOUT_PREFERENCES,
} from '../../utils/constants';

export const update = Joi.object({
  businessName: Joi.string().allow('', null),
  bankAccount: Joi.object().optional(),
});

const bankAccount = Joi.object({
  accountName: Joi.string().allow('', null),
  accountNumber: Joi.string().allow('', null),
  bankCode: Joi.string().allow('', null),
  bankName: Joi.string().allow('', null),
}).optional();

export const onboarding = Joi.object({
  step: Joi.string().max(64).optional(),
  dateOfBirth: Joi.string().allow('', null),
  idType: Joi.string().valid(...LANDLORD_ID_TYPES).allow('', null),
  idNumber: Joi.string().allow('', null),
  residentialAddress: Joi.string().allow('', null),
  city: Joi.string().allow('', null),
  state: Joi.string().allow('', null),
  country: Joi.string().allow('', null),
  ownershipType: Joi.string().valid(...LANDLORD_OWNERSHIP_TYPES).allow('', null),
  operationType: Joi.string().valid(...LANDLORD_OPERATION_TYPES).allow('', null),
  businessName: Joi.string().allow('', null),
  cacNumber: Joi.string().allow('', null),
  tin: Joi.string().allow('', null),
  contactMethod: Joi.string().valid(...CONTACT_METHODS).allow('', null),
  payoutPreference: Joi.string().valid(...PAYOUT_PREFERENCES).allow('', null),
  bankAccount,
  data: Joi.object().optional(),
});

export const verifyOtp = Joi.object({
  code: Joi.string().min(4).max(8).required(),
});

export const deleteDocument = Joi.object({
  url: Joi.string().required(),
});

export const connectPayout = Joi.object({
  provider: Joi.string().valid(...PAYMENT_PROVIDERS).required(),
  bankCode: Joi.string().required(),
  accountNumber: Joi.string().required(),
  accountName: Joi.string().required(),
  bankName: Joi.string().allow('', null),
  payoutPreference: Joi.string().valid(...PAYOUT_PREFERENCES).optional(),
});
