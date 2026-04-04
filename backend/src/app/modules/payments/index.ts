import { Router } from 'express';
import * as PaymentController from './controller';
import * as Validators from './validation';
import handler from '../../utils/handler';
import { authenticate } from '../../utils/auth';
import { validate } from '../../utils/validator';

const router = Router();

router.post('/webhook', validate(Validators.webhook), handler(PaymentController.webhook));
router.get('/history', authenticate, handler(PaymentController.history));

export default router;
