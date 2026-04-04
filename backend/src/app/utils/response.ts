import { Response } from 'express';

export function sendSuccess(
  res: Response,
  options: {
    statusCode?: number;
    message?: string;
    data?: unknown;
    meta?: unknown;
    extra?: Record<string, unknown>;
  } = {},
) {
  const { statusCode = 200, message, data, meta, extra = {} } = options;

  return res.status(statusCode).json({
    success: true,
    error: false,
    ...(message ? { message } : {}),
    ...(data !== undefined ? { data } : {}),
    ...(meta !== undefined ? { meta } : {}),
    ...extra,
  });
}
