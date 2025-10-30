import { Router } from 'express';
import { planController } from '../controllers/index.js';
import { auth, validate, authorize } from '../middlewares/index.js';
const router = Router();

// Get all active plans (public) - paginated
router.get('/', validate.getPlans, planController.getPlans);

// Get single plan by ID (public)
router.get('/:planId', validate.planId, planController.getPlanById);

// ===== PROTECTED ROUTES =====
router.use(auth);

// Plan management (admin only)
router.post('/', authorize(['admin']), validate.createPlan, planController.createPlan);
router.put('/:planId', authorize(['admin']), validate.planId, validate.updatePlan, planController.updatePlan);
router.delete('/:planId', authorize(['admin']), validate.planId, planController.deletePlan);

// Subscription analytics (admin only)
router.get('/subscriptions', authorize(['admin']), validate.getSubscriptions, planController.getSubscriptions);
router.get('/analytics', authorize(['admin']), planController.getAnalytics);


// Update user subscription (admin only)
router.put('/users/:userId/subscription', authorize(['admin']), validate.userId, validate.updateUserSubscription, planController.updateUserSubscription);

export default router;
