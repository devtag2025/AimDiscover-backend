import { Router } from 'express';
import { planController } from '../controllers/index.js';
import { auth, validate, authorize } from '../middlewares/index.js';
const router = Router();

// Get all active plans (public) - paginated
router.get('/', validate.getPlans, planController.getPlans);

// Get single plan by ID (public)
router.get('/:planId', planController.getPlanById);

// ===== PROTECTED ROUTES =====
router.use(auth);

// Plan management (admin only)
router.post('/',authorize(['admin']),validate.createPlan, planController.createPlan);
router.put('/:planId', authorize(['admin']), validate.updatePlan, planController.updatePlan);
router.delete('/:planId', authorize(['admin']), planController.deletePlan);



export default router;
