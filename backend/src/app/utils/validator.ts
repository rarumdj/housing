import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';

type Source = 'body' | 'query' | 'params';

export function validate(schema: Joi.ObjectSchema, source: Source = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: true,
        message: error.details.map((detail) => detail.message).join(', '),
      });
    }

    req[source] = value;
    return next();
  };
}
