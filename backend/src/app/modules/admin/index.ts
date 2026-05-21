import { Router } from 'express';
import * as AdminController from './controller';
import * as Validators from './validation';
import handler from '../../utils/handler';
import { authenticate, requireRole } from '../../utils/auth';
import { validate } from '../../utils/validator';

const router = Router();

router.use(authenticate, requireRole('ADMIN'));

// Users
router.get('/users', validate(Validators.listUsers, 'query'), handler(AdminController.listUsers));
router.get('/users/:id', handler(AdminController.getUserDetail));
router.put('/users/:id/verify', validate(Validators.verifyUser), handler(AdminController.verifyUser));
router.put('/users/:id/toggle-active', handler(AdminController.toggleUserActive));

// Properties
router.get('/properties', validate(Validators.listProperties, 'query'), handler(AdminController.listProperties));
router.put('/properties/:id/verify', validate(Validators.verifyProperty), handler(AdminController.verifyProperty));
router.delete('/properties/:id', handler(AdminController.deleteProperty));

// Fees
router.get('/fees', handler(AdminController.listFees));
router.post('/fees', validate(Validators.createFee), handler(AdminController.createFee));
router.put('/fees/:id', validate(Validators.updateFee), handler(AdminController.updateFee));
router.delete('/fees/:id', handler(AdminController.deleteFee));

// Analytics
router.get('/analytics/overview', handler(AdminController.overview));
router.get('/analytics/revenue', handler(AdminController.revenue));
router.get('/analytics/landlords', handler(AdminController.landlordAnalytics));
router.get('/analytics/tenants', handler(AdminController.tenantAnalytics));

export default router;
