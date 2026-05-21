import Joi from 'joi';

export const send = Joi.object({
  recipientId: Joi.string().required(),
  propertyId: Joi.string().allow(null, ''),
  bookingId: Joi.string().allow(null, ''),
  body: Joi.string().trim().min(1).required(),
});

export const thread = Joi.object({
  propertyId: Joi.string().allow(null, ''),
});
