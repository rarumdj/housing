import Joi from 'joi';

export const create = Joi.object({
  leaseId: Joi.string().required(),
  proposedPrice: Joi.number().min(0).required(),
});

export const appeal = Joi.object({
  reason: Joi.string().allow('', null),
});
