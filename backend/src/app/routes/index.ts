import { Application, NextFunction, Request, Response } from 'express';
import AdminRoutes from '../modules/admin';
import AuthRoutes from '../modules/auth';
import BookingRoutes from '../modules/bookings';
import LandlordRoutes from '../modules/landlords';
import MessageRoutes from '../modules/messages';
import PaymentRoutes from '../modules/payments';
import PropertyRoutes from '../modules/properties';
import RenewalRoutes from '../modules/renewals';
import TenantRoutes from '../modules/tenants';
import VideoRoutes from '../modules/video';
import AppError from '../utils/appError';

export default (app: Application) => {
  const apiVersion = '/api/v1';

  app.use(`${apiVersion}/admin`, AdminRoutes);
  app.use(`${apiVersion}/auth`, AuthRoutes);
  app.use(`${apiVersion}/properties`, PropertyRoutes);
  app.use(`${apiVersion}/bookings`, BookingRoutes);
  app.use(`${apiVersion}/payments`, PaymentRoutes);
  app.use(`${apiVersion}/renewals`, RenewalRoutes);
  app.use(`${apiVersion}/tenants`, TenantRoutes);
  app.use(`${apiVersion}/landlords`, LandlordRoutes);
  app.use(`${apiVersion}/messages`, MessageRoutes);
  app.use(`${apiVersion}/properties/:propertyId/video`, VideoRoutes);

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
      return res.status(err.httpStatusCode).json({
        success: false,
        error: true,
        message: err.message,
        code: err.code,
      });
    }

    console.error('[UnhandledError]', err);

    return res.status(500).json({
      success: false,
      error: true,
      message: 'Internal server error',
    });
  });

  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: true,
      message: `Requested route (${req.originalUrl}) not found`,
    });
  });
};
