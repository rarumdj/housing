import { Router } from 'express';
import * as MessageController from './controller';
import * as Validators from './validation';
import handler from '../../utils/handler';
import { authenticate } from '../../utils/auth';
import { validate } from '../../utils/validator';

const router = Router();

router.get('/conversations', authenticate, handler(MessageController.conversations));
router.get('/conversations/:recipientId', authenticate, validate(Validators.thread, 'query'), handler(MessageController.thread));
router.get('/unread-count', authenticate, handler(MessageController.unreadCount));
router.post('/', authenticate, validate(Validators.send), handler(MessageController.send));
router.put('/:id/read', authenticate, handler(MessageController.markRead));

export default router;
