// routes/index.js
import { Router } from "express";
import authRoutes from "./auth.route.js";
import planRoutes from "./plan.route.js";
import subscriptionRoutes from "./subscription.route.js";
import categoryRoutes from './category.route.js'
import analysisRoutes from './analysis.route.js'
import webhookRoutes from './webhook.route.js';
import promptRoutes from "./prompt.route.js"
import grokRoutes from './grok.route.js';
import supportRoutes from "./support.route.js"
import faqRoutes from './faq.route.js'
const router = Router();

router.use("/auth", authRoutes);
router.use("/plans", planRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/categories", categoryRoutes);
router.use("/analysis", analysisRoutes);
// router.use("/webhook",webhookRoutes);
router.use("/grok",grokRoutes);
router.use("/support",supportRoutes);
router.use("/faq",faqRoutes);
router.use("/prompt",promptRoutes)
router.get("/", (_req, res) => {
  res.send("Welcome to the AimDiscover API - AI-powered product discovery platform");
});
router.get("/docs", (_req, res) => {
  res.send("API Documentation will be available here soon.");
});
export default router;
