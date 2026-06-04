import Joi from 'joi';
import { ROLES } from '../../utils/constants';

export const create = Joi.object({
  email: Joi.string().email().required(),
  phone: Joi.string().min(7).max(20).required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().trim().required(),
  lastName: Joi.string().trim().required(),
  role: Joi.string().valid(...ROLES).required(),
});

export const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const refreshToken = Joi.object({
  refreshToken: Joi.string().required(),
});

export const logout = Joi.object({
  refreshToken: Joi.string().required(),
});

export const emailIntent = Joi.object({
  email: Joi.string().email().required(),
});

export const confirmEmail = Joi.object({
  intentCode: Joi.string().required(),
  otp: Joi.string().min(4).max(8).required(),
});
