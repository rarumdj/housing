import { Router } from 'express';
import multer from 'multer';
import * as LandlordController from './controller';
import * as Validators from './validation';
import handler from '../../utils/handler';
import { authenticate, requireRole } from '../../utils/auth';
import { validate } from '../../utils/validator';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

const router = Router();
const landlordOnly = [authenticate, requireRole('LANDLORD')];

router.get('/me', ...landlordOnly, handler(LandlordController.me));
router.put('/me', ...landlordOnly, validate(Validators.update), handler(LandlordController.updateMe));
router.get('/me/tenants', ...landlordOnly, handler(LandlordController.tenants));
router.get('/me/bookings', ...landlordOnly, handler(LandlordController.bookings));

// ── Onboarding ──
router.get('/me/onboarding', ...landlordOnly, handler(LandlordController.getOnboarding));
router.put('/me/onboarding', ...landlordOnly, validate(Validators.onboarding), handler(LandlordController.saveOnboarding));
router.post('/me/onboarding/complete', ...landlordOnly, validate(Validators.onboarding), handler(LandlordController.completeOnboarding));
router.post('/me/phone/send-otp', ...landlordOnly, handler(LandlordController.sendPhoneOtp));
router.post('/me/phone/verify-otp', ...landlordOnly, validate(Validators.verifyOtp), handler(LandlordController.verifyPhoneOtp));
router.post('/me/payout/connect', ...landlordOnly, validate(Validators.connectPayout), handler(LandlordController.connectPayout));
router.post('/me/documents', ...landlordOnly, upload.array('files', 6), handler(LandlordController.uploadDocuments));
router.delete('/me/documents', ...landlordOnly, validate(Validators.deleteDocument), handler(LandlordController.deleteDocument));

router.post('/leases/:id/terminate', ...landlordOnly, handler(LandlordController.terminateLease));

export default router;
