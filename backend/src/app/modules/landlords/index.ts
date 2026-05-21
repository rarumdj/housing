import { Router } from 'express';
import * as LandlordController from './controller';
import * as Validators from './validation';
import handler from '../../utils/handler';
import { authenticate, requireRole } from '../../utils/auth';
import { validate } from '../../utils/validator';

const router = Router();

router.get('/me', authenticate, requireRole('LANDLORD'), handler(LandlordController.me));
router.put('/me', authenticate, requireRole('LANDLORD'), validate(Validators.update), handler(LandlordController.updateMe));
router.get('/me/tenants', authenticate, requireRole('LANDLORD'), handler(LandlordController.tenants));
router.get('/me/bookings', authenticate, requireRole('LANDLORD'), handler(LandlordController.bookings));
router.post('/leases/:id/terminate', authenticate, requireRole('LANDLORD'), handler(LandlordController.terminateLease));

export default router;
