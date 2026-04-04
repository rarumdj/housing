import { Router } from 'express';
import * as BookingController from './controller';
import * as Validators from './validation';
import handler from '../../utils/handler';
import { authenticate, requireRole } from '../../utils/auth';
import { validate } from '../../utils/validator';

const router = Router();

router.post('/', authenticate, requireRole('TENANT'), validate(Validators.apply), handler(BookingController.apply));
router.put('/:id/accept', authenticate, requireRole('LANDLORD'), handler(BookingController.accept));
router.put('/:id/decline', authenticate, requireRole('LANDLORD'), validate(Validators.decline), handler(BookingController.decline));
router.post('/:id/pay', authenticate, requireRole('TENANT'), handler(BookingController.initiatePayment));
router.put('/:id/confirm-move-in', authenticate, requireRole('TENANT'), handler(BookingController.confirmMoveIn));

export default router;
