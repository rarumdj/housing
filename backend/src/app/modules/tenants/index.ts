import { Router } from 'express';
import * as TenantController from './controller';
import * as Validators from './validation';
import handler from '../../utils/handler';
import { authenticate, requireRole } from '../../utils/auth';
import { validate } from '../../utils/validator';

const router = Router();

router.get('/me', authenticate, requireRole('TENANT'), handler(TenantController.me));
router.get('/me/profile', authenticate, requireRole('TENANT'), handler(TenantController.profile));
router.put('/me/profile', authenticate, requireRole('TENANT'), validate(Validators.updateProfile), handler(TenantController.updateProfile));
router.post('/me/onboarding', authenticate, requireRole('TENANT'), validate(Validators.updateProfile), handler(TenantController.completeOnboarding));
router.get('/me/bookings', authenticate, requireRole('TENANT'), handler(TenantController.myBookings));
router.get('/me/leases', authenticate, requireRole('TENANT'), handler(TenantController.myLeases));

export default router;
