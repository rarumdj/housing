import { Router } from 'express';
import multer from 'multer';
import * as TenantController from './controller';
import * as Validators from './validation';
import handler from '../../utils/handler';
import { authenticate, requireRole } from '../../utils/auth';
import { validate } from '../../utils/validator';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

const router = Router();

router.get('/me', authenticate, requireRole('TENANT'), handler(TenantController.me));
router.get('/me/profile', authenticate, requireRole('TENANT'), handler(TenantController.profile));
router.put('/me/profile', authenticate, requireRole('TENANT'), validate(Validators.updateProfile), handler(TenantController.updateProfile));
router.post('/me/onboarding', authenticate, requireRole('TENANT'), validate(Validators.updateProfile), handler(TenantController.completeOnboarding));
router.post('/me/phone/send-otp', authenticate, requireRole('TENANT'), handler(TenantController.sendPhoneOtp));
router.post('/me/phone/verify-otp', authenticate, requireRole('TENANT'), validate(Validators.verifyOtp), handler(TenantController.verifyPhoneOtp));
router.post('/me/documents', authenticate, requireRole('TENANT'), upload.array('files', 6), handler(TenantController.uploadDocuments));
router.delete('/me/documents', authenticate, requireRole('TENANT'), validate(Validators.deleteDocument), handler(TenantController.deleteDocument));
router.get('/me/bookings', authenticate, requireRole('TENANT'), handler(TenantController.myBookings));
router.get('/me/leases', authenticate, requireRole('TENANT'), handler(TenantController.myLeases));

export default router;
