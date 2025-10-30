import { Router } from 'express';
import express from 'express';
import { webhookController } from '../controllers/index.js';

const router = Router();

// Stripe webhook endpoint
router.post('/stripe', express.raw({ type: "application/json" }), webhookController.handleStripeWebhook);
export default router;
