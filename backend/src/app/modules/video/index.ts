import multer from 'multer';
import { Router } from 'express';
import * as VideoController from './controller';
import * as Validators from './validation';
import handler from '../../utils/handler';
import { authenticate, requireRole } from '../../utils/auth';
import { validate } from '../../utils/validator';

const router = Router({ mergeParams: true });
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

router.post('/session', authenticate, requireRole('LANDLORD'), handler(VideoController.createSession));
router.post(
  '/upload',
  authenticate,
  requireRole('LANDLORD'),
  upload.single('video'),
  validate(Validators.upload),
  handler(VideoController.upload),
);

export default router;
