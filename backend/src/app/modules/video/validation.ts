import Joi from 'joi';

export const upload = Joi.object({
  nonce: Joi.string().required(),
  signature: Joi.string().required(),
  gpsLat: Joi.number().required(),
  gpsLng: Joi.number().required(),
  recordedAt: Joi.date().iso().required(),
});
