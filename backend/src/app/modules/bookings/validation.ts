import Joi from 'joi';

export const apply = Joi.object({
  propertyId: Joi.string().required(),
  message: Joi.string().allow('', null),
});

export const decline = Joi.object({
  reason: Joi.string().allow('', null),
});
