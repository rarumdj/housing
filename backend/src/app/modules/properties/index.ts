import { Router } from 'express';
import * as PropertyController from './controller';
import * as Validators from './validation';
import handler from '../../utils/handler';
import { authenticate, requireRole } from '../../utils/auth';
import { validate } from '../../utils/validator';

const router = Router();

router.get('/', validate(Validators.search, 'query'), handler(PropertyController.search));
router.get('/my/list', authenticate, requireRole('LANDLORD'), handler(PropertyController.myProperties));
router.get('/:id', handler(PropertyController.getById));

router.post('/', authenticate, requireRole('LANDLORD'), validate(Validators.create), handler(PropertyController.create));
router.put('/:id', authenticate, requireRole('LANDLORD'), validate(Validators.update), handler(PropertyController.update));
router.post('/:id/publish', authenticate, requireRole('LANDLORD'), handler(PropertyController.publish));
router.post('/:id/rooms', authenticate, requireRole('LANDLORD'), validate(Validators.room), handler(PropertyController.addRoom));

export default router;
