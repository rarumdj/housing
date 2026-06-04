import { Router } from 'express';
import * as AuthenticationController from './controller';
import * as Validators from './validation';
import handler from '../../utils/handler';
import { authenticate } from '../../utils/auth';
import { authLimiter } from '../../utils/rateLimit';
import { validate } from '../../utils/validator';

const router = Router();

router.post('/register', authLimiter, validate(Validators.create), handler(AuthenticationController.createUser));
router.post('/login', authLimiter, validate(Validators.login), handler(AuthenticationController.login));
router.post('/email-verification/intent', authLimiter, validate(Validators.emailIntent), handler(AuthenticationController.createEmailIntent));
router.post('/email-verification/confirm', authLimiter, validate(Validators.confirmEmail), handler(AuthenticationController.confirmEmail));
router.post('/refresh', validate(Validators.refreshToken), handler(AuthenticationController.refresh));
router.post('/logout', authenticate, validate(Validators.logout), handler(AuthenticationController.logout));
router.get('/me', authenticate, handler(AuthenticationController.me));

export default router;
