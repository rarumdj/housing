import { Router } from 'express';
import * as TenantController from './controller';
import handler from '../../utils/handler';
import { authenticate, requireRole } from '../../utils/auth';

const router = Router();

router.get('/me', authenticate, requireRole('TENANT'), handler(TenantController.me));
router.get('/me/bookings', authenticate, requireRole('TENANT'), handler(TenantController.myBookings));
router.get('/me/leases', authenticate, requireRole('TENANT'), handler(TenantController.myLeases));

export default router;
