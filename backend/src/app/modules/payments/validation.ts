import Joi from 'joi';

export const webhook = Joi.object({
  event: Joi.string().required(),
  data: Joi.object({
    reference: Joi.string().allow('', null),
  }).optional(),
});
