import { Router } from 'express';
import express from 'express';
import { webhookController } from '../controllers/index.js';
import { handleMeshyWebhook } from '../controllers/webhook.controller.js'
const router = Router();

// Stripe webhook endpoint
router.post('/stripe', express.raw({ type: "application/json" }), webhookController.handleStripeWebhook);
router.post('/meshy', express.raw({ type: 'application/json' }),handleMeshyWebhook)


export default router;
