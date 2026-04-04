import Joi from 'joi';

export const update = Joi.object({
  businessName: Joi.string().allow('', null),
  bankAccount: Joi.object().optional(),
});
