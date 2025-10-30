import { Router } from 'express';
import { subscriptionController } from '../controllers/index.js';
import { auth, validate } from '../middlewares/index.js';

const router = Router();

// ===== PROTECTED ROUTES =====
router.use(auth);

// ===== USER SUBSCRIPTION ROUTES =====

// Create checkout session for plan
router.post('/checkout', subscriptionController.createCheckout);


export default router;
