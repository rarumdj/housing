import Joi from 'joi';
import { VERIFICATION_STATUSES } from '../../utils/constants';

export const listUsers = Joi.object({
  role: Joi.string().valid('LANDLORD', 'TENANT', 'ADMIN'),
  search: Joi.string().allow(''),
  isActive: Joi.boolean(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

export const verifyUser = Joi.object({
  status: Joi.string().valid(...VERIFICATION_STATUSES).required(),
  reason: Joi.string().allow('', null),
});

export const listProperties = Joi.object({
  status: Joi.string(),
  verificationStatus: Joi.string(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

export const verifyProperty = Joi.object({
  verificationStatus: Joi.string().valid('VERIFIED', 'REJECTED').required(),
  reason: Joi.string().allow('', null),
});

export const createFee = Joi.object({
  name: Joi.string().trim().required(),
  slug: Joi.string().trim().lowercase().pattern(/^[a-z0-9_]+$/).required(),
  type: Joi.string().valid('PERCENTAGE', 'FLAT').required(),
  value: Joi.number().min(0).required(),
  description: Joi.string().allow('', null),
  isActive: Joi.boolean().default(true),
});

export const updateFee = Joi.object({
  name: Joi.string().trim(),
  type: Joi.string().valid('PERCENTAGE', 'FLAT'),
  value: Joi.number().min(0),
  description: Joi.string().allow('', null),
  isActive: Joi.boolean(),
}).min(1);
