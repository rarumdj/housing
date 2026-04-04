import { Router } from 'express';
import * as RenewalController from './controller';
import * as Validators from './validation';
import handler from '../../utils/handler';
import { authenticate, requireRole } from '../../utils/auth';
import { validate } from '../../utils/validator';

const router = Router();

router.post('/', authenticate, requireRole('LANDLORD'), validate(Validators.create), handler(RenewalController.create));
router.put('/:id/accept', authenticate, requireRole('TENANT'), handler(RenewalController.accept));
router.put('/:id/appeal', authenticate, requireRole('TENANT'), validate(Validators.appeal), handler(RenewalController.appeal));

export default router;
