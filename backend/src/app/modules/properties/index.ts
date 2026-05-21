import { Router } from 'express';
import multer from 'multer';
import * as PropertyController from './controller';
import * as Validators from './validation';
import handler from '../../utils/handler';
import { authenticate, requireRole } from '../../utils/auth';
import { validate } from '../../utils/validator';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

const router = Router();

router.get('/', validate(Validators.search, 'query'), handler(PropertyController.search));
router.get('/my/list', authenticate, requireRole('LANDLORD'), handler(PropertyController.myProperties));
router.get('/:id', handler(PropertyController.getById));
router.get('/:id/fees', handler(PropertyController.getFees));
router.get('/:id/activity', authenticate, requireRole('LANDLORD'), handler(PropertyController.getActivity));

router.post('/', authenticate, requireRole('LANDLORD'), validate(Validators.create), handler(PropertyController.create));
router.put('/:id', authenticate, requireRole('LANDLORD'), validate(Validators.update), handler(PropertyController.update));
router.delete('/:id', authenticate, requireRole('LANDLORD'), handler(PropertyController.deleteProperty));
router.post('/:id/publish', authenticate, requireRole('LANDLORD'), handler(PropertyController.publish));
router.post('/:id/rooms', authenticate, requireRole('LANDLORD'), validate(Validators.room), handler(PropertyController.addRoom));

router.post('/:id/media', authenticate, requireRole('LANDLORD'), upload.array('files', 10), handler(PropertyController.uploadMedia));
router.delete('/:id/media/:mediaId', authenticate, requireRole('LANDLORD'), handler(PropertyController.deleteMedia));
router.put('/:id/media/:mediaId/cover', authenticate, requireRole('LANDLORD'), handler(PropertyController.setCoverMedia));

export default router;
