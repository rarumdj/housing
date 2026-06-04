import { Response } from 'express';

// Scalar foreign-key columns are internal. API consumers reference relations via
// the nested related object's `code` instead (e.g. booking.property.code).
const STRIPPED_RELATION_KEYS = new Set([
  'id',
  'userId',
  'landlordId',
  'tenantId',
  'propertyId',
  'bookingId',
  'leaseId',
  'senderId',
  'recipientId',
]);

/**
 * Convert Sequelize instances to plain objects and recursively remove scalar
 * foreign-key fields from the payload.
 */
export const serialize = (value: unknown): unknown => {
  if (value === null || typeof value !== 'object') return value;
  if (value instanceof Date) return value;

  if (Array.isArray(value)) return value.map(serialize);

  const maybeInstance = value as { toJSON?: () => unknown };
  if (typeof maybeInstance.toJSON === 'function') {
    return serialize(maybeInstance.toJSON());
  }

  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (STRIPPED_RELATION_KEYS.has(key)) continue;
    out[key] = serialize(val);
  }
  return out;
};

export const sendSuccess = (res: Response, options: {
    statusCode?: number;
    message?: string;
    data?: unknown;
    meta?: unknown;
    extra?: Record<string, unknown>;
  } = {}) => {
  const { statusCode = 200, message, data, meta, extra = {} } = options;

  return res.status(statusCode).json({
    success: true,
    error: false,
    ...(message ? { message } : {}),
    ...(data !== undefined ? { data: serialize(data) } : {}),
    ...(meta !== undefined ? { meta } : {}),
    ...extra,
  });
};
