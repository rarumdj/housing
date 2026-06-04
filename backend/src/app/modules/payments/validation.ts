import Joi from 'joi';

export const webhook = Joi.object({
  event: Joi.string().allow('', null),
  data: Joi.object({
    reference: Joi.string().allow('', null),
    tx_ref: Joi.string().allow('', null),
    status: Joi.string().allow('', null),
  }).unknown(true).optional(),
}).unknown(true);
